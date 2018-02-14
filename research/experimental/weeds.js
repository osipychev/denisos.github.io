var GROWTH_SPEED = 1.0/(24*60*60); // 1 inch per day for Waterhemp (https://www.extension.purdue.edu/extmedia/bp/gwc-13.pdf)
var CAN_SEED = 6; // inch

var Weeds = function (infestation_level) {
    this.weed_matrix = [];
     for (var i=0; i < n_dim; ++i){
        this.weed_matrix[i] = new Array(n_dim);
        for (var j=0; j < n_dim; ++j){
            this.weed_matrix[i][j] = 0;
        }
    }
    
    for (var i = 0; i < n_dim*n_dim*infestation_level;++i){
        [xi,yi] = this.random_state(n_dim);
        this.weed_matrix[xi][yi] += Math.random() * 3.0;
    }
}

Weeds.prototype.random_state = function(n_dim){
    var all_clr = false;
    
    while (!all_clr){
        var rand1 = Math.floor(Math.random() * n_dim );
        var rand2 = Math.floor(Math.random() * n_dim );
        if (this.weed_matrix[rand1][rand2] == 0 ) all_clr = true;
        s = [rand1, rand2];
    }
    return s;
}
    
Weeds.prototype.step = function(dim_vec,t_step) {
    for (var i=0; i < dim_vec[0]; ++i){
        for (var j=0; j < dim_vec[1]; ++j){
            if (this.weed_matrix[i][j] > 0){
                this.weed_matrix[i][j] += GROWTH_SPEED * t_step;
                if (this.weed_matrix[i][j] > CAN_SEED){
                    this.weed_matrix[i-1][j-1]++;
                    this.weed_matrix[i-1][j+1]++;
                    this.weed_matrix[i+1][j+1]++;
                    this.weed_matrix[i+1][j-1]++;
                }
            }
        }
    }
    
    if (Math.random() < 0.01){
        [xi,yi] = this.random_state(n_dim);
        this.weed_matrix[xi][yi] += 0.001;
    }
    return this.weed_matrix;
}
Weeds.prototype.getReward = function(){
    return this.weed_matrix;
}
//function weed_spread(x, y, n_dim, t_time){
//    var spread_radius = 1 + Math.floor((reward[x][y] - reward_grown)/growth_factor);
//    var random_x;
//    var random_y;
//    if(document.getElementById("uniform").checked){
//        random_x = Math.round((Math.random() * spread_radius) - spread_radius);
//        random_y = Math.round((Math.random() * spread_radius) - spread_radius);
//    }
//    if(document.getElementById("stardard_normal").checked){
//        random_x = Math.round(getGaussianRandom(0, 1) * spread_radius);
//        random_y = Math.round(getGaussianRandom(0, 1) * spread_radius);
//    }
//    if(document.getElementById("brownian_motion").checked){
//        random_x = Math.round(getGaussianRandom(0, spread_radius));
//        random_y = Math.round(getGaussianRandom(0, spread_radius));
//    }
//    if(document.getElementById("poisson").checked){
//        random_x = Math.round(getPoisson(spread_radius) - spread_radius);
//        random_y = Math.round(getPoisson(spread_radius) - spread_radius);
//    }
//    if(((x + random_x) > 0) && ((x + random_x) < n_dim) && ((y + random_y) > 0) && ((y + random_y) < n_dim)){
//        if(reward[x + random_x][y + random_y] == 0){
//            reward[x + random_x][x + random_y] = 100;
//        }
//    }
//}
//
//function getGaussianRandom(mean, standardDeviation) {
//    var q, u, v, p;
//    do {
//        u = 2.0 * Math.random() - 1.0;
//        v = 2.0 * Math.random() - 1.0;
//        q = u * u + v * v;
//    } while (q >= 1.0 || q === 0);
//    p = Math.sqrt(-2.0 * Math.log(q) / q);
//    
//    return mean + standardDeviation * u * p;
//}
//
//function getPoisson(lambda) {
//    var L = Math.exp(-lambda);
//    var p = 1.0;
//    var k = 0;
//    
//    do {
//        k++;
//        p *= Math.random();
//    } while (p > L);
//    
//    return k-1;
//}