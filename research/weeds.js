var growth_speed     = 1/(24*60*60); // 1 inch per day
var can_seed   = 10; // inch

function weed_grow(reward, dim_vec, time_step){
    for (var i=0; i < dim_vec[0]; ++i){
        for (var j=0; j < dim_vec[1]; ++j){
            if (reward[i][j] > 0){
                reward[i][j] += growth_speed * time_step;
                if (reward[i][j] > can_seed){
                    //weed_spread(i, j, reward, dim_vec, time_step);
                }
            }
        }
    }
}

function weed_spread(x, y, n_dim, t_time){
    var spread_radius = 1 + Math.floor((reward[x][y] - reward_grown)/growth_factor);
    var random_x;
    var random_y;
    if(document.getElementById("uniform").checked){
        random_x = Math.round((Math.random() * spread_radius) - spread_radius);
        random_y = Math.round((Math.random() * spread_radius) - spread_radius);
    }
    if(document.getElementById("stardard_normal").checked){
        random_x = Math.round(getGaussianRandom(0, 1) * spread_radius);
        random_y = Math.round(getGaussianRandom(0, 1) * spread_radius);
    }
    if(document.getElementById("brownian_motion").checked){
        random_x = Math.round(getGaussianRandom(0, spread_radius));
        random_y = Math.round(getGaussianRandom(0, spread_radius));
    }
    if(document.getElementById("poisson").checked){
        random_x = Math.round(getPoisson(spread_radius) - spread_radius);
        random_y = Math.round(getPoisson(spread_radius) - spread_radius);
    }
    if(((x + random_x) > 0) && ((x + random_x) < n_dim) && ((y + random_y) > 0) && ((y + random_y) < n_dim)){
        if(reward[x + random_x][y + random_y] == 0){
            reward[x + random_x][x + random_y] = 100;
        }
    }
}

function getGaussianRandom(mean, standardDeviation) {
    var q, u, v, p;
    do {
        u = 2.0 * Math.random() - 1.0;
        v = 2.0 * Math.random() - 1.0;
        q = u * u + v * v;
    } while (q >= 1.0 || q === 0);
    p = Math.sqrt(-2.0 * Math.log(q) / q);
    
    return mean + standardDeviation * u * p;
}

function getPoisson(lambda) {
    var L = Math.exp(-lambda);
    var p = 1.0;
    var k = 0;
    
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    
    return k-1;
}