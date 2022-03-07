const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const tile = {
  plots: [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ],
  fillStyle: color.style([255, 0, 0]),
  strokeStyle: color.style([0, 0, 0]),
};

let manager;

let tileImage = new Image();

const sketch = () => {

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    // context.drawImage(tileImage, 0, 0);
  };
};

const loadImage = () => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = "./img/keyboard.jpg";
  });
};

const start = async () => {
  loadImage().then(img => {
    tileImage = img;
    manager.render();
    console.log(`${img.width} - ${img.height}`);
  });

  manager = await canvasSketch(sketch, settings);
};

const isoProjectXY = (originX, originY, tileX, tileY, tileW, tileH) => {

  const w = tileW * 0.5;
  const h = tileH * 0.5;

  const x = originX + (tileX * w) - (tileY * w);
  const y = originY + (tileX * h) + (tileY * h);

  return {x: x, y: y};
};

const extractTileFromImage = (img, tileX, tileY, tileWidth, tileHeight) => {

  numPixels = tileWidth * tileHeight;
  let pixels 
  let startX = tileX * tileWidth;
  let startY = tileY * tileHeight;
  for (let col=0; i<tileWidth; col++) {
    for (let row=0; row<tileWidth; row++) {

    };
  }; 

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

start();

// canvasSketch(sketch, settings);
