import GIF from 'gif.js';

const generateViewFromFrame = (frame) => {
  let view = [];
  for (let i = 0; i < 16; i++) {
    let row = [];
    for (let j = 0; j < 16; j++) {
      row.push({
        visible: false,
        r: 0,
        g: 0,
        b: 0
      });
    }
    view.push(row);
  }
  /*
   *console.log('view init');
   *console.log(view);
   */

  /*
   *console.log('frame to render');
   *console.log(frame);
   */
  for (let i = 0; i < frame.layers.length; i++) {
    let layer = frame.layers[i];
    if (!layer.visible) continue;
    layer = layer.pixels;
    for (let y = 0; y < layer.length; y++) {
      for (let x = 0; x < layer.length; x++) {
        if (!view[y][x].visible) {
          view[y][x] = layer[y][x];
        }
      }
    }
  }
  /*
   *console.log('view post layers');
   *console.log(view);
   */

  return view;
}

const generateImageFromView = (view) => {
  let c = document.createElement('canvas');
  let ctx = c.getContext('2d');
  let imgData = ctx.createImageData(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      imgData.data[y*16*4+x*4+0] = view[y][x].r;
      imgData.data[y*16*4+x*4+1] = view[y][x].g;
      imgData.data[y*16*4+x*4+2] = view[y][x].b;
      imgData.data[y*16*4+x*4+3] = (view[y][x].visible ? 255 : 0);
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return ctx;
}

const generateGIF = (anim) => {
  let gif = new GIF({
    workers: 2,
    quality: 0,
    width: 16,
    height: 16,
    workerScript: '/gif.worker.js'
  });

  for (let i = 0; i < anim.frames.length; i++) {
    let view = generateViewFromFrame(anim.frames[i]);
    let image = generateImageFromView(view);
    gif.addFrame(image);
  }

  return gif;
}

export default generateGIF;
