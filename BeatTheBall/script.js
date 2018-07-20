// Code goes here
d3.selection.prototype.size = function() {
  var n = 0;
  this.each(function() {
    ++n;
  });
  return n;
};

var level = 1;
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
  if (key == "level") {
    level = +value;
  }
});

var w = 960,
  h = 500,
  sz = 20,
  r = sz / 2,
  sr = r * r,
  ssz = sz * sz,
  v = 2,
  n = level + 1,
  t = 200;

var rows = Math.ceil(h / sz);
var cols = Math.ceil(w / sz);

var point = [20, h - 10];
var momentum = [0, 0];


var s = false;

d3.select("#nextLevelButton")
  .style("top", Math.round(h / 2 + 20) + "px")
  .style("left", Math.round(w / 2 - 50) + "px")
  .on("click", function(e) {
    window.location.href = "?level=" + (level + 1);
  });
d3.select("#playAgainButton")
  .style("top", Math.round(h / 2 + 20) + "px")
  .style("left", Math.round(w / 2 - 50) + "px")
  .on("click", function(e) {
    window.location.href = "?level=1";
  });

var cells = d3.range(0, rows * cols).map(function(d) {
  var col = d % cols;
  var row = (d - col) / cols;
  return {
    r: row,
    c: col,
    x: col * sz + r,
    y: row * sz + r
  };
});

var balls = d3.range(0, n).map(function(d) {

  var bx = (w - sz * 4) * Math.random() + sz * 2;
  var by = (h - sz * 4) * Math.random() + sz * 2;
  var ball = {
    x: bx,
    y: by,
    px: bx + v * (Math.random() > .5 ? 1 : -1),
    py: by + v * (Math.random() > .5 ? 1 : -1),
    id: d,
    isMoving: true
  };
  return ball;
});

var svg = d3.select("body").append("svg")
  .attr("width", w)
  .attr("height", h);


var rectx = function(d) {
  return d.x - r;
};
var recty = function(d) {
  return d.y - r;
};


var ballCell = function(b) {
  var row = (b.y - b.y % sz) / sz;
  var col = (b.x - b.x % sz) / sz;
  return cells[row * cols + col];
};

var topCell = function(c) {
  return cells[Math.max(0, c.r - 1) * cols + c.c];
};
var leftCell = function(c) {
  return cells[c.r * cols + Math.max(0, c.c - 1)];
};
var bottomCell = function(c) {
  return cells[Math.min(rows - 1, c.r + 1) * cols + c.c];
};
var rightCell = function(c) {
  return cells[c.r * cols + Math.min(cols - 1, c.c + 1)];
};

var topLeftCell = function(c) {
  return cells[Math.max(0, c.r - 1) * cols + Math.max(0, c.c - 1)];
};
var bottomLeftCell = function(c) {
  return cells[Math.min(rows - 1, c.r + 1) * cols + Math.max(0, c.c - 1)];
};
var bottomRightCell = function(c) {
  return cells[Math.min(rows - 1, c.r + 1) * cols + Math.min(cols - 1, c.c + 1)];
};
var topRightCell = function(c) {
  return cells[Math.max(0, c.r - 1) * cols + Math.min(cols - 1, c.c + 1)];
};

var cell = svg.selectAll(".cell")
  .data(cells)
  .enter().append("rect")
  .attr("class", function(d) {
    return "cell " + ((d.isWall = d.c == 0 || d.c == cols - 1 || d.r == 0 || d.r == rows - 1) ? "wall" : "air");
  })
  .attr("x", rectx)
  .attr("y", recty)
  .attr("width", sz)
  .attr("height", sz)
  .each(function(d) {
    d.elnt = d3.select(this);
  });


function previewLocation(c1, p) {

  var c2, d;
  if (s) {
    d = p[0] - c1.x;
    c2 = d > 0 ? rightCell(c1) : leftCell(c1);
  } else {
    d = p[1] - c1.y;
    c2 = d > 0 ? bottomCell(c1) : topCell(c1);
  }

}

var lives = n;

var slider = svg.append("rect")
  .attr("x", 30) // position the left of the slider
  .attr("y", h - 40) // position the top of the slider
  .attr("height", 20) // set the height
  .attr("width", 150) // set the width
  .attr("rx", 10) // set the x corner curve radius
  .attr("ry", 10) // set the y corner curve radius
  .style("fill", "brown")
  .style("stroke", "black");

