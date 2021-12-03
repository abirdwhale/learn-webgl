'use strict';
/** @type {WebGLRenderingContext} */
let gl;

function updateClearColor(...color) {
  console.log("then I am called")
  // The ES6 spread operator (...) allows for us to
  // use elements of an array as arguments to a function
  // gl.clearColor(...color);
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.viewport(0, 0, 0, 0);
}

function checkKey(event) {
  console.log(event);
  console.log(event.keyCode);
  switch (event.keyCode) {
    // number 1 => green
    case 49: {
      console.log("I am called");
      updateClearColor(0.2, 0.8, 0.2, 1.0);
      break;
    }
    // number 2 => blue
    case 50: {
      updateClearColor(0.2, 0.2, 0.8, 1.0);
      break;
    }
    // number 3 => random color
    case 51: {
      updateClearColor(Math.random(), Math.random(), Math.random(), 1.0);
      break;
    }
    // number 4 => get color
    case 52: {
      const color = gl.getParameter(gl.COLOR_CLEAR_VALUE);
      // Don't let the following line confuse you.
      // It basically rounds up the numbers to one
      // decimal cipher for visualization purposes.

      // TIP: Given that WebGL's color space ranges
      // from 0 to 1 you can multiply these values by 255
      // to display in their RGB values.
      alert(`clearColor = (
        ${color[0].toFixed(1)},
        ${color[1].toFixed(1)},
        ${color[2].toFixed(1)}
      )`);
      window.focus();
      break;
    }
  }
}

function init() {
  const canvas = document.getElementById('webgl-canvas');
  // Ensure we have a canvas
  if (!canvas) {
    console.error('Sorry! No HTML5 Canvas was found on this page');
    return;
  }

  const gl = canvas.getContext('webgl2');

  // Ensure we have a context
  const message = gl ?
    'Hooray! You got a WebGL2 context' :
    'Sorry WebGL is not available';

  console.log(gl);

  alert(message);

  //Call checkKey whenever a key is pressed
  window.onkeydown = checkKey;
}

// Call init once the document has loaded
window.onload = init;