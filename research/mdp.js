//------------------------------------------------------
function mdp_init(){

    row_queue = new Array(n_agents);
    for (var i=0; i < n_agents; ++i){
        row_queue[i] = [];
    }
    
    row_complete = new Array(n_dim);
    
    for (var i=0; i < n_dim; ++i){
        row_complete[i]         = 0;
        row_queue[i]            = [];
        reward[i]               = new Array(n_dim);
        policy[i]               = new Array(n_dim);
        value[i]                = new Array(n_dim);
        qvalue[i]               = new Array(n_dim);
        term_map[i]             = new Array(n_dim);
        for (var j=0; j < n_dim; ++j){
            reward[i][j]        = -1.0;
            policy[i][j]        = 0;
            value[i][j]         = 0.0;
            term_map[i][j]      = false;
            qvalue[i][j]        = new Array(n_actions);
            for (var k=0; k < n_actions; ++k){
                qvalue[i][j][k] = 0.0;
            }
        }
    }
    
    mdp_init_reward(n_dim);
    mdp_init_symbols(n_dim);
}

function weed_grow(){
    for (var i=0; i < n_dim; ++i){
        for (var j=0; j < n_dim; ++j){
            if (reward[i][j] > 0){
                reward[i][j] = (reward[i][j]) + (growth_step);
                if (reward[i][j] > reward_grown){
                    weed_spread(i, j, n_dim, t_time);
                }
            }
        }
    }
}

function update_row_queue0(){
    for (var i=0; i < n_agents; ++i){
        for (var j=0; j < 17; ++j){
            row_queue[i][j] = i*17+j;
        }
    }
}

function update_row_queue(){
    var row_checked     = new Array(n_dim);
    var row_order       = new Array(n_dim);
    var row_weed_num    = new Array(n_dim);
    var agent_inc       = new Array(n_agents);
    var count           = 0;
    var agent_inc       = new Array(n_agents);
    
    for (var i=0; i < n_dim; ++i){
        row_weed_num[i] = 0;
        for (var j=0; j < n_dim; ++j){
            if (reward[i][j] > 0){
                row_weed_num[i] += 1;
            }
        }
        row_checked[i] = row_complete[i];
    }
    
    for (var i=0; i < n_dim; ++i){
        if(row_checked[i] == 0){
            count += 1;
        }
    }
    
    for (var i=0; i < n_agents; ++i){
        agent_inc[i] = 0;
    }
    
    var row_order           = new Array(count);
    for (var i=0; i < count; ++i){
        var max_row_weed_num    = 0;
        var max_row             = 0;
        for (var j=0; j < n_dim; ++j){
            if((row_weed_num[j] > max_row_weed_num) && (row_checked[j] == 0)){
                max_row_weed_num = row_weed_num[j];
                max_row = j;
                row_checked[j] = 1;
            }
        }
        row_order[i] = max_row
    }
   
    for (var i=0; i < count; ++i){
        var min_dist            = n_dim;
        var dist                = 0;
        var min_agent           = 0;
        
        max_row = row_order[i];
        for (var j=0; j < n_agents; ++j){
            var dist = Math.abs(agent_list[j].state[0] - max_row);
            if (dist < min_dist){
                min_dist = dist;
                min_agent = j;
            }
        }
        
        var length = agent_list[min_agent].queue.length;
        row_queue[min_agent][agent_list[min_agent].row_queue_num + 1 + agent_inc[min_agent]] = max_row;
        agent_inc[min_agent] += 1;
    }
}

function weed_spread(x, y, n_dim, t_time){
    var spread_radius = 1 + Math.floor((reward[x][y] - 700)/101);
    var random_x;
    var random_y;
    if(document.getElementById("uniform").checked){
        random_x = Math.floor((Math.random() * spread_radius) - spread_radius);
        random_y = Math.floor((Math.random() * spread_radius) - spread_radius);
    }
    if(document.getElementById("stardard_normal").checked){
        random_x = Math.floor((normal(0, 1, 10) * spread_radius) - spread_radius);
        random_y = Math.floor((normal(0, 1, 10) * spread_radius) - spread_radius);
        
    }
    if(document.getElementById("brownian_motion").checked){
        random_x = Math.floor((normal(0, t_time, 10) * spread_radius) - spread_radius);
        random_y = Math.floor((normal(0, t_time, 10) * spread_radius) - spread_radius);
    }
    if(((x + random_x) > 0) && ((x + random_x) < n_dim) && ((y + random_y) > 0) && ((y + random_y) < n_dim)){
        if(reward[x + random_x][y + random_y] == 0){
            reward[x + random_x][x + random_y] = 100;
        }
    }
}

