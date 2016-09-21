var w = $("#forcegraph").innerWidth(),
    h = w;
var r = 10*w/800;

//var clicked = ["me","education","biology", "computing"];

color = d3.scale.category20c();

var force = d3.layout.force()
    .charge(function(d){ return  -30*r ;})
    .linkStrength(0.2)
    .linkDistance(function(d) {return 0.01/d.strength;})
    .size([w, h]);

var vis = d3.select("#forcegraph").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

d3.csv("js/graph.csv", function(links) {
  var nodesByName = {};

  // Create nodes for each unique source and target.
  links.forEach(function(link) {
    link.target = nodeByNamePlus(link.target,link.size,link.source,link.desc,link.strength);
    link.source = nodeByName(link.source);
  });
   // Extract the array of nodes from the map by name.
  var nodes = d3.values(nodesByName);

  // Create the link lines.
  var link = vis.selectAll(".link")
      .data(links)
    .enter().append("line")
      .attr("class", "link");

  // Create the node circles.
  var node = vis.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .on("click",click)
      .call(force.drag);

  var clip = vis.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:circle")
        .attr("id", "clip-rect")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r)
        .attr("stroke","black");

  node.append("circle")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.name); });
  // node.append("image")
  //   .attr("xlink:href", function(d) { return d.im ? d.im : "";})
  //   .attr("x",-r)
  //   .attr("y",-r)
  //   .attr("width", 2*r)
  //   .attr("height", 2*r)
  //   .attr("clip-path","url(#clip)")
  //   .attr("title",function(d) {return d.desc ? d.desc  : "";});

  node.append("text")
      .attr("dx", function(d) { return -d.name.length*3.5; })
      .attr("dy", r+10)
      .text(function(d) { return d.name });

  /*
  node.append("rect")
    .attr("class","node-rect")
    .style("opacity",function(d) { if(d.src=="me" && d.name!="me") {return 0.5;} else{return 0;}  })
    .attr("x", -r)
     .attr("y", -r)
      .attr("width", 2*r)
      .attr("height", 2*r);
      */

  // Start the force layout.
  force
      .nodes(nodes)
      .links(links)
      .on("tick", tick)
      .start();

  function tick() {

    node.style("opacity",function(d) {
        d.trans = 1;
        //if(clicked.indexOf(d.src)>-1) d.trans = 1;
        return d.trans;
      });


    node.attr("transform", function(d) {
        d.x = Math.max(r, Math.min(w - 2*r, d.x));
        d.y = Math.max(r, Math.min(h - 2*r, d.y));
        // if(d.src=="me") {
        //     d.y = h/4;
        //     d.x = Math.max(w/6, Math.min(5*w/6, d.x));
        // }
        // if(d.name=="me") d.y = h/8;
        return "translate(" + d.x + "," + d.y + ")";
      });

    link.style("opacity",function(d) { return Math.min(d.target.trans,d.source.trans);  });
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

  }

  function click(d) {
  if (!d3.event.defaultPrevented) {
    var ind = clicked.indexOf(d.name);
    if(ind>0){
        clicked.splice(ind, 1)
    } else {
        clicked.push(d.name);
    }
    force.start();
    }
  }

  function nodeByName(name) {
    return nodesByName[name] || (nodesByName[name] = {name: name});
  }

  function nodeByNamePlus(name,size,src,desc,strength) {
    return nodesByName[name] || (nodesByName[name] = {name: name, size: size, src: src, desc: desc, strength: strength});
  }
});

$( window ).resize(function() {
    w = $("#forcegraph").innerWidth();
    force.size([w, h ]);
    vis.attr("width", w);
});
