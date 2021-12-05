const canvas = document.querySelector(`canvas`);
const gl = canvas.getContext(`webgl`);

if (!gl) {
  throw new Error(`WebGL not supported`);
}

// vertexData = [...]

// create buffer 
// load vertexData into buffer

// create vertex shader
// create fragment shader
// create program 
// attach shaders to program

// enable vertex attributes

// draw

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

function randomColor() {
  return [Math.random(), Math.random(), Math.random()];
}

let colorData = [];
for (let face = 0; face < 6; face++) {
  let faceColor = randomColor();
  for (let vertex = 0; vertex < 6; vertex++) {
      colorData.push(...faceColor);
  }
}

console.log("colorData: " + colorData);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW); // we are not going to rewite the content of buffer

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW); // we are not going to rewite the content of buffer

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

uniform mat4 matrix;

void main() {
  vColor = color;
  gl_Position = matrix * vec4(position, 1);
}
`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;

varying vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor, 1);
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

const colorLocation = gl.getAttribLocation(program, `color`); //asking the 'program' 'which generic attribute did you bind 'color' to?'
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

const uniformLocations = {
  matrix: gl.getUniformLocation(program, `matrix`),
};

// Adjust glMatrix for its latest version
const {
  mat4,
  mat3,
  vec3
} = glMatrix;

// This matrix translates an object
const modelMatrix = mat4.create();
// This matrix simulates a camera
const viewMatrix = mat4.create();
// This matrix apply a perspective
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix,
  75* Math.PI/180, // vertical field-of-view (angle, radians)
  canvas.width/canvas.height, // aspect W/H
  1e-4, // near cull distance
  1e4, // far cull distance
);

//To mulply model matrix by view matrix
const mvMatrix = mat4.create();
//Model View Projection Matrix
const mvpMatrix = mat4.create();

mat4.translate(modelMatrix, modelMatrix, [-1.5, 0 , -2]);

mat4.translate(viewMatrix, viewMatrix, [-3, 0, 1]);
// We can't move the camera, so we calcurate the camera transformation, and apply the opposite to the world
mat4.invert(viewMatrix, viewMatrix);

// mat4.translate(matrix, matrix, [.2, .5, -2]);

// Make the box smaller
// mat4.scale(matrix, matrix, [0.25, 0.25, 0.25]);

function animate() {
  requestAnimationFrame(animate);
  // mat4.rotateZ(matrix, matrix, Math.PI/2 / 70);
  // mat4.rotateX(matrix, matrix, Math.PI/2 / 70);

  mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
  mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
  gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
};

animate();

console.log("matrix: " + matrix);
console.log("positionLocation: " + positionLocation);
console.log("colorLocation: " + colorLocation);