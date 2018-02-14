//-- GLOBAL VARIABLES
var reward      = [];
var policy      = [];
var value       = [];
var qvalue      = [];
var transition  = [];
var term_map    = [];
var sym_map     = [];

function mdp_init(n_dim){
    
    mdp_init_transition(n_dim);
    for (var i=0; i < n_dim; ++i){
        reward[i] = new Array(n_dim);
        policy[i] = new Array(n_dim);
        value[i] = new Array(n_dim);
        qvalue[i] = new Array(n_dim);
        term_map[i] = new Array(n_dim);
        for (var j=0; j < n_dim; ++j){
            reward[i][j] = -1.0;
            policy[i][j] = 0;
            value[i][j] = 0.0;
            term_map[i][j] = false;
            qvalue[i][j] = new Array(n_actions);
            for (var k=0; k < n_actions; ++k){
                qvalue[i][j][k] = 0.0;
            }
        }
    }
    mdp_init_reward(n_dim);
    mdp_init_symbols(n_dim);
}

function mdp_step(current_state,action,n_dim,norm_trans,semi_trans,rand_trans){
    
    if (norm_trans){
        if (action == 0){
            current_state[0] = Math.max(0,current_state[0]-1);
        }
        if (action == 1){
            current_state[0] = Math.min(n_dim-1,current_state[0]+1);
        }
        if (action == 2){
            current_state[1] = Math.max(0,current_state[1]-1);
        }
        if (action == 3){
            current_state[1] = Math.min(n_dim-1,current_state[1]+1);
        }
    }
    else if (semi_trans){
        if (action == 0){
            current_state[0] = Math.min(n_dim-1,current_state[0]+1);
            current_state[1] = Math.min(n_dim-1,current_state[1]+1);
        }
        if (action == 1){
            current_state[0] = Math.max(0,current_state[0]-1);
            current_state[1] = Math.min(n_dim-1,current_state[1]+1);
        }
        if (action == 2){
            current_state[1] = Math.max(0,current_state[1]-2);
        }
        if (action == 3){
            current_state[1] = Math.max(0,current_state[1]-1);
        }
    }
    else if (rand_trans){
        current_state_1D = current_state[0] + current_state[1]*(n_dim);
        new_state = get_transition(current_state_1D, action, n_dim);
    
        current_state[0] = Math.floor(new_state % (n_dim));
        current_state[1] = Math.floor(new_state / (n_dim));
    
        console.log("transition state for action:", current_state[0], current_state[1]);
    }
    
    return current_state;
}

function update_qvalue(current_state, new_state, action, rew, alpha, gamma){
    //var alpha = document.getElementById("alpha").value;
    //var gamma = document.getElementById("gamma").value;
    
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
    
    [xi,yi] = mdp_random_state(n_dim);
    reward[xi][yi] += 100;
    term_map[xi][yi] = true;
    
    for (var i = 0; i < n_dim*n_dim/20;++i){
    [xi,yi] = mdp_random_state(n_dim);
    reward[xi][yi] -= 100;
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
