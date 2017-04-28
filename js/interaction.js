function handleInteraction(cvs, draw) {
  var resinput = document.getElementById('pwmres');
  var timeinput = document.getElementById('time');
  var pointsinput = document.getElementById('points');
  var points = pointsinput.value;
  var time = timeinput.value;
  var res = resinput.value;
  var util = lg.curves[0].getUtils();

  lg.curves[0].update()
  updateLUT(lg)

  pointsinput.addEventListener('input', function(evt){
    points = pointsinput.value;
    updateLUT(lg)
  })

  timeinput.addEventListener('input', function(evt){
    time = timeinput.value;
  })

  resinput.addEventListener('input', function(evt){
    res = resinput.value
    updateLUT(lg)
  })

  var fix = function(e) {
    // e = e || window.event;
    var target = e.target || e.srcElement,
        rect = target.getBoundingClientRect();
    e.offsetX = e.clientX - rect.left;
    e.offsetY = e.clientY - rect.top;
  };

  var moving = false, mx = my = ox = oy = 0, cx, cy, mp = false;

  var handler = { onupdate: function() {} };

  cvs.addEventListener("mousedown", function(evt) {
    console.log("mousedown")
    fix(evt);
    mx = evt.offsetX;
    my = evt.offsetY;
    for(l of lg.curves){
      for(var p of l.points){
        if(Math.abs(mx-p.x)<10 && Math.abs(my-p.y)<10) {
          moving = true;
          mp = [p];
          cx = p.x;
          cy = p.y;
        }
      }
    }
  });

  cvs.addEventListener("dblclick", function(evt) {
    console.log('dblclick')
    fix(evt);
    var lx = evt.offsetX;
    var ly = evt.offsetY;
    //keep track of the closest t, and closest curve
    var tmin=undefined;
    var cmin
    //see if were close to a line
    for(c of lg.curves){
      var t = c.project({x:lx,y:ly})
      var lp = c.get(t)
      console.log(t)
      if(!tmin || t.d<10){
        tmin = t
        cmin=c
      }  
    }

    if(tmin.d<10){
      lg.split(cmin,tmin);
    }
    draw.draw(lg)
    //this prevents 
    window.getSelection().removeAllRanges();
  })

  cvs.addEventListener("mousemove", function(evt) {
    fix(evt);
    var closestPoint ;
    var dist=10
    var lx = evt.offsetX;
    var ly = evt.offsetY;

    updateLUT(lg)

    if(!moving){
      for(c of lg.curves){
        // just in case we don't have any points in a curve
        if(!c.points) continue;
        //see if were close to a point on the line
        for (p of c.points) {
          var tdist = util.dist({x:lx, y:ly}, p);
          if(tdist <= dist) {
            closestPoint = p
            dist =tdist
            p.selected = true;
          }
          else 
            p.selected = false;
        }
      };
      cvs.style.cursor = closestPoint ? "crosshair" : "default";
    }

    ox = evt.offsetX - mx;
    oy = evt.offsetY - my;
    for(p of mp){
      p.x = cx + ox;
      p.y = cy + oy;
    }
    draw.draw(lg)
  });

  cvs.addEventListener("mouseup", function(evt) {
    if(!moving) return;
    // console.log(curve.points.map(function(p) { return p.x+", "+p.y; }).join(", "));
    moving = false;
    mp = [];
  });

  cvs.addEventListener("click", function(evt) {
    fix(evt);
    var mx = evt.offsetX;
    var my = evt.offsetY;
  });

  return handler;
}