var gameStartedAt = new Date().getTime();
var timeLeft = t;
svg.append("text")
  .attr("x", w - 130)
  .attr("y", 15)
  .attr("class", "smallText")
  .attr("id", "timeLeftText")
  .text("Time left: " + timeLeft);

var force = d3.layout.force()
  .gravity(0)
  .charge(0)
  .friction(1)
  .size([w, h]);

balls.forEach(function(b) {
  svg.append("svg:circle")
    .data([b])
    .attr("class", "ball")
    .attr("cx", function(d) {
      return d.x;
    })
    .attr("cy", function(d) {
      return d.y;
    })
    .attr("r", r);
  force.nodes().push(b);
});

force.on("tick", function() {

  var ball = svg.selectAll(".ball");
  ball.attr("cx", function(d) {
      return d.x;
    })
    .attr("cy", function(d) {
      return d.y;
    })
    .each(function(b) {

      detectCollisions(b);

      var cc = ballCell(b);
      var tc = topCell(cc);
      var lc = leftCell(cc);
      var bc = bottomCell(cc);
      var rc = rightCell(cc);
      if (bc.isWall) {
        //this is bc;
      }


    });

  var head = svg.selectAll(".head");
  head.attr("x", function(d) {
      d.x += d.dx * (v * .4);
      return rectx(d);
    })
    .attr("y", function(d) {
      d.y += d.dy * (v * .4);
      return recty(d);
    })
    .each(function(d) {
      svg.select("." + d.cl + ".tail")
        .attr("x", tailx)
        .attr("y", taily)
        .attr("width", tailw)
        .attr("height", tailh);
    });



  head.filter(function(h) {
    var hc = ballCell(h);
    if (h.dy < 0) {
      var tc = topCell(hc);
      return tc.isWall && h.y - tc.y < sz;
    }
    if (h.dx < 0) {
      var lc = leftCell(hc);
      return lc.isWall && h.x - lc.x < sz;
    }
    if (h.dy > 0) {
      var bc = bottomCell(hc);
      return bc.isWall && bc.y - h.y < sz;
    }
    if (h.dx > 0) {
      var rc = rightCell(hc);
      return rc.isWall && rc.x - h.x < sz;
    }
  }).each(function(h) {
    air.filter(function(a) {
      return h.dx == 0 ? h.x == a.x && Math.min(h.sy, h.y) <= a.y && a.y <= Math.max(h.sy, h.y) : h.y == a.y && Math.min(h.sx, h.x) <= a.x && a.x <= Math.max(h.sx, h.x);
    })
  }).remove();


  var timePlayed = Math.floor(((new Date().getTime()) - gameStartedAt) / 100);
  timeLeft = timePlayed > t ? 0 : t - timePlayed;
  svg.select("#timeLeftText")
    .text("Time left: " + timeLeft);
  if (lives >= 0 && timeLeft > 0) {
    force.resume();
  } else {
    force.stop();
    var text, textWidth;
    if (lives >= 0 && timeLeft == 0) {
      text = "Level complete !";
      textWidth = 188;
      d3.select("#nextLevelButton")
        .style("visibility", "visible");
    }

    svg.append("text")
      .attr("x", w / 2 - textWidth / 2)
      .attr("y", h / 2)
      .attr("class", "bigTextStroke")
      .text(text);
    svg.append("text")
      .attr("x", w / 2 - textWidth / 2)
      .attr("y", h / 2)
      .attr("class", "bigText")
      .text(text);
  }
});

force.start();

