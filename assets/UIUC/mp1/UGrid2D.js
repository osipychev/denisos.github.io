
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

UGrid2D.prototype.show_values = function (canvas, scalar_func) {
    var ctx = canvas.getContext('2d');
    // set fonts
    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    deltaX = canvas.width / this.resolution;
    deltaY = canvas.height / this.resolution;

    // loop over all corners
    for (var i = 0; i <= this.resolution; i++) {
        for (var j = 0; j <= this.resolution; j++) {

            ctx.textAlign = "left";
            ctx.textBaseline = "hanging";
            // show values at top left corner unless it is the most right and bottom ones
            if (i == this.resolution) ctx.textAlign = "right";
            if (j == this.resolution) ctx.textBaseline = "alphabetic";

            var x = deltaX * i;
            var y = deltaY * j;
            var val = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y));
            val = Math.round(val * 100) / 100;
            ctx.fillText(val, x, y);
        }
    }
}

// Method: show_contour
// Marching squares contour line

UGrid2D.prototype.show_contour = function (canvas, scalar_func, contour_val) {
    var ctx = canvas.getContext('2d');
    deltaX = canvas.width / this.resolution;
    deltaY = canvas.height / this.resolution;

    // set line parameters
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF';

    var val_flag = 0;

    // loop over every cell
    for (var i = 0; i <= this.resolution; i++) {
        for (var j = 0; j <= this.resolution; j++) {
            var x1 = deltaX * i;
            var y1 = deltaY * j;
            var x2 = deltaX * (i + 1);
            var y2 = deltaY * (j + 1);

            // find values at all 4 corners
            var v1 = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x1, y1));
            var v2 = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x2, y1));
            var v3 = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x2, y2));
            var v4 = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x1, y2));

            // form a case vector according to a book notation
            var case_vec = 1000 * (v1 > contour_val ? 1 : 0) +
    			100 * (v2 > contour_val ? 1 : 0) +
    			10 * (v3 > contour_val ? 1 : 0) +
    			(v4 > contour_val ? 1 : 0);

            // location of the contour on the edge (if not a ratio)
            var xshift = deltaX / 2.0;
            var yshift = deltaY / 2.0;

            // cases walk through
            switch (case_vec) {
                case 1000: //left top max
                    xshift = (contour_val - v1) / (v2 - v1) * deltaX;
                    yshift = (contour_val - v1) / (v4 - v1) * deltaY;
                    ctx.moveTo(x1, y1 + yshift);
                    ctx.lineTo(x1 + xshift, y1);
                    break;
                case 100: //right top max
                    xshift = (contour_val - v1) / (v2 - v1) * deltaX;
                    yshift = (contour_val - v2) / (v3 - v2) * deltaY;
                    ctx.moveTo(x1 + xshift, y1);
                    ctx.lineTo(x2, y1 + yshift);
                    break;
                case 10: //right bottom max
                    xshift = (contour_val - v4) / (v3 - v4) * deltaX;
                    yshift = (contour_val - v2) / (v3 - v2) * deltaY;
                    ctx.moveTo(x2, y1 + yshift);
                    ctx.lineTo(x1 + xshift, y2);
                    break;
                case 1: //left bottom max
                    xshift = (contour_val - v4) / (v3 - v4) * deltaX;
                    yshift = (contour_val - v1) / (v4 - v1) * deltaY;
                    ctx.moveTo(x1, y1 + yshift);
                    ctx.lineTo(x1 + xshift, y2);
                    break;
                case 1110: //left bottom min
                    xshift = (contour_val - v4) / (v3 - v4) * deltaX;
                    yshift = (contour_val - v1) / (v4 - v1) * deltaY;
                    ctx.moveTo(x1, y1 + yshift);
                    ctx.lineTo(x1 + xshift, y2);
                    break;
                case 111: //left top min
                    xshift = (contour_val - v1) / (v2 - v1) * deltaX;
                    yshift = (contour_val - v1) / (v4 - v1) * deltaY;
                    ctx.moveTo(x1, y1 + yshift);
                    ctx.lineTo(x1 + xshift, y1);
                    break;
                case 1011: //right top min
                    xshift = (contour_val - v1) / (v2 - v1) * deltaX;
                    yshift = (contour_val - v2) / (v3 - v2) * deltaY;
                    ctx.moveTo(x1 + xshift, y1);
                    ctx.lineTo(x2, y1 + yshift);
                    break;
                case 1101: //right bottom min
                    xshift = (v4 - contour_val) / (v4 - v3) * deltaX;
                    yshift = (v2 - contour_val) / (v2 - v3) * deltaY;
                    ctx.moveTo(x2, y1 + yshift);
                    ctx.lineTo(x1 + xshift, y2);
                    break;
                case 1100: //both tops max
                    yshift = (contour_val - v1) / (v4 - v1) * deltaY;
                    var yshift2 = (contour_val - v2) / (v3 - v2) * deltaY;
                    ctx.moveTo(x1, y1 + yshift);
                    ctx.lineTo(x2, y1 + yshift2);
                    break;
                case 110: //both right max
                    xshift = (contour_val - v1) / (v2 - v1) * deltaX;
                    var xshift2 = (contour_val - v4) / (v3 - v4) * deltaX;
                    ctx.moveTo(x1 + xshift, y1);
                    ctx.lineTo(x1 + xshift2, y2);
                    break;
                case 11: //both left max
                    yshift = (contour_val - v1) / (v4 - v1) * deltaY;
                    var yshift2 = (contour_val - v2) / (v3 - v2) * deltaY;
                    ctx.moveTo(x1, y1 + yshift);
                    ctx.lineTo(x2, y1 + yshift2);
                    break;
                case 1001: //both bottom max
                    xshift = (contour_val - v1) / (v2 - v1) * deltaX;
                    var xshift2 = (contour_val - v4) / (v3 - v4) * deltaX;
                    ctx.moveTo(x1 + xshift, y1);
                    ctx.lineTo(x1 + xshift2, y2);
                    break;
                case 1010: //diagonal, top left and bottom right max
                    var mid_value = (v1 + v2 + v3 + v4) / 4.0;
                    xshift = (contour_val - v1) / (v2 - v1) * deltaX;
                    var xshift2 = (contour_val - v4) / (v3 - v4) * deltaX;
                    yshift = (contour_val - v1) / (v4 - v1) * deltaY;
                    var yshift2 = (contour_val - v2) / (v3 - v2) * deltaY;
                    if (mid_value > contour_val) {
                        ctx.moveTo(x1 + xshift, y1);
                        ctx.lineTo(x2, y1 + yshift2);
                        ctx.moveTo(x1, y1 + yshift);
                        ctx.lineTo(x1 + xshift2, y2);
                    }
                    else {
                        ctx.moveTo(x1 + xshift, y1);
                        ctx.lineTo(x1, y1 + yshift);
                        ctx.moveTo(x2, y1 + yshift2);
                        ctx.lineTo(x1 + xshift2, y2);
                    }
                    break;
                case 0101: //diagonal, top right and bottom left max
                    var mid_value = (v1 + v2 + v3 + v4) / 4.0;
                    xshift = (contour_val - v1) / (v2 - v1) * deltaX;
                    var xshift2 = (contour_val - v4) / (v3 - v4) * deltaX;
                    yshift = (contour_val - v1) / (v4 - v1) * deltaY;
                    var yshift2 = (contour_val - v2) / (v3 - v2) * deltaY;
                    if (mid_value < contour_val) {
                        ctx.moveTo(x1 + xshift, y1);
                        ctx.lineTo(x2, y1 + yshift2);
                        ctx.moveTo(x1, y1 + yshift);
                        ctx.lineTo(x1 + xshift2, y2);
                    }
                    else {
                        ctx.moveTo(x1 + xshift, y1);
                        ctx.lineTo(x1, y1 + yshift);
                        ctx.moveTo(x2, y1 + yshift2);
                        ctx.lineTo(x1 + xshift2, y2);
                    }
                    break;
            }
            ctx.stroke();

            // show the contour value corresponding to the line
            if (val_flag == 0 && case_vec != 0 && case_vec !=1111) {
                ctx.font = "10px Arial";
                ctx.fillStyle = "white";
                ctx.textAlign = "right";
                ctx.textBaseline = "top";
                var x = deltaX * i + xshift;
                var y = deltaY * j + yshift;
                ctx.fillText(contour_val, x, y);
                val_flag = 1;
            }
        }
    }
}

//End UGrid2D--------------------------------------------