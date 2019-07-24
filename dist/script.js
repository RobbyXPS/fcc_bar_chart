//define variables to base element height/width off of, there are 275 data points which is why the bars are divided by that.
var height = 400,
    width = 800,
    barWidth = width/275;

//define the SVG to draw on.
var svgContainer = d3.select('.visHolder')
  .append('svg')
  .style('background-color', '#FFF8F8')
  //add padding to height/width for axes, making it the same width as the container.
  .attr('height', height + 60)
  .attr('width', width + 100);
  
//define the element for the overlay UI that updates the bar color when hovered over.
var overlay = d3.select('.visHolder')
  .append('div')
  .attr('class', 'overlay');

//define the element for the tooltip UI that shows the user the data as text when hovered over.
var tooltip = d3.select('.visHolder')
  .append('div')
  .attr('id', 'tooltip');

//define and place the yAxis Title.
svgContainer.append('text')
  .text('Gross Domestic Product')
  .attr('transform', 'rotate(-90)')
  .attr('x', -280)
  .attr('y', 25)
  .attr('class', 'axis-label')

//define and place the xAxis Title.
svgContainer.append('text')
  .text('Years')
  .attr('x', 480)
  .attr('y', 450)
  .attr('class', 'axis-label');

//original dataset, this function is asynchronous so all code that relies on this data should be put in the callback.
d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json', function(data){
 
  //clean and group the dataset for years, convert string to date object so d3 understands how to plot the data.
  var gdpYears = data.data.map(item => new Date(item[0]));

  //define the scale for xAxis (years), these are years so time scale is appropriate.
  var xScale = d3.scaleTime()
    .domain([d3.min(gdpYears), d3.max(gdpYears)])
    .range([0, width]);
  
  //define the xAxis based on the xScale, it creates all the axis elements (axis line, axis ticks, numbers).
  var xAxis = d3.axisBottom()
    .scale(xScale);
  
  //group and draw all the xAxis elements together so they are easier to transform.
  var xAxisGroup = svgContainer.append('g')
    .call(xAxis)
    .attr('id', 'x-axis')
    .attr('transform', 'translate(80,410)')
  
  //clean and group the dataset for gdp.
  var gdp = data.data.map(item => item[1]);
  
  //create a linear scale to pass GDP data through so it fits the graph's bounds correctly.
  var linearScale = d3.scaleLinear()
    .domain([0, d3.max(gdp)])
    .range([0, height]);

  //run each GDP data point through the scale function.
  var scaledGdp = gdp.map(item => linearScale(item));
  
  //create a linear scale for the yAxis, the only difference between this and the linear GDP scale is the range is flipped so the yAxis is the correct direction.
  var yScale = d3.scaleLinear()
    .domain([0, d3.max(gdp)])
    .range([height, 0]);
  
  //define the yAxis based on Y scale.
  var yAxis = d3.axisLeft()
    .scale(yScale);
  
  //group all the yAxis elements together so they are easier to transform.
  var yAxisGroup = svgContainer.append('g')
    .call(yAxis)
    .attr('id', 'y-axis')
    .attr('transform', 'translate(80,10)');

  //for each datapoint, create a bar on the graph.
  d3.select('svg').selectAll('rect')
    //iterates over each data point and 'joins' the 'rect' element to the array item.
    .data(scaledGdp)
    //return a reference to the placeholder elements so they can then be appended.
    .enter()
    //define how to draw the element for the placeholder that was created.
    .append('rect')
    //place the origin of the bar using x/y attributes, and define it's width/height.
    .attr('x', (d, i) => xScale(gdpYears[i]))
    .attr('y', (d) => height - d)
    .attr('height', (d) => d)
    .attr('width', barWidth)
    .attr('class', 'bar')
    .attr('transform', 'translate(80, 10)')
    //apply string formatted date values as custom attribute.
    .attr('data-date', (d, i) => data.data[i][0])
    .attr('data-gdp', (d, i) => gdp[i])
    .attr('fill', '#216C2A')
    //define the behavior when users mouseover bar elements.
    .on('mouseover', function(d, i) {
      //create animation with styles for bar when user mouses over it.
      overlay.transition()
        .duration(0)
        .style('height', d + 'px')
        .style('width', barWidth + 'px')
        .style('opacity', .8)
        .style('left', (i * barWidth + 'px'))
        .style('top', height - d + 'px')
        .style('transform', 'translate(80px, 10px)')
        .style('background-color', '#d8ffde')
      //create animation with styles for tooltip UI when user mouses over bar.
      tooltip.transition()
        .duration(0)
        .style('opacity', .8)
        .style('transform', 'translate(100px, 50px)')
        .style('border', '#103816 solid 2px');
      //apply string formatted date value as tootip text.
      tooltip.html('Year: ' + data.data[i][0].split('-')[0] + '<br>' + 'Billions: $' + gdp[i])
      //apply string formatted date values as custom attribute.
        .attr('data-date', data.data[i][0])
        .style('left', (i * barWidth) + 'px')
        .style('top', height - 100 + 'px');
  })
    //define the behavior when users remove cursor from bar elements.
    .on('mouseout', function(d) {
      //remove overlay animations when user takes mouse off of the bar.
      overlay.transition()
        .duration(0)
        .style('opacity', 0)
      //remove tooltip UI when user takes mouse off of the bar.
      tooltip.transition()
        .duration(0)
        .style('opacity', 0)
  })
})