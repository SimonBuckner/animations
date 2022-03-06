const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const color = require('canvas-sketch-util/color');
const tweakpane = require('tweakpane');
const intersectLineCircle = require('canvas-sketch-util/lib/clip/clip-line-to-circle');

// const random = require('canvas-sketch-util/random');
// const rgbaToHex = require('canvas-sketch-util/lib/rgba-to-hex');

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const tileTop = {
  plots: [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ],
  fillStyle: color.style([255, 0, 0]),
  strokeStyle: color.style([0, 0, 0]),
};

const tileLeft = {
  plots: [
    [-1, -1],
    [-1, -0.6],
    [0, 0.4],
    [0, 0],
  ],
  fillStyle: color.style([100, 100, 100]),
  strokeStyle: color.style([0, 0, 0]),
};

const tileRight = {
  plots: [
    [1, -1],
    [1, -0.6],
    [0, 0.4],
    [0, 0],
  ],
  fillStyle: color.style([200, 200, 200]),
  strokeStyle: color.style([0, 0, 0]),
};

let tiles = [];

const state = {
  rows: 40,
  cols: 10,

  originX: 238,
  originY: 1,

  speedY: 0.1,
  speedC: 5,
  speedSin: 3.5,

  fadeBegin: 20,
  fadeFull: 35,

  offsetY: 0,
  color: 0,

  fillTops: true,
  fillSides: true,

  background: color.style([11, 5, 38]),
};

const sketch = () => {

  const numTiles = state.rows * state.cols;
  tiles = Array(numTiles);

  return ({ context, width, height, frame }) => {
    context.fillStyle = state.background;
    context.fillRect(0, 0, width, height);

    originX = width + state.originX;
    originY = state.originY;

    // Move tileHeighte Y offset by tileHeighter speed to animate tile placement
    // Positive values move tiles from upper right to lower left
    state.offsetY += state.speedY;

    // Remove tileHeighte left most row of tiles and create a new right most tile.
    if (state.offsetY > 1) {
      state.offsetY = 0;
      bumpTiles(frame);
    };

    // Build initial array of tiles
    const numTiles = state.rows * state.cols;

    for (let i = 0; i < numTiles; i++) {
      const x = i % state.cols;
      const y = Math.floor(i / state.cols);
      if (tiles[i]) {
        tiles[i].draw(context, originX, originY, x, y + state.offsetY);
      }
    };
  };
};

const bumpTiles = (frame) => {
  const numTiles = state.rows * state.cols;

  const keep_rows = numTiles - (numTiles % state.cols);
  for (let i = keep_rows - 1; i >= 0; i--) {
    tiles[i + state.cols] = tiles[i];
  };

  state.color += state.speedC;
  const z = Math.sin(math.degToRad(frame));

  if (state.color <= 0 || state.color >= 255) { state.speedC *= -1; }

  const s = Math.sin(math.degToRad(frame * state.speedSin))
  const s1 = Math.round(math.mapRange(s, -1, 1, 0, state.cols - 1));
  const s2 = state.cols - s1 - 1;

  for (let i = state.cols - 1; i >= 0; i--) {
    if (i >= s1 && i <= s2) {
      tiles[i] = new Tile(255 - state.color, z * 60);
    } else if (i >= s2 && i <= s1) {
      tiles[i] = new Tile(255 - state.color, z * 60);
    } else {
      tiles[i] = new Tile(state.color, (z * 60) * -1);
    };
  };
};

class Tile {
  constructor(c, z) {
    this.c = c;
    this.z = z;
  }

  draw(context, originX, originY, tileX, tileY) {

    const tilewidth = 100 / 2;
    const tileHeight = 50 / 2;

    const x = originX + (tileX * tilewidth) - (tileY * tilewidth);
    const y = originY + (tileX * tileHeight) + (tileY * tileHeight);

    let alpha = 1.0;
    const range = state.fadeFull - state.fadeBegin;
    const ay = tileY - state.fadeBegin;

    if (tileY >= state.fadeBegin) {
      alpha = 1 - (ay / range);
    }
    if (tileY >= state.fadeFull) {
      alpha = 0;
    }

    context.save();
    context.globalAlpha = alpha;
    context.translate(x, y);
    context.translate(0, this.z);

    context.translate(0, 25);
    if (state.fillSides) {
      fillPoly(context, tileLeft.fillStyle, 100, 50, ...tileLeft.plots);
      fillPoly(context, tileRight.fillStyle, 100, 50, ...tileRight.plots);
    } else {
      drawPoly(context, 100, 50, ...tileLeft.plots);
      drawPoly(context, 100, 50, ...tileRight.plots);
    }
    context.translate(0, -25);
    if (state.fillTops) {
      fillPoly(context, color.style([this.c, 0, 0]), 100, 50, ...tileTop.plots);
    } else {
      drawPoly(context, 100, 50, ...tileTop.plots);
    }

    context.restore();
  }
};

const drawPoly = (context, scaleX, scaleY, ...plots) => {

  if (plots.length < 2) { return; };

  context.beginPath();
  const x = plots[0][0] * scaleX * 0.5;
  const y = plots[0][1] * scaleY * 0.5;

  context.moveTo(x, y);
  for (let i = 1; i < plots.length; i++) {
    const x = plots[i][0] * scaleX * 0.5;
    const y = plots[i][1] * scaleY * 0.5;
    context.lineTo(x, y);
  }
  context.closePath();
  context.stroke();
};

const fillPoly = (context, color, scaleX, scaleY, ...plots) => {

  if (plots.length < 2) { return; };

  context.beginPath();

  const x = plots[0][0] * scaleX * 0.5;
  const y = plots[0][1] * scaleY * 0.5;

  context.moveTo(x, y);
  for (let i = 1; i < plots.length; i++) {
    const x = plots[i][0] * scaleX * 0.5;
    const y = plots[i][1] * scaleY * 0.5;
    context.lineTo(x, y);
  }
  context.fillStyle = color;
  context.fill();
  context.linewidth = 1;
  context.strokeStyle = 'black';
  context.stroke();

};

const createPane = () => {
  const pane = new tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: "Tiles" });
  folder.addInput(state, "originX", { min: 1, max: 1024, step: 1 });
  folder.addInput(state, "originY", { min: 1, max: 1024, step: 1 });
  folder.addInput(state, "speedY", { min: 0.01, max: 1, step: 0.01 });
  folder.addInput(state, "speedC", { min: 1, max: 255, step: 1 });
  folder.addInput(state, "speedSin", { min: 1, max: 10, step: 0.1 });
  folder.addInput(state, "fadeBegin", { min: 1, max: 50, step: 1 });
  folder.addInput(state, "fadeFull", { min: 1, max: 50, step: 1 });
  folder.addInput(state, "fillTops");
  folder.addInput(state, "fillSides");
  folder.addInput(state, "background", {picker: 'inline', expanded: true});
};

createPane();

canvasSketch(sketch, settings);
