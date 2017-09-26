//--------------------------------------------------------
/*
/ FARM ENVIRONMENT
/
*/

//Environment Parameters
var actions         = {idle:1, kill:2, left:3, right:4};
var state           = new Array(5);
var statecharge     = [0, 0];
var update_count    = 0;
var T_KILL          = 60; // sec to kill one weed
var T_CHARGE        = 60; // sec to full charge
var n_agents;
var n_agent_rows;

// A Simple 2D Grid Class
var UGrid2D = function (min_corner, max_corner, n_dim) {
    this.min_corner = min_corner;
    this.max_corner = max_corner;
    this.n_dim = n_dim;
    console.log('Environment instance created');
}



function totalReward(r_matr){
    var total = 0;
    for (var i = 0; i < n_dim; i++){
         for (var j = 0; j < n_dim; j++)
            total += r_matr[i][j];
    }
    return total;
}
// Method: draw_grid
// Draw the grid lines

UGrid2D.prototype.draw_grid = function (canvas) {
    var ctx = canvas.getContext('2d');
    loc = [0, 0];
    delta = (canvas.width / this.n_dim);
    for (var i = 0; i <= this.n_dim; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.ceil(i * delta), 0);
        ctx.lineTo(Math.ceil(i * delta), canvas.height - 1);
        ctx.lineWidth = .1;
        // set line color
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
    loc = [0, 0];

    delta = (canvas.height / this.n_dim);

    for (var i = 0; i <= this.n_dim; i++) {
        ctx.beginPath();
        ctx.moveTo(0, Math.ceil(i * delta));
        ctx.lineTo(canvas.width - 1, Math.ceil(i * delta));
        ctx.lineWidth = .1;
        // set line color
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
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

UGrid2D.prototype.show_policy = function (canvas, matrix) {
    var ctx = canvas.getContext('2d');
    // set fonts
    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    deltaX = (canvas.width / this.n_dim);
    deltaY = (canvas.height / this.n_dim);

    // loop over all corners
    for (var i = 0; i < this.n_dim; i++) {
        for (var j = 0; j < this.n_dim; j++) {

            var x = deltaX * i + deltaX/2;
            var y = deltaY * j + deltaY/2;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            var val = matrix[i][j];
            
            var act = findMaxInd(val);
            if (val[act] == 0.0){
                ctx.fillText("o", x, y);
            }
            else if (act == 0){
                ctx.fillText("←", x, y);
            }
            else if (act == 1){
                ctx.fillText("→", x, y);
            }
            else if (act == 2){
                ctx.fillText("↑", x, y);
            }
            else if (act == 3){
                ctx.fillText("↓", x, y);
            }
            else {
                ctx.fillText("o", x, y);
            }
        }
    }
}

UGrid2D.prototype.show_state = function (canvas,list){
    var ctx = canvas.getContext('2d');
    deltaX = (canvas.width / this.n_dim);
    deltaY = (canvas.height / this.n_dim);
    for (var i = 0; i < list.length; ++i){
        ctx.fillStyle="#FF0000";
        var state = list[i].getState();
        ctx.fillRect(state[0]*deltaX,state[1]*deltaY,deltaX,deltaY);
    }
}

UGrid2D.prototype.show_colors = function (canvas, matrix) {
    var ctx = canvas.getContext('2d');
    deltaX = (canvas.width / this.n_dim);
    deltaY = (canvas.height / this.n_dim);

    // loop over all corners
    for (var i = 0; i < this.n_dim; i++) {
        for (var j = 0; j < this.n_dim; j++) {

            var x = deltaX * i + deltaX/2;
            var y = deltaY * j + deltaY/2;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            var val = matrix[i][j];
            var color = 'rgb(255,255,255)';
            if (val > 0)
                color = 'rgb(100,255,100)';
            if (val > MAX_WEED) 
                color = 'rgb(255,150,100)';
            
            ctx.fillStyle=color;
            ctx.fillRect(i*deltaX,j*deltaY,deltaX,deltaY);
        }
    }
}
//--------------------------------------------------------
