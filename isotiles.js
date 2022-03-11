const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const color = require('canvas-sketch-util/color');
const tweakpane = require('tweakpane');
const intersectLineCircle = require('canvas-sketch-util/lib/clip/clip-line-to-circle');
import { isoProjectXY, renderFilledTile, renderEmptyTile } from './sbutils.mjs';


const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const tilePlots = {
  top: [[0, -1], [1, 0], [0, 1], [-1, 0],],
  left: [[-1, -1], [-1, -0.6], [0, 0.4], [0, 0],],
  right: [[1, -1], [1, -0.6], [0, 0.4], [0, 0],],
};

const tileFills = {
  left: color.style([100, 100, 100]),
  right: color.style([200, 200, 200]),
}

let filledTiles = {
  top: [],
  left: null,
  right: null,
};

let emptyTiles = {
  top: [],
  left: null,
  right: null,
};

let tiles = [];

const state = {
  rows: 40,
  cols: 10,
  rowsLast: 40,

  tileSize: 100,

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

  renderTiles();

  return ({ context, width, height, frame }) => {
    context.fillStyle = state.background;
    context.fillRect(0, 0, width, height);

    const originX = width + state.originX;
    const originY = state.originY;

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

const renderTiles = () => {
  const w = state.tileSize;
  const h = (state.tileSize * 0.5);

  for (let i = 0; i < 256; i++) {
    filledTiles.top.push(renderFilledTile(w, h, color.style([i, 0, 0]), ...tilePlots.top));
    emptyTiles.top.push(renderEmptyTile(w, h, ...tilePlots.top));
  };

  filledTiles.left = renderFilledTile(w, h, tileFills.left, ...tilePlots.left);
  filledTiles.right = renderFilledTile(w, h, tileFills.right, ...tilePlots.right);

  emptyTiles.left = renderEmptyTile(w, h, ...tilePlots.left);
  emptyTiles.right = renderEmptyTile(w, h, ...tilePlots.right);
};

const bumpTiles = (frame) => {
  if (state.rows != state.rowsLast) { console.log(`num tiles ${tiles.length}`); };
  const numTiles = state.rows * state.cols;

  const keep_rows = numTiles - (numTiles % state.cols);
  for (let i = keep_rows - 1; i >= 0; i--) {
    tiles[i + state.cols] = tiles[i];
  };

  state.color += state.speedC;
  const z = Math.sin(math.degToRad(frame));

  if (state.color <= 0 || state.color >= 255) {
    state.speedC *= -1;
    state.color = math.clamp(state.color, 0, 255);
  }

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

    const pos = isoProjectXY(originX, originY, tileX, tileY, state.tileSize, state.tileSize * 0.5);
    const w = state.tileSize;
    const h = state.tileSize / 2;

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
    context.translate(pos.x, pos.y);
    context.translate(0, this.z);

    context.translate(0, 25);
    if (state.fillSides) {
      context.drawImage(filledTiles.left.canvas, w, h);
      context.drawImage(filledTiles.right.canvas, w, h);
    } else {
      context.drawImage(emptyTiles.left.canvas, w, h);
      context.drawImage(emptyTiles.right.canvas, w, h);
    }
    context.translate(0, -25);
    if (state.fillTops) {
      context.drawImage(filledTiles.top[this.c].canvas, w, h);
    } else {
      context.drawImage(emptyTiles.top[0].canvas, w, h);
    }

    context.restore();
  }
};

const createPane = () => {
  const pane = new tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: "Tiles" });
  folder.addInput(state, "rows", { min: 1, max: 1000, step: 1 });
  folder.addInput(state, "originX", { min: -1024, max: 1024, step: 2 });
  folder.addInput(state, "originY", { min: -1024, max: 1024, step: 2 });
  folder.addInput(state, "tileSize", { min: 1, max: 100, step: 1 });
  folder.addInput(state, "speedY", { min: 0.01, max: 1, step: 0.01 });
  folder.addInput(state, "speedC", { min: 1, max: 255, step: 1 });
  folder.addInput(state, "speedSin", { min: 1, max: 10, step: 0.1 });
  folder.addInput(state, "fadeBegin", { min: 1, max: 100, step: 1 });
  folder.addInput(state, "fadeFull", { min: 1, max: 100, step: 1 });
  folder.addInput(state, "fillTops");
  folder.addInput(state, "fillSides");
  folder.addInput(state, "background", { picker: 'inline', expanded: true });
};

createPane();

canvasSketch(sketch, settings);
