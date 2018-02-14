//-- MDP Parameters
var policy          = [];
var value           = [];
var qvalue          = [];
var transition      = [];
var term_map        = [];
var sym_map         = [];
var n_actions       = 4;

var reward          = [];
var reward_hist     = [];

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
            reward[i][j]        = 0;
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

//function update_row_queue0(){
//    for (var i=0; i < n_agents; ++i){
//        for (var j=0; j < n_agent_rows; ++j){
//            row_queue[i][j] = i*n_agent_rows+j;
//        }
//    }
//}
//
//function update_row_queue(){
//    var row_checked     = new Array(n_dim);
//    var row_order       = new Array(n_dim);
//    var row_weed_num    = new Array(n_dim);
//    var agent_inc       = new Array(n_agents);
//    var count           = 0;
//    var agent_inc       = new Array(n_agents);
//    var row_order       = [];
//    
//    for (var i=0; i < n_agents; ++i){
//        agent_inc[i]    = 0;
//        row_queue[i]    = [];
//        row_queue[i][0] = i*n_agent_rows;
//    }
//    
//    for (var i=0; i < n_dim; ++i){
//        row_weed_num[i] = 0;
//        for (var j=0; j < n_dim; ++j){
//            if (reward[i][j] > 0){
//                row_weed_num[i] += 1;
//            }
//        }
//        row_checked[i] = row_complete[i];
//        if(row_weed_num[i] == 0){
//            row_checked[i] = 1;
//        }
//        if(row_checked[i] == 0){
//            count += 1;
//        }
//    }
//    
//    if(count == 0){
//        for (var i=0; i < n_dim; ++i){
//            row_complete[i] = 0;
//            row_checked[i] = row_complete[i];
//        }
//        count = n_dim;
//    }
//    
//    for (var i=0; i < count; ++i){
//        var max_row_weed_num    = 0;
//        var max_row             = 0;
//        for (var j=0; j < n_dim; ++j){
//            if((row_weed_num[j] > max_row_weed_num) && (row_checked[j] == 0)){
//                max_row_weed_num = row_weed_num[j];
//                max_row = j;
//            }
//        }
//        row_checked[max_row] = 1;
//        row_order[i] = max_row;
//    }
//    
//    for (var i=0; i < count; ++i){
//        var dist;
//        var min_dist            = n_dim;
//        var min_agent           = 0;
//        
//        max_row = row_order[i];
//        for (var j=0; j < n_agents; ++j){
//            dist = Math.abs(n_agent_rows * j - max_row);
//            if (dist < min_dist){
//                min_dist = dist;
//                min_agent = j;
//            }
//        }
//        
//        var length = agent_list[min_agent].queue.length;
//        row_queue[min_agent][1 + agent_inc[min_agent]] = max_row;
//        agent_inc[min_agent] += 1;
//    }
//}

function est_reward(rr){
    var est_sum = [];
    for (var i=0; i<n_dim; i++){
        var ss = 0;
        for (var j=0; j<n_dim; j++) ss += rr[i][j];
        est_sum[i] = ss;
    }
    return est_sum;
}

function sortIndices(arr) {
    var r = [];
    var a = arr.slice(0,n_dim);
    for (var i=0;i<n_dim;i++){
        var ind = findMaxInd(a);
        r[i] = ind;
        a[ind] = 0;
    }
  return r;
}

function simple_planning(array,n_ag){
    var list = sortIndices(array);
    var r = new Array(n_ag);
    for (var i=0;i<n_ag;i++){
        r[i] = [];
        for (var j=0;j<n_dim/n_ag;j++){
        r[i][j] = list[n_ag * j + i];
    }}
    return r;
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
    for (var i = 0; i < n_dim*n_dim/100;++i){
        [xi,yi] = mdp_random_state(n_dim);
        reward[xi][yi] += 0.001;
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
