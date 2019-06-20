import GIF from 'gif.js';

const generateViewFromFrame = (frame, scale) => {
  let view = [];
  for (let i = 0; i < 16; i++) {
    let row = [];
    for (let j = 0; j < 16; j++) {
      for (let h = 0; h < scale; h++) {
        row.push({
          visible: false,
          r: 0,
          g: 0,
          b: 0
        });
      }
    }
    for (let h = 0; h < scale; h++) {
      view.push(row);
    }
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
    layer = layer.pixels;
    for (let y = 0; y < layer.length; y++) {
      for (let x = 0; x < layer.length; x++) {
        for (let i = 0; i < scale; i++) {
          for (let j = 0; j < scale; j++) {
            if (!view[y*scale+j][x*scale+i].visible) {
              view[y*scale+j][x*scale+i] = layer[y][x];
            }
          }
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
  let imgData = ctx.createImageData(view.length, view.length);
  for (let y = 0; y < view.length; y++) {
    for (let x = 0; x < view[y].length; x++) {
      if (view[y][x].visible) {
        // add 10 to fix black -> transparent bug
        imgData.data[y*view.length*4+x*4+0] = Math.min(view[y][x].r + 10, 255);
        imgData.data[y*view.length*4+x*4+1] = view[y][x].g;
        imgData.data[y*view.length*4+x*4+2] = view[y][x].b;
        imgData.data[y*view.length*4+x*4+3] = 255;
      } else {
        imgData.data[y*view.length*4+x*4+0] = 0;
        imgData.data[y*view.length*4+x*4+1] = 0;
        imgData.data[y*view.length*4+x*4+2] = 0;
        imgData.data[y*view.length*4+x*4+3] = 0;
      }
    }
  }
  return imgData;
}

const generateGIF = (anim) => {
  let scale = 8;
  let gif = new GIF({
    workers: 4,
    quality: 0,
    width: 16*scale,
    height: 16*scale,
    transparent: 'rgba(0, 0, 0, 0)',
    workerScript: '/gif.worker.js'
  });

  for (let i = 0; i < anim.frames.length; i++) {
    let view = generateViewFromFrame(anim.frames[i], scale);
    let image = generateImageFromView(view);
    gif.addFrame(image);
  }

  return gif;
}

export default generateGIF;
