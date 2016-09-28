force = d3.layout.force()
selected_one=""
vis = d3.select("#conditiongraph")
r=1
circles=vis.selectAll("circle")
text=vis.selectAll("text")
function conditions_appear(conditions,probs){

  $("#conditiongraph").empty()
      var w = $("#conditiongraph").innerWidth(),
        h = w/2;
    r = w/40;
    var ord=0;
    //var clicked = ["me","education","biology", "computing"];

    var color = d3.scale.linear()
    .domain([0, 1])
    .range(["#003366", "#FF6600"]);

    force = d3.layout.force()
        .gravity(0)
        .charge(function(d){ return  -150*r ;})
        .linkStrength(6)
        .linkDistance(function(d) {return 80;})
        .size([w, h]);

    vis = d3.select("#conditiongraph").append("svg:svg")
            .attr("width", w)
            .attr("height", h);

    d3.csv('/similarity?'+$.param({condition:conditions,probs:probs}), function(links) {
      var nodesByName = {};

      // Create nodes for each unique source and target.
      links.forEach(function(link) {
        link.target = nodeByName(link.target,link.sim);
        link.source = nodeByName(link.source,link.sim);
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
//          .call(force.drag);

      var clip = vis.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:circle")
            .attr("id", "clip-rect")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", r)
            .attr("stroke","black");

      circles=node.append("circle")
      .attr("r", function(d) {
        if(d.name==selected_one){
          return 2*r
        }else{
          return r;
        }
      })
      .style("fill", function(d) { return color(d.ord); });
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


        node.style("opacity",function(d) {
            d.trans = 1;
            //if(clicked.indexOf(d.src)>-1) d.trans = 1;
            return d.trans;
          });


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
        select_condition(d.name)
      }

      function nodeByName(name,sim) {
        if(nodesByName[name]){
          return nodesByName[name];
        }else{
          ord=ord+1;
          return  (nodesByName[name] = {name: name, sel: 0, ord: sim});
        }

      }

    });

    $( window ).resize(function() {
        w = $("#conditiongraph").innerWidth();
        force.size([w, h ]);
        vis.attr("width", w);
    });
    //setInterval(function(){force.alpha(0.1);},1000);
  }

  function select_condition(cond){
    selected_one=cond;
    $(".list-group-item").removeClass('active');
    $("#list_"+cond.split(' ').join('_')).addClass('active');

    $.ajax({
        url:'statistics',
        type:'post',
        //data:$('form').serialize()+'&condition='+cond,
        data:'condition='+cond,
        success:function(data){
          $("#stattitle").html(cond+" facts");
          $("#statspot").html(data);
        }
    });
    $.ajax({
        url:'experiences',
        type:'post',
        //data:$('form').serialize()+'&condition='+cond,
        data:$('form').serialize(),
        success:function(data){
          $("#simexp").html(data);
        }
    });
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

  $('form').submit(function(e){
  	$("#main").css('display','block')
  	  e.preventDefault();
  		$.ajax({
          url:'symptoms',
          type:'post',
          data:$('form').serialize(),
          success:function(data){
  					cond=data['conditions']
            prob=data['probs']
  					conditions_appear(cond.join(";"),prob.join(';'))
            $("#conditionlist").html(data['conditionlist']);
            $("#conditionlist li").each(function()
             {
                $(this).on("click",function()
                {
                  select_condition($(this).html());
                });
             });
            select_condition(cond[0])


  				}
      });
  });
