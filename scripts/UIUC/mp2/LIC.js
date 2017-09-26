
//-------------------------------------------------------
// Global variables
var x_extent = [-1.0, 1.0];
var y_extent = [-1.0, 1.0];

//------------------------------------------------------
//MAIN
function main() {
    render();
}

//--Function: render-------------------------------------
//Main drawing function

function render(canvas) {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log(' Failed to retrieve the < canvas > element');
        return false;
    }
    else {
        console.log(' Got < canvas > element ');
    }

    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');

    // Draw the scalar data using an image rpresentation
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Choose the scalar function
    var scalar_func = gaussian;
    var grad_func = gaussian_gradient;
    if (document.getElementById("gaus_mix").checked) {
        scalar_func = gaus_mix;
        grad_func = gaus_mix_gradient;
    }

    // Choose options
    L = document.getElementById("Length").value;

    //* GENERATE NORMAL PLOT
    if (document.getElementById("FCN").checked) {

        //Determine the data range...useful for the color mapping
        var rng = range(grad_func, canvas.width, canvas.height, x_extent, y_extent);
        var mn = rng[0], mx = rng[1];

        //Color the domain according to the scalar value
        for (var y = 0; y < canvas.height; y++)
            for (var x = 0; x < canvas.width; x++) {
                var fval = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y));

                var color = rainbow_colormap(fval, mn, mx);

                i = (y * canvas.width + x) * 4

                imgData.data[i] = color[0];
                imgData.data[i + 1] = color[1];
                imgData.data[i + 2] = color[2];
                imgData.data[i + 3] = color[3];
            }
        }
    //* GENERATE LIC PLOT
    else {

        //Determine the data range...useful for the color mapping
        var rng = range(grad_func, canvas.width, canvas.height, x_extent, y_extent);
        var mn = rng[0], mx = rng[1];

        //Generate random noise map
        var noise_map = [];
        for (var y = 0; y < canvas.height; y++)
            for (var x = 0; x < canvas.width; x++) {
                var index = y * canvas.width + x;
                noise_map[index] = Math.random() * 255;
            }

        //Generate LIC plot
        for (var y = 0; y < canvas.height; y++)
            for (var x = 0; x < canvas.width; x++) {

                var fval_num = 0;
                var fval_denum = 0;
                //find a point and a direction of the gradient in that point
                var point = pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y);
                var gradient = norm(grad_func(point));

                // integration of the weighted noise values along the gradient
                for (var l = -L; l <= L; l = l + 1) {
                    var new_point = [];
                    new_point[0] = point[0] + 2 / canvas.width * l * gradient[0];
                    new_point[1] = point[1] + 2 / canvas.height * l * gradient[1];
                    var pix_ind = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, new_point[0], new_point[1]);
                    if (pix_ind[0] >= 0 && pix_ind[0] < canvas.width &&
            	pix_ind[1] >= 0 && pix_ind[1] < canvas.height) {
                        var weight = wght(new_point, point);
                        var pix_val = noise_map[canvas.width * pix_ind[1] + pix_ind[0]];
                        fval_num += pix_val * weight;
                        fval_denum += weight;
                    }
                }
                
                // find pixel value
                fval = fval_num / fval_denum;
                var color = [];

                if (document.getElementById("Color").checked) {
                    color = rainbow_colormap(length(grad_func(point)) * fval, mn * 255, mx * 255);

                }
                else {
                    color[0] = fval;
                    color[1] = fval;
                    color[2] = fval;
                }
                
                i = (y * canvas.width + x) * 4
                imgData.data[i] = color[0];
                imgData.data[i + 1] = color[1];
                imgData.data[i + 2] = color[2];
                imgData.data[i + 3] = 255;
            }
        }

    ctx.putImageData(imgData, 0, 0);

    if (document.getElementById("HedgeHog").checked) plot_hedgehog(canvas, grad_func, x_extent, y_extent, L, mx, mn);

}


//----------------------------------------------BASIC OPERATIONS
//* Length function
function length(vector) {
    var len = 0.0, sum;
    sum = vector[0] * vector[0] + vector[1] * vector[1];
    len = Math.sqrt(sum); // dist square
    return len;
}

//* Weight function
function wght(point1, point2) {
    var weight, dist;
    dist = (point1[0] - point2[0]) * (point1[0] - point2[0]) + (point1[1] - point2[1]) * (point1[1] - point2[1]); // dist square
    weight = Math.exp(-dist);
    return weight;
}

//* Norm function
function norm(vector) {
    var len;
    len = length(vector); // dist square
    if (len == 0.0) {
        vector[0] = 0.0;
        vector[1] = 0.0;
    }
    else {
        vector[0] /= len;
        vector[1] /= len;
    }
    return vector;
}

//----------------------------------- DIM CONVERSIONS
// Map a point in pixel coordinates to the 2D function domain
function pixel2pt(width, height, x_extent, y_extent, p_x, p_y) {
    var pt = [0, 0];
    xlen = x_extent[1] - x_extent[0]
    ylen = y_extent[1] - y_extent[0]
    pt[0] = (p_x / width) * xlen + x_extent[0];
    pt[1] = (p_y / height) * ylen + y_extent[0];
    return pt;
}

