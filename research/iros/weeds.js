//------------------------------------------------------
// Weed CLASS

function weed_grow(reward, dim_vec, time_step){
    for (var i=0; i < dim_vec[0]; ++i){
        for (var j=0; j < dim_vec[1]; ++j){
            
            // seedbank emergence
            // average event for waterhemp is computed as
            // 90% of seedbank emerge in 2 month
            // lambda = 0.9*seedbank/2 month = 0.9 seedbank / 60*24*60*60
            lambda = time_step * 0.9 * seed_bank[i][j] / 5184000;
            num_new_seeds = getPoisson(lambda);
            weed_density[i][j] += num_new_seeds;
            seed_bank[i][j] -= num_new_seeds;
            
            // seedling growth
            if (weed_density[i][j] > 0){
                weed_height[i][j] += growth_speed * time_step;
                reward[i][j] = weed_height[i][j];
            }
        }
    }
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

function getBinomial(n, p) {
  var x = 0;
  for(var i = 0; i < n; i++) {
    if(Math.random() < p)
      x++;
  }
  return x;
}
////------------------------------------------------------
