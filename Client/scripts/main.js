//
//  main.js
//
//  A project template for using arbor.js
//

(function($){

    var Renderer = function(canvas){
      var canvas = $(canvas).get(0)
      var ctx = canvas.getContext("2d");
      var particleSystem
      // helpers for figuring out where to draw arrows (thanks springy.js)
  	var intersect_line_line = function(p1, p2, p3, p4)
  	{
  		var denom = ((p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y));
  		if (denom === 0) return false // lines are parallel
  		var ua = ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) / denom;
  		var ub = ((p2.x - p1.x)*(p1.y - p3.y) - (p2.y - p1.y)*(p1.x - p3.x)) / denom;

  		if (ua < 0 || ua > 1 || ub < 0 || ub > 1)  return false
  		return arbor.Point(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
  	}
    var gfx = arbor.Graphics(canvas);
  	var intersect_line_box = function(p1, p2, boxTuple)
  	{
  	  var p3 = {x:boxTuple[0], y:boxTuple[1]},
      	  w = boxTuple[2],
      	  h = boxTuple[3]
  	  
  		var tl = {x: p3.x, y: p3.y};
  		var tr = {x: p3.x + w, y: p3.y};
  		var bl = {x: p3.x, y: p3.y + h};
  		var br = {x: p3.x + w, y: p3.y + h};

      return intersect_line_line(p1, p2, tl, tr) ||
             intersect_line_line(p1, p2, tr, br) ||
             intersect_line_line(p1, p2, br, bl) ||
             intersect_line_line(p1, p2, bl, tl) ||
             false
  	}
  
      var that = {
        init:function(system){
          //
          // the particle system will call the init function once, right before the
          // first frame is to be drawn. it's a good place to set up the canvas and
          // to pass the canvas size to the particle system
          //
          // save a reference to the particle system for use in the .redraw() loop
          particleSystem = system
  
          // inform the system of the screen dimensions so it can map coords for us.
          // if the canvas is ever resized, screenSize should be called again with
          // the new dimensions
          particleSystem.screenSize(canvas.width, canvas.height) 
          particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side
          
          // set up some event handlers to allow for node-dragging
          that.initMouseHandling()
        },
        
        redraw:function(){
          // 
          // redraw will be called repeatedly during the run whenever the node positions
          // change. the new positions for the nodes can be accessed by looking at the
          // .p attribute of a given node. however the p.x & p.y values are in the coordinates
          // of the particle system rather than the screen. you can either map them to
          // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
          // which allow you to step through the actual node objects but also pass an
          // x,y point in the screen's coordinate system
          // 
          var nodeBoxes = {}
          ctx.fillStyle = "white"
          ctx.fillRect(0,0, canvas.width, canvas.height)
          
          particleSystem.eachNode(function(node, pt){
            // node: {mass:#, p:{x,y}, name:"", data:{}}
            // pt:   {x:#, y:#}  node position in screen coords
  
            // draw a rectangle centered at pt
            var label = node.name||""
            var w = ctx.measureText(""+label).width + 10
            if (!(""+label).match(/^[ \t]*$/)){
              pt.x = Math.floor(pt.x)
              pt.y = Math.floor(pt.y)
            }else{
              label = null
            }
            
            //console.log(node);
            // ctx.font = "12px Helvetica"
            // ctx.textAlign = "center"
            // ctx.fillStyle = "white"
            //ctx.fillText(node.name||"", pt.x, pt.y+4)
            
            ctx.fillStyle = (node.data.is_final_state) ? (node.data.color ? node.data.color :"orange") : "black";
            gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {fill:ctx.fillStyle});
            //gfx.text(node.name||"", pt.x, pt.y+4);
            ctx.font = "12px Helvetica"
            ctx.textAlign = "center"
            ctx.fillStyle = "white"
            // ctx.fillStyle = '#333333'
            ctx.fillText(label||"", pt.x, pt.y+4)
            ctx.fillText(label||"", pt.x, pt.y+4)
            nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22];
          })  
          particleSystem.eachEdge(function(edge, pt1, pt2){
            // edge: {source:Node, target:Node, length:#, data:{}}
            // pt1:  {x:#, y:#}  source position in screen coords
            // pt2:  {x:#, y:#}  target position in screen coords
  
            // draw a line from pt1 to pt2
            ctx.strokeStyle = "rgba(0,0,0, .333)"
            // ctx.lineWidth = 2
            // ctx.beginPath()
            // ctx.moveTo(pt1.x, pt1.y)
            // ctx.lineTo(pt2.x, pt2.y)
            // ctx.stroke()
            var tail = intersect_line_box(pt1, pt2, nodeBoxes[edge.source.name])
            var head = intersect_line_box(tail, pt2, nodeBoxes[edge.target.name])
            
            ctx.save() 
              ctx.beginPath()
              // if (color) trace(color)
              ctx.fillStyle = null
              ctx.fillText (edge.data.name, (pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
              ctx.moveTo(tail.x, tail.y)
              ctx.lineTo(head.x, head.y)
              ctx.stroke()
            ctx.restore()
            

            ctx.fillStyle = "black";
            ctx.font = 'italic 13px sans-serif';
            

            if (edge.data.directed){
              ctx.save()
              // move to the head position of the edge we just drew
              var wt = 1;
              var arrowLength = 6 + wt;
              var arrowWidth = 2 + wt;
              ctx.fillStyle = ctx.strokeStyle
              ctx.translate(head.x, head.y);
                ctx.rotate(Math.atan2(head.y - tail.y, head.x - tail.x));
                
                // delete some of the edge that's already there (so the point isn't hidden)
                ctx.clearRect(-arrowLength/2,-wt/2, arrowLength/2,wt)
                
                // draw the chevron
                ctx.beginPath();
                
                ctx.moveTo(-arrowLength, arrowWidth);
                ctx.lineTo(0, 0);
                ctx.lineTo(-arrowLength, -arrowWidth);
                ctx.lineTo(-arrowLength * 0.8, -0);
                ctx.closePath();
                ctx.fill();
              ctx.restore()
            }
          })
  
      		particleSystem.parameters({friction:'1.0'});	
        },
        
        initMouseHandling:function(){
          // no-nonsense drag and drop (thanks springy.js)
          var dragged = null;
  
          // set up a handler object that will initially listen for mousedowns then
          // for moves and mouseups while dragging
          var handler = {
            clicked:function(e){
              var pos = $(canvas).offset();
              _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
              dragged = particleSystem.nearest(_mouseP);
  
              if (dragged && dragged.node !== null){
                // while we're dragging, don't let physics move the node
                dragged.node.fixed = true
              }
  
              $(canvas).bind('mousemove', handler.dragged)
              $(window).bind('mouseup', handler.dropped)
  
              return false
            },
            dragged:function(e){
              var pos = $(canvas).offset();
              var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
  
              if (dragged && dragged.node !== null){
                var p = particleSystem.fromScreen(s)
                dragged.node.p = p
              }
  
              return false
            },
  
            dropped:function(e){
              if (dragged===null || dragged.node===undefined) return
              if (dragged.node !== null) dragged.node.fixed = false
              dragged.node.tempMass = 1000
              dragged = null
              $(canvas).unbind('mousemove', handler.dragged)
              $(window).unbind('mouseup', handler.dropped)
              _mouseP = null
              return false
            }
          }
          
          // start listening
          $(canvas).mousedown(handler.clicked);
  
        },
        
      };
      return that;
    }    
  
    $(document).ready(function(){
      var sys = arbor.ParticleSystem() // create the system with sensible repulsion/stiffness/friction
      sys.parameters({gravity:false,friction:1, stiffness:600, repulsion:2600}) // use center-gravity to make the graph settle nicely (ymmv)
      sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...
  
      // add some nodes to the graph and watch it go...
      var node_graph = {
        dfa : [{
          transition_to : 'p1',
          transition_from : 'p2',
          character : 'a',
          is_final_state : false
        },
        {
          transition_to : 'p3',
          transition_from : 'p1',
          character : 'b',
          is_final_state : false
        },
        {
          transition_to : 'p5',
          transition_from : 'p3',
          character : 'c',
          is_final_state : false
        },
        {
          transition_to : 'p4',
          transition_from : 'p5',
          character : 'd',
          is_final_state : true
        }],

        transitions :[{
          transition_to : 'p1',
          transition_from : 'p2',
          character : 'a',
          is_final_state : false
        },
        {
          transition_to : 'p3',
          transition_from : 'p1',
          character : 'b',
          is_final_state : false
        },
        {
          transition_to : 'p5',
          transition_from : 'p3',
          character : 'c',
          is_final_state : false
        },
        {
          transition_to : 'p4',
          transition_from : 'p5',
          character : 'd',
          is_final_state : true
        }],
        
      };
      var created_edges = [];
      node_graph.dfa.forEach(function(node_transition){
        console.log(node_transition);
        var transition_from = sys.getNode(node_transition.transition_from) ? sys.getNode(node_transition.transition_from) : sys.addNode(node_transition.transition_from,{is_final_state:node_transition.is_final_state});
        var transition_to = sys.getNode(node_transition.transition_to) ? sys.getNode(node_transition.transition_to) : sys.addNode(node_transition.transition_to,{is_final_state:node_transition.is_final_state});
        var edge = sys.addEdge(transition_from,transition_to,{symbol:node_transition.character,name:node_transition.character,directed :true});
        created_edges.push(edge);
      });

      
      document.getElementById('play_graph').addEventListener('click',function(){
        console.log("Running Tweening ")
        node_graph= this.node_graph;
        var sleep = function(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        };
        sys = this.sys;
        node_graph.transitions.forEach(async function(node_transition){
          var transition_from = sys.getNode(node_transition.transition_from) ? sys.getNode(node_transition.transition_from) : sys.addNode(node_transition.transition_from,{is_final_state:node_transition.is_final_state});
          var transition_to = sys.getNode(node_transition.transition_to) ? sys.getNode(node_transition.transition_to) : sys.addNode(node_transition.transition_to,{is_final_state:node_transition.is_final_state});
          sys.tweenNode(transition_from,2,{color:'red'})
          await sleep(2000);
          console.log("Tweening Node :",node_transition.transition_from)
          possible_edges = sys.getEdges(transition_from,transition_to);
          setTimeout(2000);
          sys.tweenEdge(possible_edges[0],2,{color:'red'})
          setTimeout(2000);
          sys.tweenNode(transition_to,2,{color:'red'})

          //TODO : Figure the Transition Tweenning and Changing of colours. 

          //TODO : Figure the mixing of the C++ Transition and DFA Generator Graphs. 

          
        });
      }.bind({sys:sys,node_graph:node_graph}));
      // E1 = sys.addEdge('a','b',{name:1})
      // sys.addEdge('a','c',{name:2})
      // sys.addEdge('a','d',{name:3})
      // sys.addEdge('a','e',{name:4})
      // e3 = sys.addNode('f', {alone:true, mass:.25,color:"#00ff00", radius:1})

      // sys.tweenNode(e3, 3, {color:"red", radius:4});
      // console.log("Tweening Done ");
      // or, equivalently:
      //
      // sys.graft({
      //   nodes:{
      //     f:{alone:true, mass:.25}
      //   }, 
      //   edges:{
      //     a:{ b:{},
      //         c:{},
      //         d:{},
      //         e:{}
      //     }
      //   }
      // })
      
    });
  
  })(this.jQuery);