//--------------------------------------------------------
// Map a point in domain coordinates to pixel coordinates
function pt2pixel(width, height, x_extent, y_extent, p_x, p_y) {
    var pt = [0, 0];

    var xlen = (p_x - x_extent[0]) / (x_extent[1] - x_extent[0]);
    var ylen = (p_y - y_extent[0]) / (y_extent[1] - y_extent[0]);

    pt[0] = Math.round(xlen * width);
    pt[1] = Math.round(ylen * height);
    return pt;
}

// --------------------------------- MATH FUNCTIONS
// two gaussians shifted 
function gaus_mix(pt) {
    var pt1 = [];
    pt1[0] = pt[0] + 1;
    pt1[1] = pt[1] + 1;
    var pt2 = [];
    pt2[0] = pt[0] - 1;
    pt2[1] = pt[1] - 1;
    return (Math.exp(-(pt1[0] * pt1[0] + pt1[1] * pt1[1])) + Math.exp(-(pt2[0] * pt2[0] + pt2[1] * pt2[1]))) / 2;
}

function gaus_mix_gradient(pt) {
    var pt1 = [];
    pt1[0] = pt[0] + 1;
    pt1[1] = pt[1] + 1;
    var pt2 = [];
    pt2[0] = pt[0] - 1;
    pt2[1] = pt[1] - 1;
    var dx = -(pt1[0] * Math.exp(-(pt1[0] * pt1[0] + pt1[1] * pt1[1])) + pt2[0] * Math.exp(-(pt2[0] * pt2[0] + pt2[1] * pt2[1])));
    var dy = -(pt1[1] * Math.exp(-(pt1[0] * pt1[0] + pt1[1] * pt1[1])) + pt2[1] * Math.exp(-(pt2[0] * pt2[0] + pt2[1] * pt2[1])));
    return [dx, dy];
}

//--------------------------------------------------------
//A simple Gaussian function
function gaussian(pt) {
    return Math.exp(-(pt[0] * pt[0] + pt[1] * pt[1]));
}

//--------------------------------------------------------
//

function gaussian_gradient(pt) {
    var dx = -2 * pt[0] * gaussian(pt);
    var dy = -2 * pt[1] * gaussian(pt);
    return [dx, dy];
}

//-------------------------------------------- Visualization Functions

//Determine the data range...useful for the color mapping
function range(func,canvas_width, canvas_height, x_extent, y_extent) {
    var fval, val = func(pixel2pt(canvas_width, canvas_height, x_extent, y_extent, 0, 0));
    if (val.length > 1)
        mn = length(val)
    var mx = mn;
    for (var y = 0; y < canvas_height; y++)
        for (var x = 0; x < canvas_width; x++) {
            var val = func(pixel2pt(canvas_width, canvas_height, x_extent, y_extent, x, y));
            if (val.length > 1)
                fval = length(val);
            else
                fval = val;
            if (fval < mn)
                mn = fval;
            if (fval > mx)
                mx = fval;
        }
    return [mn, mx];
}

//--------------------------------------------------------
//The infamous rainbow color map, normalized to the data range
function rainbow_colormap(fval, fmin, fmax) {
    var dx = 0.8;
    var fval_nrm = (fval - fmin) / (fmax - fmin);
    var g = (6.0 - 2.0 * dx) * fval_nrm + dx;
    var R = Math.max(0.0, (3.0 - Math.abs(g - 4.0) - Math.abs(g - 5.0)) / 2.0) * 255;
    var G = Math.max(0.0, (4.0 - Math.abs(g - 2.0) - Math.abs(g - 4.0)) / 2.0) * 255;
    var B = Math.max(0.0, (3.0 - Math.abs(g - 1.0) - Math.abs(g - 2.0)) / 2.0) * 255;
    color = [Math.round(R), Math.round(G), Math.round(B), 255];
    return color;
}

//------------------------------------------- Hedgehog plot relater fucntions
//--------------------------------------------------------
function plot_hedgehog(canvas, grad_func, x_extent, y_extent, L, mx, mn) {
    
    var ctx = canvas.getContext('2d');
    var pix = [], point = [], new_point = [], new_pix = [];
    var resolution = 10;

    var delta = canvas.width / resolution;

    for (var i = 0; i <= resolution; i++)
        for (var ii = 0; ii <= resolution; ii++) {
            pix = [i * delta, ii * delta];
            var point = pixel2pt(canvas.width, canvas.height, x_extent, y_extent, pix[0], pix[1]);
            var vec = (grad_func(point));

            new_point[0] = point[0] + vec[0] * .1 / (mx - mn);
            new_point[1] = point[1] + vec[1] * .1 / (mx - mn);
            var new_pix = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, new_point[0], new_point[1]);
            ctx.beginPath();
            ctx.moveTo(pix[0], pix[1]);
            ctx.lineTo(new_pix[0], new_pix[1]);
            ctx.lineWidth = 2;
            // set line color
            ctx.strokeStyle = '#FF0000';
            ctx.stroke();
        }
}

