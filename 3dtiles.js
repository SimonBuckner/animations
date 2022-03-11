const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const color = require('canvas-sketch-util/color');
const tweakpane = require('tweakpane');
const intersectLineCircle = require('canvas-sketch-util/lib/clip/clip-line-to-circle');
import { isoProjectXY, renderFilledTile, renderEmptyTile, drawPoly, rotate2D } from './sbutils.mjs';

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const crossPlots = [
  [-0.4, -1],
  [0.4, -1],
  [0.4, -0.4],
  [1, -0.4],
  [1, 0.4],
  [0.4, 0.4],
  [0.4, 1],
  [-0.4, 1],
  [-0.4, 0.4],
  [-1, 0.4],
  [-1, -0.4],
  [-0.4, -0.4],
  // [-0.4, -1],
  
];

const state = {
  background: `rgb(11, 5, 38)`,
  angle: 0,
  speed: 0.1,
  size: 50,
};

const sketch = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = state.background;
    context.fillRect(0, 0, width, height);

    const rPlots = rotate2D(state.angle, ...crossPlots);
    context.save();
    context.strokeStyle = `rgb(255, 255, 255)`;
    context.translate(width * 0.5, height * 0.5);
    drawPoly(context, state.size, state.size, ...rPlots);
    context.restore();
    state.angle += state.speed;
  };
};

const createPane = () => {
  const pane = new tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: "Tiles" });
  // folder.addInput(state, "originX", { min: -1024, max: 1024, step: 2 });
  // folder.addInput(state, "originY", { min: -1024, max: 1024, step: 2 });
  // folder.addInput(state, "tileSize", { min: 1, max: 100, step: 1 });
  // folder.addInput(state, "speedY", { min: 0.01, max: 1, step: 0.01 });
  // folder.addInput(state, "speedC", { min: 1, max: 255, step: 1 });
  // folder.addInput(state, "speedSin", { min: 1, max: 10, step: 0.1 });
  // folder.addInput(state, "fadeBegin", { min: 1, max: 100, step: 1 });
  // folder.addInput(state, "fadeFull", { min: 1, max: 100, step: 1 });
  // folder.addInput(state, "fillTops");
  // folder.addInput(state, "fillSides");
  folder.addInput(state, "size", { min: 1, max: 1080, step: 1 });
  folder.addInput(state, "speed", { min: 0.1, max: 10, step: 0.1 });
  folder.addInput(state, "background", { picker: 'inline', expanded: true });
};

createPane();

canvasSketch(sketch, settings);
