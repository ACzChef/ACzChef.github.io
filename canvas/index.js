var canvas, display, ctx, flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  dot_flag = false;

var strokes = {}
var strokeCt = -1
var db = firebase.firestore()

document.onLoad = init()

function init() {
  display = document.getElementById('display');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext("2d");
  w = canvas.width;
  h = canvas.height;

  canvas.addEventListener("mousemove", function (e) {
    e.preventDefault();
    findxy('move', e)
  }, false);
  canvas.addEventListener("mousedown", function (e) {
    e.preventDefault();
    findxy('down', e)
  }, false);
  canvas.addEventListener("mouseup", function (e) {
    e.preventDefault();
    findxy('up', e)
  }, false);
  canvas.addEventListener("mouseout", function (e) {
    e.preventDefault();
    findxy('out', e)
  }, false);

  // Set up touch events for mobile, etc
  canvas.addEventListener("touchstart", function (e) {
    mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, false);
  canvas.addEventListener("touchend", function (e) {
    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
  }, false);
  canvas.addEventListener("touchmove", function (e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, false);

  db.collection("Strokes").doc('1').onSnapshot(function(doc) {
    var context = display.getContext('2d');
    context.clearRect(0, 0, w, h);
    Object.values(doc.data().strokes).forEach(function(stroke) {
      context.beginPath();
      context.moveTo(stroke.x[0], stroke.y[0]);
      for(i = 1; i < stroke.x.length; i++) {
        context.lineTo(stroke.x[i], stroke.y[i]);
      }
      context.strokeStyle = '#000000';
      context.lineWidth = 2;
      context.stroke();
      context.closePath();
    });
  });
}

function save() {
  db.collection("Strokes").doc('1').set({strokes: strokes});
}

function draw() {
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currX, currY);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  strokes[strokeCt]['x'].push(currX);
  strokes[strokeCt]['y'].push(currY);
  save()
}

function findxy(res, e) {
  if (res == 'down') {
    strokeCt++;
    strokes[strokeCt] = {};
    strokes[strokeCt]['x'] = [];
    strokes[strokeCt]['y'] = [];
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;

    flag = true;
    dot_flag = true;
    if (dot_flag) {
      ctx.beginPath();
      ctx.fillStyle = '#000000';
      ctx.fillRect(currX, currY, 2, 2);
      ctx.closePath();
      dot_flag = false;
    }
  }
  if (res == 'up' || res == "out") {
    flag = false;
  }
  if (res == 'move') {
    if (flag) {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;
      draw();
    }
  }
}


// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}
