var parseDate = d3.timeParse("%Y/%m/%d");
var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 200, left: 100},
    margin2 = {top: 350, right: 20, bottom: 30, left: 100},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var tooltip = d3.select("body").append("div")
                .style("opacity","0")
                .style("position","absolute");

d3.csv("applestocks.csv")
  .row(function(d){ return {
    date: parseDate(d.date),
    price: Number(d.open),
    low: Number(d.low),
    high: Number(d.high),
    close: Number(d.close),
    volume: Number(d.volume)}; })
  .get(function(error,data){
    if (error) throw error;

    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]),
        volumee = d3.scaleLinear().range([height2,0]),
        x3 = d3.scaleBand().range([0, width]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y),
        yAxis2 = d3.axisLeft(volumee).ticks(4);

    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);
    var zoom2 = d3.zoom();
    console.log(zoom2);
        // var area = d3.area()
        //     .curve(d3.curveMonotoneX)
        //     .x(function(d) { return x(d.date); })
        //     .y0(height)
        //     .y1(function(d) { return y(d.price); });
        //
        // var area2 = d3.area()
        //     .curve(d3.curveMonotoneX)
        //     .x(function(d) { return x2(d.date); })
        //     .y0(height2)
        //     .y1(function(d) { return y2(d.price); });

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .on("mouseover",function(d){
            tooltip.style("opacity","1")
            .style("left",d3.event.pageX+"px")
            .style("top",d3.event.pageY+"px");

            tooltip.html("Number of sides: "+data.length);
         });

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    function min(a, b){ return a < b ? a : b ; }
    function max(a, b){ return a > b ? a : b; }

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent([d3.min(data,function(d){ return d.low }),
            d3.max(data,function(d){ return d.high})]));
    x2.domain(x.domain());
    y2.domain(y.domain());
    volumee.domain([0,d3.max(data, function(d){ return d.volume;})]);
    x3.domain(function(d){ return d.volume; });

  // var tooltip = d3.select("body")
  //                 .append("div")
  //                 .style("position","absolute")
  //                 .style("padding","0 10px")
  //                 .style("background","red")
  //                 .style("opacity",0.5);

  focus.selectAll("line")
    .data(data)
    .enter().append("line")
        .attr("class", "stem")
        .attr("x1", function(d) { return x(d.date) + 0.25 * (width - 2 * 50)/ data.length;})
        .attr("x2", function(d) { return x(d.date) + 0.25 * (width - 2 * 50)/ data.length;})
        .attr("y1", function(d) { return y(d.high);})
        .attr("y2", function(d) { return y(d.low); })
        .attr("stroke", function(d){ return d.price > d.close ? "red" : "green"; })
//        .transition()
//        .attr("y2", function(d) { return y(d.low); })
//        .delay(function(d,i){ return i*20; })
//        .duration(1000).ease(d3.easeBounceOut);

  focus.selectAll("rect")
        .data(data)
        .enter().append("rect")
                  .attr("class","area")
                  .attr("height",function(d){ return y(min(d.price, d.close))-y(max(d.price, d.close));})
                  .attr("width",function(d) { return 1 * (width - 2*120)/data.length; })
                  .attr("fill",function(d) { return d.price > d.close ? "red" : "green" ;})
                  .attr("x",function(d){ return x(d.date); })
                  .attr("y",function(d){ return y(max(d.price, d.close)); })
//                  .transition()
//                  .attr("height",function(d){ return y(min(d.price, d.close))-y(max(d.price, d.close)); })
//                  .delay(function(d,i){ return i*20; })

  focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

  context.selectAll("rect")
        .data(data)
        .enter().append("rect")
                  .attr("class","area")
                  .attr("height",function(d){ return  height2 - volumee(d.volume);})
                  .attr("width",function(d) { return 0.5 * (width - 2*50)/data.length; })
                  .attr("fill",function(d) { return d.price > d.close ? "red" : "green" ;})
                  .attr("x",function(d){ return x2(d.date); })
                  .attr("y",function(d){ return volumee(d.volume) ; })
//                  .transition()
//                  .attr("height",function(d){ return  height2 - volumee(d.volume); })
//                  .delay(function(d,i) {
//                    return i * 20;
//                  });

  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());


    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      var s = d3.event.selection || x2.range();
      x.domain(s.map(x2.invert, x2));
      focus.select(".axis--x").call(xAxis);
      svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
          .scale(width / (s[1] - s[0]))
          .translate(-s[0], 0));
    }

    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
      var t = d3.event.transform;
      x.domain(t.rescaleX(x2).domain());
//      y.domain(t.rescaleY(y2).domain());
      console.log(t);
      focus.selectAll(".area").attr("x",function(d){ return x(d.date); })
      .attr("y",function(d){ return y(max(d.price, d.close)); })
      .attr("height",function(d){ return y(min(d.price, d.close))-y(max(d.price, d.close)); })
      .attr("width",function(d) {   return (1 * (width - 2*120)/data.length)*t.k;
          });
      focus.selectAll(".stem")
        .attr("x1", function(d) { return (x(d.date) + (0.5 * (width - 2 * 120)/ data.length)*t.k);})
        .attr("x2", function(d) { return (x(d.date) + (0.5 * (width - 2 * 120)/ data.length)*t.k);})
        .attr("y1", function(d) { return y(d.high);})
        .attr("y2", function(d) { return y(d.low); })
      focus.select(".axis--x").call(xAxis);
//      focus.select(".axis--y").call(yAxis);
      context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }

    function type(d) {
      d.date = parseDate(d.date);
      d.price = +d.price;
      return d;
    }
});
