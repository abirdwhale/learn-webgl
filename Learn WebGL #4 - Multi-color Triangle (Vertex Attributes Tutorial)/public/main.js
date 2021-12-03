const canvas = document.querySelector(`canvas`);
const gl = canvas.getContext(`webgl`);

if (!gl) {
  throw new Error(`WebGL not supported`);
}

// vertexData = [...]

// create buffer 

// loat vertexData into buffer

// create vertex shader

// create fragment shader

// create program 

// attach shaders to program

// enable vertex attributes

// draw

const vertexData = [
  0, 1, 0,
  1, -1, 0,
  -1, -1, 0,
];

const colorData = [
  1, 0, 0, // V1.color
  0, 1, 0, // V2.color
  0, 0, 1, // V3.color
];

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

void main() {
  vColor = color;
  gl_Position = vec4(position, 1);
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
gl.drawArrays(gl.TRIANGLES, 0, 3);  

console.log("positionLocation: " + positionLocation);
console.log("colorLocation: " + colorLocation);