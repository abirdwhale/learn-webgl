const canvas = document.querySelector(`canvas`);
const gl = canvas.getContext(`webgl`);

// Adjust glMatrix for its latest version
const {
  mat4,
  mat3,
  vec3
} = glMatrix;

if (!gl) {
  throw new Error(`WebGL not supported`);
}

const vertexData = [

  // Front
  0.5, 0.5, 0.5,
  0.5, -.5, 0.5,
  -.5, 0.5, 0.5,
  -.5, 0.5, 0.5,
  0.5, -.5, 0.5,
  -.5, -.5, 0.5,

  // Left
  -.5, 0.5, 0.5,
  -.5, -.5, 0.5,
  -.5, 0.5, -.5,
  -.5, 0.5, -.5,
  -.5, -.5, 0.5,
  -.5, -.5, -.5,

  // Back
  -.5, 0.5, -.5,
  -.5, -.5, -.5,
  0.5, 0.5, -.5,
  0.5, 0.5, -.5,
  -.5, -.5, -.5,
  0.5, -.5, -.5,

  // Right
  0.5, 0.5, -.5,
  0.5, -.5, -.5,
  0.5, 0.5, 0.5,
  0.5, 0.5, 0.5,
  0.5, -.5, 0.5,
  0.5, -.5, -.5,

  // Top
  0.5, 0.5, 0.5,
  0.5, 0.5, -.5,
  -.5, 0.5, 0.5,
  -.5, 0.5, 0.5,
  0.5, 0.5, -.5,
  -.5, 0.5, -.5,

  // Bottom
  0.5, -.5, 0.5,
  0.5, -.5, -.5,
  -.5, -.5, 0.5,
  -.5, -.5, 0.5,
  0.5, -.5, -.5,
  -.5, -.5, -.5,
];

// Construct an Array by repeating `pattern` n times
function repeat(n, pattern) {
  return [...Array(n)].reduce(sum => sum.concat(pattern), []);
}

const uvData = repeat(6, [
  1, 1, // top right
  1, 0, // bottom right
  0, 1, // top left

  0, 1, // top left
  1, 0, // bottom right
  0, 0 // bottom left
]);

// vertexData = [...]

// create buffer 
// load vertexData into b uffer

// create vertex shader
// create fragment shader
// create program 
// attach shaders to program

// enable vertex attributes

// draw





const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);


// RESOURCE LOADING
// ================

function loadTexture(url) {
  const texture = gl.createTexture();
  const image = new Image();

  image.onload = e => {
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.generateMipmap(gl.TEXTURE_2D);
  };

  image.src = url;
  return texture;
}



const brick = loadTexture(`textures/default_brick.png`);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, brick);

// SHADER PROGRAM
// ==============
let uniformLocations;
(function shaderProgram() {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
  precision mediump float;

  attribute vec3 position;
  attribute vec2 uv;

  varying vec2 vUV;

  uniform mat4 matrix;

  void main() {
    vUV = uv;
    gl_Position = matrix * vec4(position, 1);
  }
  `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
    precision mediump float;

    varying vec2 vUV;
    uniform sampler2D textureID;

    void main() {
      gl_FragColor = texture2D(textureID, vUV);
    }
    `);
    gl.compileShader(fragmentShader);
    console.log(gl.getShaderInfoLog(fragmentShader));

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const positionLocation = gl.getAttribLocation(program, `position`); //asking the 'program' 'which generic attribute did you bind 'position' to?'
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const uvLocation = gl.getAttribLocation(program, `uv`);
    gl.enableVertexAttribArray(uvLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    // const colorLocation = gl.getAttribLocation(program, `color`); //asking the 'program' 'which generic attribute did you bind 'color' to?'
    // gl.enableVertexAttribArray(colorLocation);
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);

    uniformLocations = {
      matrix: gl.getUniformLocation(program, `matrix`),
      textureID: gl.getUniformLocation(program, 'textureID'),
     };

     gl.uniform1i(uniformLocations.textureID, 0);
})();

    // MATRICES
    // ========

    // This matrix translates an object
    const modelMatrix = mat4.create();
    // This matrix simulates a camera
    const viewMatrix = mat4.create();
    // This matrix apply a perspective
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,
      75 * Math.PI / 180, // vertical field-of-view (angle, radians)
      canvas.width / canvas.height, // aspect W/H
      1e-4, // near cull distance
      1e4, // far cull distance
    );

    //To mulply model matrix by view matrix
    const mvMatrix = mat4.create();
    //Model View Projection Matrix
    const mvpMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
    mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
    // We can't move the camera, so we calcurate the camera transformation, and apply the opposite to the world
    mat4.invert(viewMatrix, viewMatrix);

    // mat4.translate(matrix, matrix, [.2, .5, -2]);

    // Make the box smaller
    // mat4.scale(matrix, matrix, [0.25, 0.25, 0.25]);

// ANIMATION LOOP
// ==============

    function animate() {
      requestAnimationFrame(animate);
      // mat4.rotateZ(matrix, matrix, Math.PI/2 / 70);
      // mat4.rotateX(matrix, matrix, Math.PI/2 / 70);
      mat4.rotateY(modelMatrix, modelMatrix, 0.03);

      mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
      mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
      gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
      gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
    };

    animate();

    console.log("mvpMatrix: " + mvpMatrix);
    // console.log("positionLocation: " + positionLocation);
    // console.log("colorLocation: " + colorLocation);