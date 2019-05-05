// @TODO: YOUR CODE HERE!
  var svgWidth = 960;
  var svgHeight = 600;
  
  var margin = {
    top: 80,
    right: 40,
    bottom: 150,
    left: 100
  };
  
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  
  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  
  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

 // initial tooltip
  var toolTip = d3.tip();

  var circleRadius = 10;
  


  
  // function used for updating x-scale var upon click on axis label
  function getXScale(csvData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
        d3.max(csvData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }
  // function used for updating y-scale var upon click on axis label
  function getYScale(csvData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(csvData, d => d[chosenYAxis])])
      .range([height, 0]);

    return yLinearScale;
  
  }
  
  
  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale,newYScale, chosenXAxis,chosenYAxis) {
  
    /* circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis])); */

    d3.selectAll("circle").each(function() {
        // Each state circle gets a transition for it's new attribute.
        // This will lend the circle a motion tween
        // from it's original spot to the new location.
        d3
          .select(this)
          .transition()
          .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]))
          .duration(1000);
      });

      // We need change the location of the state texts, too.
      d3.selectAll(".stateText").each(function() {
        // We give each state text the same motion tween as the matching circle.
        d3
          .select(this)
          .transition()
          .attr("dx", d => newXScale(d[chosenXAxis]))
          .attr("dy", d => newYScale(d[chosenYAxis])+ circleRadius / 2.5)
          .duration(1000);
      });

  
    return circlesGroup;
  }

  
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  
    if (chosenXAxis === "poverty") {
        var line1Label = "Poverty (%):";
    }
    else if (chosenXAxis === "age") {
        var line1Label = "Age:";
    }
    else//"income"
    {
        var line1Label = "Income ($):";
    }
    
    if (chosenYAxis === "healthcare") {
        var line2Label = "Healthcare (%):";
    }
    else if (chosenYAxis === "obesity") {
        var line2Label = "Obesity (%):";
    }
    else//"smokes"
    {
        var line2Label = "Smokes (%):";
    }
  
    toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(d =>`${d.state}<br>${line1Label} ${d[chosenXAxis]} <br>${line2Label} ${d[chosenYAxis]}`);
  
    chartGroup.call(toolTip);
  
    return circlesGroup;
  }
  
  // Retrieve data from the CSV file and execute everything below
  d3.csv("./assets/data/data.csv").then(csvData => {
  
    // parse data
    csvData.forEach(data => {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;

      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;

    });
  
    // xLinearScale function above csv import
    var xLinearScale = getXScale(csvData, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = getYScale(csvData, chosenYAxis);
    
    
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);
  
   
    var circlesGroup = chartGroup.append("g").selectAll("circle").data(csvData).enter()
    circlesGroup
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", circleRadius)
        .attr("class", d=>"stateCircle " + d.abbr)
        .on("mouseover", function(d) {toolTip.show(d, this);d3.select(this).style("stroke", "#323232");})
        .on("mouseout", function(d) {toolTip.hide(d);d3.select(this).style("stroke", "#e3e3e3");});
    circlesGroup
        .append("text")//Circle state text in the middle
        .text(d=>d.abbr)
        .attr("dx", d=> xLinearScale(d[chosenXAxis]))
        .attr("dy", d=> yLinearScale(d[chosenYAxis]) + circleRadius / 2.5)
        .attr("font-size", circleRadius)
        .attr("class", "stateText")
        .on("mouseover", function(d) {toolTip.show(d, this);d3.select("." + d.abbr).style("stroke", "#323232");})
        .on("mouseout", function(d) {toolTip.hide(d);d3.select("." + d.abbr).style("stroke", "#e3e3e3");}); 
     
  
    // Create group for 2 x-axis labels
    var labelsXGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsXGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty");
  
    var ageLabel = labelsXGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");
    
    var incomeLabel = labelsXGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
  
    // append y axis
    var labelsYGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)");

    var healthcareLabel = labelsYGroup.append("text")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Heathcare (%)");

    var smokesLabel = labelsYGroup.append("text")
      .attr("y", 20 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = labelsYGroup.append("text")
      .attr("y", 40 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    labelsXGroup.selectAll("text").on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = getXScale(csvData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale,chosenXAxis,chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if(chosenXAxis === "income"){
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
    labelsYGroup.selectAll("text").on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
  
          // replaces chosenYAxis with value
          chosenYAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = getYScale(csvData, chosenYAxis);
  
          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);
  
          // updates circles with new x y values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale,chosenXAxis,chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenYAxis === "obesity") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if(chosenYAxis === "smokes"){
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });
  });
  