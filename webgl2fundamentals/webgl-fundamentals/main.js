"use strict";

/* 
NOTE: #version 300 es MUST BE THE VERY FIRST LINE OF YOUR SHADER. No comments or blank lines are allowed before it! #version 300 es tells WebGL2 you want to use WebGL2's shader language called GLSL ES 3.00. If you don't put that as the first line the shader language defaults to WebGL 1.0's GLSL ES 1.00 which has many differences and far less features.
*/

// start with a vertex shader
// this vertex shader is doing nothing but passing on our position data directly. Since the position data is already in clip space there is no work to do
const vertexShaderSource = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

uniform vec2 u-resolution;

// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;

// we need a fragment shader
const fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant reddish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`;

function main() {
  // look up an HTML canvas element 
  const canvas = document.querySelector("#c");

  // create a WebGL2RenderingContext
  /** @type {WebGL2RenderingContext} */
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    // no webgl2 for you!
    throw new Error(`WebGL2 not supported`);
    return;
  }

  // create a shader, upload the GLSL source, and compile the shader
  function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  // call that function to create the 2 shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // link those 2 shaders into a program
  function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  // call it
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up the location of the attribute for the program we just created
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Attributes get their data from buffers so we need to create a buffer
  var positionBuffer = gl.createBuffer();

  // bind the position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // three 2d points
  const positions = [
    0, -1.0,
    0, 1.0,
    1.0, -1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // create a collection of attribute state called a Vertex Array Object
  var vao = gl.createVertexArray();

  // make that the current vertex array so that all of our attribute settings will apply to that set of attribute state
  gl.bindVertexArray(vao);

  // turn the attribute on. This tells WebGL we want to get data out of a buffer
  gl.enableVertexAttribArray(positionAttributeLocation);


  // specify how to pull the data out
  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const positionOffset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, positionOffset)

  resizeCanvasToDisplaySize(gl.canvas);

  // We need to tell WebGL how to convert from the clip space values we'll be setting gl_Position to back into pixels, often called screen space. To do this we call gl.viewport and pass it the current size of the canvas.
  // This tells WebGL the -1 +1 clip space maps to 0 <-> gl.canvas.width for x and 0 <-> gl.canvas.height for y
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  const primitiveType = gl.TRIANGLES;
  const offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();

/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] amount to multiply by.
 *    Pass in window.devicePixelRatio for native pixels.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:webgl-utils
 */
function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  const width = canvas.clientWidth * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

// resize the canvas https://webgl2fundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
  // const canvasToDisplaySizeMap = new Map([[canvas, [300, 150]]]);

  /* function onResize(entries) {
    for (const entry of entries) {
      let width;
      let height;
      let dpr = window.devicePixelRatio;
      if (entry.devicePixelContentBoxSize) {
        // NOTE: Only this path gives the correct answer
        // The other 2 paths are an imperfect fallback
        // for browsers that don't provide anyway to do this
        width = entry.devicePixelContentBoxSize[0].inlineSize;
        height = entry.devicePixelContentBoxSize[0].blockSize;
        dpr = 1; // it's already in width and height
      } else if (entry.contentBoxSize) {
        if (entry.contentBoxSize[0]) {
          width = entry.contentBoxSize[0].inlineSize;
          height = entry.contentBoxSize[0].blockSize;
        } else {
          // legacy
          width = entry.contentBoxSize.inlineSize;
          height = entry.contentBoxSize.blockSize;
        }
      } else {
        // legacy
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }
      const displayWidth = Math.round(width * dpr);
      const displayHeight = Math.round(height * dpr);
      canvasToDisplaySizeMap.set(entry.target, [displayWidth, displayHeight]);
    }
  }

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(canvas, {box: 'content-box'}); */

  /* function resizeCanvasToDisplaySize(gl.canvas) {
    // Get the size the browser is displaying the canvas in device pixels.
    const [displayWidth, displayHeight] = canvasToDisplaySizeMap.get(canvas);

    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
  } */