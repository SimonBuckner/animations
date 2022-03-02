const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const color = require('canvas-sketch-util/color');
const rgbaToHex = require('canvas-sketch-util/lib/rgba-to-hex');
const tweakpane = require('tweakpane');

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const params = {
  tiles: Array(200),
  num_tiles: 200,
  y_speed: 0.1,
  y_offset: 0,
  y_bump: 1,
  color: 0,
  c_speed: 5,
};

const sketch = () => {

  for (let i = params.num_tiles - 1; i >= 0; i--) {
    const x = i % 5;
    const y = Math.floor(i / 5);
    params.tiles.push(new Tile(params.color));
    console.log(x);
    if (x == 0) {
      if (params.color <= 0 || params.color >= 255) { params.c_speed *= -1; }
    };
  };

  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    params.y_offset += params.y_speed;

    if (params.y_offset > params.y_bump) {
      params.y_offset = 0;
      bump_tiles();
    };

    for (let i = 0; i < params.num_tiles; i++) {
      const x = i % 5;
      const y = Math.floor(i / 5);
      params.tiles[i].draw(context, width + 100, 150, x, y + params.y_offset);
    };
  };
};

const bump_tiles = (tiles) => {
  const keep_rows = params.num_tiles - (params.num_tiles % 5);
  for (let i = keep_rows - 1; i >= 0; i--) {
    params.tiles[i + 5] = params.tiles[i];
  };

  params.color += params.c_speed;
  if (params.color <= 0 || params.color >= 255) { params.c_speed *= -1; }
  for (let i = 4; i >= 0; i--) {
    params.tiles[i] = new Tile(params.color);
  };
};

class Tile {
  constructor(c) {
    this.c = c;
  }

  draw(context, ox, oy, tx, ty) {

    const tw = 100 / 2;
    const th = 50 / 2;

    const x = ox + (tx * tw) - (ty * tw);
    const y = oy + (tx * th) + (ty * th);

    const xl = -50;   // left
    const x0 = 0;     // middle
    const xr = 50;    // right

    const yt = -25;   // top
    const y0 = 0;     // middle
    const yb = 25;    // bottom

    const ysb = 10;   // side bottom
    const ybb = 35;   // bottom bottom

    context.save();
    context.translate(x, y);

    // sides of tile
    context.beginPath();
    context.moveTo(xl, y0);   // left middle
    context.lineTo(xl, ysb);  // left side-bottom
    context.lineTo(x0, ybb);  // middle bottom-bottom
    context.lineTo(xr, ysb);  // right side-bottom
    context.lineTo(xr, y0);   // right middle
    context.moveTo(x0, yb);   // middle bottom 
    context.lineTo(x0, ybb);  // middle bottom-bottom
    context.stroke();

    // top of tile
    context.beginPath();
    context.moveTo(x0, yt);   // middle top
    context.lineTo(xr, y0);   // right middle
    context.lineTo(x0, yb);   // middle bottom
    context.lineTo(xl, y0);   // left middle
    context.lineTo(x0, yt);   // middle top
    context.closePath();
    context.fillStyle = color.style([this.c, 0, 0]);
    context.fill();

    context.beginPath();
    context.moveTo(x0, yt);   // middle top
    context.lineTo(xr, y0);   // right middle
    context.lineTo(x0, yb);   // middle bottom
    context.lineTo(xl, y0);   // left middle
    context.lineTo(x0, yt);   // middle top
    context.closePath();
    context.stroke();

    context.restore();
  }
};


const createPane = () => {
  const pane = new tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: "Tiles" });
  folder.addInput(params, "y_speed", { min: 0.01, max: 1, step: 0.01 });
  folder.addInput(params, "c_speed", { min: 1, max: 255, step: 1 });
  // folder.addInput(params, "rows", {min: 2, max: 50, step: 1});
  // folder.addInput(params, "scaleMin", {min: 1, max: 100});
  // folder.addInput(params, "scaleMax", {min: 1, max: 100});

  // folder = pane.addFolder({ title: "Noise"});
  // folder.addInput(params, "freq", {min: -0.01, max: 0.01});
  // folder.addInput(params, "amp", {min: 0, max: 1});
  // folder.addInput(params, "animate");
  // folder.addInput(params, "frame",{min: 1, max: 999});


  // tiles: Array(200),
  // num_tiles: 200,
  // y_speed: 0.1,
  // y_offset: 0,
  // y_bump: 1,
  // color: 0,
  // c_speed: 5,
};

createPane();

canvasSketch(sketch, settings);