function detectCollisions(b) {
  var dx = b.x - b.px > 0 ? 1 : -1;
  var dy = b.y - b.py > 0 ? 1 : -1;
  var d, sd;



  // wall borders collision
  var cc = ballCell(b);
  var tc = topCell(cc);
  if (tc.isWall && dy < 0 && (d = b.y - tc.y) <= sz) {
    bounceY(b, sz, d, dy);
  }
  var lc = leftCell(cc);
  if (lc.isWall && dx < 0 && (d = b.x - lc.x) <= sz) {
    bounceX(b, sz, d, dx);
  }
  var bc = bottomCell(cc);
  if (bc.isWall && dy > 0 && (d = bc.y - b.y) <= sz) {
    
  if(!((point[0] <= b.x) && (b.x <= point[0] + 140)) && (b.y >= h - 30)){
    
    text = "Game over !";
    textWidth = 138;
    
    d3.select("#playAgainButton")
      .style("visibility", "visible");

    svg.append("text")
      .attr("x", w / 2 - textWidth / 2)
      .attr("y", h / 2)
      .attr("class", "bigTextStroke")
      .text(text);

    svg.append("text")
      .attr("x", w / 2 - textWidth / 2)
      .attr("y", h / 2)
      .attr("class", "bigText")
      .text(text);
    d3.select(this).style("opacity", 1);
    force.stop();
  }
  }
  var rc = rightCell(cc);
  if (rc.isWall && dx > 0 && (d = rc.x - b.x) <= sz) {
    bounceX(b, sz, d, dx);
  }
  if (((point[0] <= b.x) && (b.x <= point[0] + 140)) && (b.y >= h - 30)) {
    
    bounceX(b, sz, d, dx);
    bounceY(b, sz, d, dy);
  }

  svg.selectAll(".head").each(function(h) {
    if (h.y - r <= b.y && b.y <= h.y + r) {
      if (dx < 0 && (d = b.x - h.x) <= sz && d > 0) {
        bounceX(b, sz, d, dx);
      }
      if (dx > 0 && (d = h.x - b.x) <= sz && d > 0) {
        bounceX(b, sz, d, dx);
      }
    }
    if (h.x - r <= b.x && b.x <= h.x + r) {
      if (dy < 0 && (d = b.y - h.y) <= sz && d > 0) {
        bounceY(b, sz, d, dy);
      }
      if (dy > 0 && (d = h.y - b.y) <= sz && d > 0) {
        bounceY(b, sz, d, dy);
      }
    }
  });

  // wall corners collision
  var tlc = topLeftCell(cc);
  if (!tc.isWall && !lc.isWall && tlc.isWall && (sd = cornerSquareDistance(b.x, b.y, tlc.x + r, tlc.y + r)) <= sr) {
    d = Math.sqrt(sd);
    if (dx < 0) {
      bounceX(b, r, d, dx);
    }
    if (dy < 0) {
      bounceY(b, r, d, dy);
    }
  }


  var trc = topRightCell(cc);
  if (!tc.isWall && !rc.isWall && trc.isWall && (sd = cornerSquareDistance(b.x, b.y, trc.x - r, trc.y + r)) <= sr) {
    d = Math.sqrt(sd);
    if (dx > 0) {
      bounceX(b, r, d, dx);
    }
    if (dy < 0) {
      bounceY(b, r, d, dy);
    }
  }
  svg.selectAll(".head").each(function(h) {
    if ((sd = cornerSquareDistance(b.x, b.y, h.x + r, h.y + r)) <= sr && sd > 0) {
      d = Math.sqrt(sd);
      if (dx < 0) {
        bounceX(b, r, d, dx);
      }
      if (dy < 0) {
        bounceY(b, r, d, dy);
      }
    }
    if ((sd = cornerSquareDistance(b.x, b.y, h.x + r, h.y - r)) <= sr && sd > 0) {
      d = Math.sqrt(sd);
      if (dx < 0) {
        bounceX(b, r, d, dx);
      }
      if (dy > 0) {
        bounceY(b, r, d, dy);
      }
    }
    if ((sd = cornerSquareDistance(b.x, b.y, h.x - r, h.y - r)) <= sr && sd > 0) {
      d = Math.sqrt(sd);
      if (dx > 0) {
        bounceX(b, r, d, dx);
      }
      if (dy > 0) {
        bounceY(b, r, d, dy);
      }
    }
    if ((sd = cornerSquareDistance(b.x, b.y, h.x - r, h.y + r)) <= sr && sd > 0) {
      d = Math.sqrt(sd);
      if (dx > 0) {
        bounceX(b, r, d, dx);
      }
      if (dy < 0) {
        bounceY(b, r, d, dy);
      }
    }
  });

  // ball collision
  svg.selectAll(".ball").each(function(b2) {
    //if(b.y>=h-30){console.log("hiii")}
    if (((point[0] <= b.x) && (b.x <= point[0] + 140)) && (b.y >= h - 30)) {
    }
    if (b.id == b2.id) {
      return;
    }
    var sd = cornerSquareDistance(b.x, b.y, b2.x, b2.y);
    if (sd <= ssz) {
      var dx2 = b2.x - b2.px > 0 ? 1 : -1;
      var dy2 = b2.y - b2.py > 0 ? 1 : -1;
      var d = Math.sqrt(sd);
      if (b.isMoving && (b2.x - b.x) * dx > r / 2) {
        bounceX(b, sz, d, dx);
      }
      if (b2.isMoving && (b.x - b2.x) * dx2 > r / 2) {
        bounceX(b2, sz, d, dx2);
      }
      if (b.isMoving && (b2.y - b.y) * dy > r / 2) {
        bounceY(b, sz, d, dy);
      }
      if (b2.isMoving && (b.y - b2.y) * dy2 > r / 2) {
        bounceY(b2, sz, d, dy2);
      }
    }
  });
}

