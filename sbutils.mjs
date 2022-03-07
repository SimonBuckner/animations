function isoProjectXY(originX, originY, tileX, tileY, tileW, tileH) {

  const w = tileW * 0.5;
  const h = tileH * 0.5;

  const x = Math.floor(originX + (tileX * w) - (tileY * w));
  const y = Math.floor(originY + (tileX * h) + (tileY * h));

  return { x: x, y: y };
};

function renderFilledTile(w, h, color, ...plots) {
  var tCanvas = document.createElement('canvas');
  var tContext = tCanvas.getContext('2d');
  tContext.width = w;
  tContext.height = h;

  tContext.translate(w * 0.5, h * 0.5);
  fillPoly(tContext, color, w, h, ...plots);
  return { canvas: tCanvas, context: tContext };
};

function renderEmptyTile(w, h, ...plots) {
  var tCanvas = document.createElement('canvas');
  var tContext = tCanvas.getContext('2d');
  tContext.width = w;
  tContext.height = h;

  tContext.translate(w * 0.5, h * 0.5);
  drawPoly(tContext, w, h, ...plots);
  return { canvas: tCanvas, context: tContext };
};

function drawPoly(context, scaleX, scaleY, ...plots) {

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

function fillPoly(context, color, scaleX, scaleY, ...plots) {

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

export { isoProjectXY, renderFilledTile, renderEmptyTile };