function normal(mu, sigma, nsamples){
    if(!nsamples){
        nsamples = 6;
    }
    if(!sigma){
        sigma = 1;
    }
    if(!mu){
        mu=0;
    }
                
    var run_total = 0
    for(var i=0 ; i<nsamples ; i++){
        run_total += Math.random();
    }
    
    return sigma*(run_total - nsamples/2)/(nsamples/2) + mu;
}

function mdp_step(current_state,action,n_dim){
    return current_state;
}

function update_qvalue(current_state, new_state, action, rew){
    
    var alpha = document.getElementById("alpha").value;
    var gamma = document.getElementById("gamma").value;
    
    var qnext = get_qvalue(new_state);
    var maxQnext = findMaxVal(qnext);
    var learned = rew + gamma*maxQnext - get_qvalue(current_state)[action];
    
    qvalue[current_state[0]][current_state[1]][action] += alpha * learned;
}
                                                   
function get_qvalue(current_state){
    return qvalue[current_state[0]][current_state[1]];
}

function get_transition(current_state_1D, action, n_dim){
    new_state = 0;
    for (var k=0; k < n_dim*n_dim; ++k){
        if (transition[action][current_state_1D][k] == 1.0){
            new_state = k;
            break;
        }
        else{
            new_state = current_state_1D;
        }
    }
    return new_state;
}

function mdp_init_transition(n_dim){
    for (var i=0; i < n_actions; ++i){
        transition[i] = new Array(n_actions);
        for (var j=0; j < n_dim*n_dim; ++j){
            transition[i][j] = new Array(n_dim*n_dim);
            for (var k=0; k < n_dim*n_dim; ++k){
                transition[i][j][k] = 0.0;
            }
        }
    }
    
    for (var i=0; i < n_actions; ++i){
        for (var j=0; j < n_dim*n_dim; ++j){
            rand = Math.floor(Math.random() * n_dim*n_dim + 0);
            transition[i][j][rand] = 1.0;
        }
    }
}

function mdp_init_symbols(n_dim){
    var alphabet = "♠♥♣♦☂☁☀★☎☘☙☾♚♞abcdefghjklmnopqrstu";
   for (var i=0; i < n_dim; ++i){
       sym_map[i] = new Array(n_dim);
       for (var j=0; j < n_dim; ++j){
            sym_map[i][j] = ' ';
        }
    }
    for (var i=0; i < n_dim; ++i){
        var s = mdp_random_state(n_dim);
        var symbol = alphabet[i];
        sym_map[s[0]][s[1]] = symbol;
    }
}

function mdp_init_reward(n_dim){
    for (var i = 0; i < n_dim*n_dim/20;++i){
        [xi,yi] = mdp_random_state(n_dim);
        reward[xi][yi] += 100;
        term_map[xi][yi] = true;
    }
}

function mdp_random_state(n_dim){
    var all_clr = false;
    
    while (!all_clr){
        var rand1 = Math.floor(Math.random() * n_dim );
        var rand2 = Math.floor(Math.random() * n_dim );
        if (term_map[rand1][rand2] == false ) all_clr = true;
        s = [rand1, rand2];
    }
    return s;
}

//SERVICE FUNCTIONS
function findMaxInd(arr) {
    if (arr.length == 0)
        return -1;

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++)
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }

    return maxIndex;
}

function findMaxVal(arr) {
    if (arr.length == 0)
        return -1;
    
    var max = arr[0];
    
    for (var i = 1; i < arr.length; i++)
        if (arr[i] > max) {
            max = arr[i];
        }
    
    return max;
}
//------------------------------------------------------
