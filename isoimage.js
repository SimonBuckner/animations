const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 2048, 2048 ]
};

let manager;

let tileImage = new Image();

const sketch = () => {

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.drawImage(tileImage, 0, 0);
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

start();

// canvasSketch(sketch, settings);
