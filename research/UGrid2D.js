
//University of Illinois/NCSA Open Source License
//Copyright (c) 2015 University of Illinois
//All rights reserved.
//
//Developed by: 		Eric Shaffer
//                  Department of Computer Science
//                  University of Illinois at Urbana Champaign
//
//
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
//documentation files (the "Software"), to deal with the Software without restriction, including without limitation
//the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
//to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
//Redistributions of source code must retain the above copyright notice, this list of conditions and the following
//disclaimers.Redistributions in binary form must reproduce the above copyright notice, this list
//of conditions and the following disclaimers in the documentation and/or other materials provided with the distribution.
//Neither the names of <Name of Development Group, Name of Institution>, nor the names of its contributors may be
//used to endorse or promote products derived from this Software without specific prior written permission.
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
//WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
//TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
//DEALINGS WITH THE SOFTWARE.


//--------------------------------------------------------
// A Simple 2D Grid Class
var UGrid2D = function (min_corner, max_corner, resolution) {
    this.min_corner = min_corner;
    this.max_corner = max_corner;
    this.resolution = resolution;
    console.log('UGrid2D instance created');
}

// Method: draw_grid
// Draw the grid lines

UGrid2D.prototype.draw_grid = function (canvas) {
    var ctx = canvas.getContext('2d');
    loc = [0, 0];
    delta = canvas.width / this.resolution;
    for (var i = 0; i <= this.resolution; i++) {
        ctx.beginPath();
        ctx.moveTo(i * delta, 0);
        ctx.lineTo(i * delta, canvas.height - 1);
        ctx.lineWidth = 1;
        // set line color
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
    loc = [0, 0];

    delta = canvas.height / this.resolution;

    for (var i = 0; i <= this.resolution; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * delta);
        ctx.lineTo(canvas.width - 1, i * delta);
        ctx.lineWidth = 1;
        // set line color
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
}

// Method: show_values
// Show values on the grid corresponding it its corner

UGrid2D.prototype.print_string = function (canvas, state, string, dim) {
    var ctx = canvas.getContext('2d');
    // set fonts
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    deltaX = canvas.width / this.resolution;
    deltaY = canvas.height / this.resolution;

    var x = deltaX * state[0] + deltaX/2;
    var y = deltaY * state[1] + deltaY/2;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(string, x, y);
}

UGrid2D.prototype.print_message = function (canvas, string) {
    var ctx = canvas.getContext('2d');
    // set fonts
    ctx.font = "32px Arial";
    x = canvas.width / 2;
    y = 0;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "red";
    ctx.fillText(string, x, y);
    ctx.strokeStyle = "black";
    ctx.strokeText(string, x, y);
}

// Method: show_values
// Show values on the grid corresponding it its corner

UGrid2D.prototype.show_values = function (canvas, matrix, dim) {
    var ctx = canvas.getContext('2d');
    // set fonts
    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    deltaX = canvas.width / this.resolution;
    deltaY = canvas.height / this.resolution;

    // loop over all corners
    for (var i = 0; i < this.resolution; i++) {
        for (var j = 0; j < this.resolution; j++) {

            var x = deltaX * i + deltaX/2;
            var y = deltaY * j + deltaY/2;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            var val = matrix[i][j];
            val = Math.round(val * 100) / 100;
            ctx.fillText(val, x, y);
        }
    }
}

UGrid2D.prototype.show_qvalues = function (canvas, matrix, dim, dim3) {
    var ctx = canvas.getContext('2d');
    // set fonts
    ctx.font = "8px Arial";
    ctx.fillStyle = "black";
    deltaX = canvas.width / this.resolution;
    deltaY = canvas.height / this.resolution;

    // loop over all corners
    for (var i = 0; i < this.resolution; i++) {
        for (var j = 0; j < this.resolution; j++) {

            var x = deltaX * i + deltaX/2;
            var y = deltaY * j;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            var val = matrix[i][j][2];
            val = Math.round(val * 100) / 100;
            ctx.fillText(val, x, y);
            
            var x = deltaX * i + deltaX/2;
            var y = deltaY * j + deltaY;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            var val = matrix[i][j][3];
            val = Math.round(val * 100) / 100;
            ctx.fillText(val, x, y);
        
            var x = deltaX * i;
            var y = deltaY * j + deltaY/2;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            var val = matrix[i][j][0];
            val = Math.round(val * 100) / 100;
            ctx.fillText(val, x, y);
        
            var x = deltaX * i + deltaX;
            var y = deltaY * j + deltaY/2;
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            var val = matrix[i][j][1];
            val = Math.round(val * 100) / 100;
            ctx.fillText(val, x, y);
            
//            var x = deltaX * i + deltaX/2;
//            var y = deltaY * j + deltaY/2;
//            ctx.textAlign = "center";
//            ctx.textBaseline = "top";
//            var val = matrix[i][j][0];
//            val = Math.round(val * 100) / 100;
//            ctx.fillText(val, x, y);
            
        }
    }
}

UGrid2D.prototype.show_symbols = function (canvas, matrix, dim) {
    var ctx = canvas.getContext('2d');
    // set fonts
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    deltaX = canvas.width / this.resolution;
    deltaY = canvas.height / this.resolution;

    // loop over all corners
    for (var i = 0; i < this.resolution; i++) {
        for (var j = 0; j < this.resolution; j++) {

            var x = deltaX * i + deltaX/2;
            var y = deltaY * j + deltaY/2;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(matrix[i][j], x, y);
        }
    }
}

UGrid2D.prototype.show_policy = function (canvas, matrix, dim) {
    var ctx = canvas.getContext('2d');
    // set fonts
    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    deltaX = canvas.width / this.resolution;
    deltaY = canvas.height / this.resolution;

    // loop over all corners
    for (var i = 0; i < this.resolution; i++) {
        for (var j = 0; j < this.resolution; j++) {

            var x = deltaX * i + deltaX/2;
            var y = deltaY * j + deltaY/2;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            var val = matrix[i][j];
            
            var act = findMaxInd(val);
            if (val[act] == 0.0) ctx.fillText("o", x, y);
            else if (act == 0) ctx.fillText("←", x, y);
            else if (act == 1) ctx.fillText("→", x, y);
            else if (act == 2) ctx.fillText("↑", x, y);
            else if (act == 3) ctx.fillText("↓", x, y);
            else ctx.fillText("o", x, y);
            
            
            
        }
    }
}

UGrid2D.prototype.show_state = function (canvas,state,dim){
    var ctx = canvas.getContext('2d');
    deltaX = canvas.width / dim;
    deltaY = canvas.height / dim;
    ctx.fillStyle="#FF0000";
    ctx.fillRect(state[0]*deltaX,state[1]*deltaY,deltaX,deltaY);
}

UGrid2D.prototype.show_colors = function (canvas, matrix, dim) {
    var ctx = canvas.getContext('2d');
    deltaX = canvas.width / this.resolution;
    deltaY = canvas.height / this.resolution;

    // loop over all corners
    for (var i = 0; i < this.resolution; i++) {
        for (var j = 0; j < this.resolution; j++) {

            var x = deltaX * i + deltaX/2;
            var y = deltaY * j + deltaY/2;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            var val = matrix[i][j];
            var color;
            if (val > 0) color = 'rgb('+(255-val)+',255,'+(255-val)+')';
            else color = 'rgb('+(255+val)+','+(255+val)+',255)';
            
            ctx.fillStyle=color;
            ctx.fillRect(i*deltaX,j*deltaY,deltaX,deltaY);
        }
    }
}

//End UGrid2D--------------------------------------------