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
  tiles: [],
  rows: 31,
  cols: 15,
  y_speed: 0.1,
  y_offset: 0,
  y_bump: 1,
  color: 0,
  c_speed: 5,
  s_speed: 4,
  z_speed: 1,
  begin_fade: 15,
  full_fade: 25,
};

const sketch = () => {
  const num_tiles = params.rows * params.cols;
  params.tiles = Array(num_tiles);

  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    params.y_offset += params.y_speed;

    if (params.y_offset > params.y_bump) {
      params.y_offset = 0;
      bump_tiles(frame);
    };

    const num_tiles = params.rows * params.cols;

    for (let i = 0; i < num_tiles; i++) {
      const x = i % params.cols;
      const y = Math.floor(i / params.cols);
      if (params.tiles[i]) {
        params.tiles[i].draw(context, width + 100, 150, x, y + params.y_offset);
      }
    };
  };
};

const bump_tiles = (frame) => {
  const num_tiles = params.rows * params.cols;

  const keep_rows = num_tiles - (num_tiles % params.cols);
  for (let i = keep_rows - 1; i >= 0; i--) {
    params.tiles[i + params.cols] = params.tiles[i];
  };

  params.color += params.c_speed;
  const z = Math.sin(math.degToRad(frame * params.z_speed)); // * 40;

  if (params.color <= 0 || params.color >= 255) { params.c_speed *= -1; }

  const s = Math.sin(math.degToRad(frame * params.s_speed))
  const s1 = Math.round(math.mapRange(s, -1, 1, 0, params.cols - 1));
  const s2 = params.cols - s1 - 1;

  for (let i = params.cols - 1; i >= 0; i--) {
    if (i >= s1 && i <= s2) {
      params.tiles[i] = new Tile(255 - params.color, z * 40);
    } else if (i >= s2 && i <= s1) {
      params.tiles[i] = new Tile(255 - params.color, z * 40);
    } else {
      params.tiles[i] = new Tile(params.color, z * 40);
    };
  };
};

class Tile {
  constructor(c, z) {
    this.c = c;
    this.z = z;
    // this.z = random.range(-10, 10);

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

    let alpha = 1.0;
    const range = params.full_fade - params.begin_fade;
    const ay = ty - params.begin_fade;

    if (ty >= params.begin_fade) {
      alpha = 1 - (ay / range);
    }
    if (ty >= params.full_fade) {
      alpha = 0;
    }
    context.save();
    context.globalAlpha = alpha;
    context.translate(x, y);
    context.translate(0, this.z);

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
  folder.addInput(params, "z_speed", { min: 1, max: 255, step: 1 });
  folder.addInput(params, "s_speed", { min: 1, max: 8, step: 0.1 });
  folder.addInput(params, "begin_fade", { min: 1, max: 50, step: 1 });
  folder.addInput(params, "full_fade", { min: 1, max: 50, step: 1 });
};

createPane();

canvasSketch(sketch, settings);
