
var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;


// Create a place to store vertex colors
var vertexColorBuffer;

var mvMatrix = mat4.create();
var rotAngleY = 0;
var rotAngleZ = 0;
var scale = 0;
var vertexDisplacement = 0;
var lastTime = 0;


function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
        return degrees * Math.PI / 180;
}


function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

//setup mesh buffer here
function setupBuffers(timeNow) {

	// setup buffer for the top mesh (blue I box)
  vertexPositionBuffer1 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer1);
	//vertex coordinates which form a strip
  var triangleVertices1 = [
    -0.73, -0.30, 0.00,
		-0.33, -0.30, 0.00,
		-0.73, -0.09, 0.00,//1
		-0.33, -0.09, 0.00,//2
		-0.73,  0.42, 0.00,//3
		-0.19, -0.09, 0.00,//4
		-0.19,  0.42, 0.00,//5
		-0.73,  0.42, 0.00,//6
		-0.33,  0.42, 0.00,// empty triangle
		-0.73,  0.65, 0.00,//7
		-0.33,  0.65, 0.00,//8 
		// end of left leg (total 11 verteces)
    -0.91,  0.65, 0.00,//empty triangle
		-0.91,  0.96, 0.00,//1
		-0.33,  0.96, 0.00,//2
		-0.33,  0.65, 0.00,//3
		 0.33,  0.96, 0.00,//4
		 0.33,  0.65, 0.00,//5
		 0.91,  0.96, 0.00,//6
		 0.91,  0.65, 0.00,//7 
		// end of the top (total 19 verteces)
		 0.33,  0.65, 0.00,//8        	
		 0.73,  0.65, 0.00,//7
		 0.33,  0.42, 0.00,// empty triangle
		 0.73,  0.42, 0.00,//6
		 0.19,  0.42, 0.00,//5
		 0.19, -0.09, 0.00,//4
		 0.73,  0.42, 0.00,//3
		 0.33, -0.09, 0.00,//2
		 0.73, -0.09, 0.00,//1
		 0.33, -0.30, 0.00,
		 0.73, -0.30, 0.00 
		// end of the right leg (30 verteces total)
  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices1), gl.STATIC_DRAW);
  vertexPositionBuffer1.itemSize = 3;
  vertexPositionBuffer1.numberOfItems = 30;
  
	// setup color buffer for Blue I mesh
  vertexColorBuffer1 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer1);
  var colors1 = [
    0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
    0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
    0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
    0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
    0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
		0.07, 0.15, 0.3, 1.0,
	];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors1), gl.STATIC_DRAW);
  vertexColorBuffer1.itemSize = 4;
  vertexColorBuffer1.numItems = 30; 

	// setup second buffer for the bottom mesh (red stripes)
	vertexPositionBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer2); 
  var triangleVertices2 = [
    -0.58 + Math.sin(timeNow/100 + 0)/20.0, -0.60, 0.00,
		-0.58 + Math.sin(timeNow/100 + 1)/20.0, -0.51, 0.00,
		-0.73 + Math.sin(timeNow/100 + 1)/20.0, -0.51, 0.00,		
		-0.58 + Math.sin(timeNow/100 + 2)/20.0, -0.39, 0.00,//1
		-0.73 + Math.sin(timeNow/100 + 2)/20.0, -0.39, 0.00,//2 
		// end of 1st from the left strip
		-0.33, -0.39, 0.00,
		-0.48, -0.39, 0.00,
		-0.33, -0.66, 0.00,		
		-0.48, -0.66, 0.00,//1
		-0.33, -0.76, 0.00,//2 
		-0.33, -0.39, 0.00,	//empty
		-0.33, -0.39, 0.00,	//empty
		// end of 2nd strip
		-0.08, -0.39, 0.00,
		-0.23, -0.39, 0.00,
		-0.08, -0.81, 0.00,		
		-0.23, -0.81, 0.00,//1
		-0.08, -0.91, 0.00,//2 
		-0.08, -0.39, 0.00,	//empty
		-0.08, -0.39, 0.00,	//empty
		// end of the 3rd strip
		 0.08, -0.39, 0.00,
		 0.23, -0.39, 0.00,
		 0.08, -0.81, 0.00,		
		 0.23, -0.81, 0.00,//1
		 0.08, -0.91, 0.00,//2 
		 0.08, -0.39, 0.00,	//empty
		 0.08, -0.39, 0.00,	//empty
		// end of 4st from the left strip
		 0.33, -0.39, 0.00,
		 0.48, -0.39, 0.00,
		 0.33, -0.66, 0.00,		
		 0.48, -0.66, 0.00,//1
		 0.33, -0.76, 0.00,//2 
		 0.33, -0.39, 0.00,	//empty
		 0.33, -0.39, 0.00,	//empty
		// end of 5nd strip
		 0.73, -0.39, 0.00,//2 
		 0.58, -0.39, 0.00,//1
		 0.73, -0.51, 0.00,		
		 0.58, -0.51, 0.00,
		 0.58, -0.60, 0.00,
  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices2), gl.STATIC_DRAW);
  vertexPositionBuffer2.itemSize = 3;
  vertexPositionBuffer2.numberOfItems = 38;
    
	// set the color buffer for mesh2 - red stripes
  vertexColorBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer2);
  var colors2 = [
    0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
    0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
		0.91, 0.28, 0.22, 1.0,
	];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors2), gl.DYNAMIC_DRAW);
  vertexColorBuffer2.itemSize = 4;
  vertexColorBuffer2.numItems = 38; 
}

function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  mat4.identity(mvMatrix);
  mat4.rotateZ(mvMatrix, mvMatrix, degToRad(rotAngleZ));  
  mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngleY));  
	mat4.scale(mvMatrix,mvMatrix,[scale, scale, scale])

	// draw the top part
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer1);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer1.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer1);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer1.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionBuffer1.numberOfItems);

	// draw the bottom part
	//mat4.translate(mvMatrix,mvMatrix,[vertexDisplacement, 0, 0])
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer2);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer2.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer2);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer2.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionBuffer2.numberOfItems);

}

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;    
        rotAngleY= (rotAngleY+0.5) % 360;
				rotAngleZ= Math.sin(timeNow/1000) * 60;
				scale= (Math.sin(timeNow/10000)+2)/4.0;
				setupBuffers(timeNow);
    }
    lastTime = timeNow;
}

function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers(0);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}

