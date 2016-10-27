var w = $("#forcegraph").innerWidth(),
    h = w;
var r = 10*w/1600;
selected_one="appendicitis"
//var clicked = ["me","education","biology", "computing"];

color = d3.scale.category20c();

var force = d3.layout.force()
    .charge(function(d){ return  -50*r ;})
    .linkStrength(5)
    .linkDistance(function(d) {return 90;})
    .size([w, h]);

var vis = d3.select("#forcegraph").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

d3.csv("js/graph.csv", function(links) {
  var nodesByName = {};

  // Create nodes for each unique source and target.
  links.forEach(function(link) {
    link.target = nodeByNamePlus(link.target,link.size,link.source,link.accuracy,link.words);
    link.source = nodeByNamePlus(link.source,link.size,link.source,link.accuracy,link.words);
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
      .on("click",click);
      // .call(force.drag);

  var clip = vis.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:circle")
        .attr("id", "clip-rect")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r)
        .attr("stroke","black");

  circles = node.append("circle")
            .attr("r", r)
            .style("fill", function(d) { return color(d.name); });
  // node.append("image")
  //   .attr("xlink:href", function(d) { return d.im ? d.im : "";})
  //   .attr("x",-r)
  //   .attr("y",-r)
  //   .attr("width", 2*r)
  //   .attr("height", 2*r)
  //   .attr("clip-path","url(#clip)")
  //   .attr("title",function(d) {return d.desc ? d.desc  : "";});

  text=node.append("text")
  .style("font-size",function(d) {
    if(d.name==selected_one){
      return "24px";
    }else{
      return "12px";
    }
  })
    .attr("dx", function(d) {
      if(d.name==selected_one){
        return -d.name.length*3.5*2;
      }else{
        return -d.name.length*3.5;
      }
    })
  .attr("dy", function(d) {
    if(d.name==selected_one){
      return 2*r+24;
    }else{
      return r+10;
    }
  })
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

    node.attr("transform", function(d) {
        if(d.name==selected_one){
          d.y += (h/2 - d.y) * 0.4
          d.x += (w/2 - d.x) * 0.4
        }

        d.x = Math.max(4*r, Math.min(w - 4*r, d.x));
        d.y = Math.max(r, Math.min(h - 2*r, d.y));

        return "translate(" + d.x + "," + d.y + ")";
      });

    link.style("opacity",function(d) { return Math.min(d.target.trans,d.source.trans);  });
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

  }

  function click(d) {
    selected_one=d.name
    showWords(d.words)
    force.alpha(0.1);
  }

  function showWords(words){
    console.log(words)
    txt = '<h4>Predictive Words</h4><ul class="list-group">'
    toward =  words.split(";")
    for (inder in toward){
      txt = txt+'<li class="list-group-item"  }}">'+toward[inder]+'</li>'
    }
    txt = txt+'</ul>'
    $("#wordlist").html(txt);

    circles.attr("r", function(d) {
      if(d.name==selected_one){
        return 2*r
      }else{
        return r;
      }
    });
    text.style("font-size",function(d) {
      if(d.name==selected_one){
        return "24px";
      }else{
        return "12px";
      }
    })
      .attr("dx", function(d) {
        if(d.name==selected_one){
          return -d.name.length*3.5*2;
        }else{
          return -d.name.length*3.5;
        }
      })
    .attr("dy", function(d) {
      if(d.name==selected_one){
        return 2*r+24;
      }else{
        return r+10;
      }
    });

    // .style("stroke", function(d) {
    //   if(d.name==selected_one){
    //     return "#FF6600"
    //   }else{
    //     return 0;
    //   }
    // })
    force.alpha(0.1);
  }

  function nodeByNamePlus(name,size,src,acc,wrd) {
    return nodesByName[name] || (nodesByName[name] = {name: name, size: size, src: src, accuracy: acc, words: wrd});
  }
});

$( window ).resize(function() {
    w = $("#forcegraph").innerWidth();
    force.size([w, h ]);
    vis.attr("width", w);
});