function bounceX(b, m, d, dx) {
  if (b.isMoving) {
    b.x -= (m - d) * dx;
    b.px = b.x + dx * v;
  }
}

function bounceY(b, m, d, dy) {
  if (b.isMoving) {
    b.y -= (m - d) * dy;
    b.py = b.y + dy * v;
  }
}

function cornerSquareDistance(x0, y0, x1, y1) {
  var w = x1 - x0;
  var h = y1 - y0;
  return (w * w + h * h);
}


function visit(c) {
  var tc = topCell(c);
  if (!tc.isWall && !tc.visited) {
    tc.visited = true;
    visit(tc);
  }
  var lc = leftCell(c);
  if (!lc.isWall && !lc.visited) {
    lc.visited = true;
    visit(lc);
  }
  var bc = bottomCell(c);
  if (!bc.isWall && !bc.visited) {
    bc.visited = true;
    visit(bc);
  }
  var rc = rightCell(c);
  if (!rc.isWall && !rc.visited) {
    rc.visited = true;
    visit(rc);
  }
}

d3.keybinding = function() {
  var _keys = {

    // Normal keys
    keys: {

      '⇥': 9,
      '⇆': 9,
      tab: 9,
      // Return key, ↩
      '↩': 13,
      'return': 13,
      enter: 13,
      '⌅': 13,
      // Left Arrow Key, or ←
      '←': 37,
      left: 37,
      'arrow-left': 37,
      // Up Arrow Key, or ↑
      '↑': 38,
      up: 38,
      'arrow-up': 38,
      // Right Arrow Key, or →
      '→': 39,
      right: 39,
      'arrow-right': 39,
      // Up Arrow Key, or ↓
      '↓': 40,
      down: 40,
      'arrow-down': 40,
      // odities, printing characters that come out wrong:


    }
  };
  // To minimise code bloat, add all of the NUMPAD 0-9 keys in a loop
  var i = 95,
    n = 0;
  while (++i < 106) _keys.keys['num-' + n] = i;
  ++n;
  // To minimise code bloat, add all of the top row 0-9 keys in a loop
  i = 47, n = 0;
  while (++i < 58) _keys.keys[n] = i;
  ++n;
  // To minimise code bloat, add all of the F1-F25 keys in a loop
  i = 111, n = 1;
  while (++i < 136) _keys.keys['f' + n] = i;
  ++n;
  // To minimise code bloat, add all of the letters of the alphabet in a loop
  i = 64;
  while (++i < 91) _keys.keys[String.fromCharCode(i).toLowerCase()] = i;

  var pairs = d3.entries(_keys.keys),
    event = d3.dispatch.apply(d3, d3.keys(_keys.keys));

  function keys(selection) {
    selection.on('keydown', function() {
      var tagName = d3.select(d3.event.target).node().tagName;
      if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
        return;
      }

      var modifiers = '';
      if (d3.event.shiftKey) modifiers += '⇧';
      if (d3.event.ctrlKey) modifiers += '⌃';
      if (d3.event.altKey) modifiers += '⌥';
      if (d3.event.metaKey) modifiers += '⌘';

      pairs.filter(function(d) {
        return d.value === d3.event.keyCode;
      }).forEach(function(d) {
        event[d.key](d3.event, modifiers);
      });
    });
  }

  return d3.rebind(keys, event, 'on');
};

function move(x, y) {
  return function(event) {
    event.preventDefault();
    momentum = [momentum[0] + x, momentum[1] + y];
  };
}

d3.select('body').call(d3.keybinding()
  .on('←', move(-2, 0))
  .on('→', move(2, 0)));

d3.timer(function() {
  point[0] = Math.min(w - 170, Math.max(20, momentum[0] + point[0] ));

  slider
    .attr("x", point[0]);

  momentum[0] *= 0.9;
  momentum[1] *= 0.9;
});