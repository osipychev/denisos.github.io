//------------------------------------------------------
// MDP CLASS

function mdp_init(){
    row_queue                       = new Array(n_agents);
    row_checked                     = new Array(n_dim);
    
    row_queue_exp                   = new Array(n_agents);
    row_checked_exp                 = new Array(n_dim);
    
    row_weed_num                    = new Array(n_dim);
    row_reward_tot                  = new Array(n_dim);
    show_row                        = new Array(n_dim);
    qvalue_exp                      = [];
    row_queue_exp                   = [];
    
    for (var i=0; i < n_agents; ++i){
        row_queue[i]                = [];
        
        row_queue_exp[i]            = [];
        qvalue_exp[i]               = [];
    }
    
    for (var i=0; i < n_dim; ++i){
        row_checked[i]              = 0;
        show_row[i]                 = 0;
        row_weed_num[i]             = 0;
        row_reward_tot[i]           = 0;
        if(PEI_on_not_off){
            show_row[i]             = 0;
        }
        else{
            show_row[i]             = 1;
        }
        show_reward[i]              = new Array(n_dim);
        reward[i]                   = new Array(n_dim);
        weed_hist[i]                = new Array(n_dim);
        weed_height[i]              = new Array(n_dim);
        weed_density[i]             = new Array(n_dim);
        seed_bank[i] = new Array(n_dim);
        policy[i]                   = new Array(n_dim);
        value[i]                    = new Array(n_dim);
        show_reward[i]              = new Array(n_dim);
        qvalue[i]                   = new Array(n_agents);
        term_map[i]                 = new Array(n_dim);
        for (var j=0; j < n_dim; ++j){
            if(PEI_on_not_off){
                show_reward[i][j]   = 0;
            }
            else{
                show_reward[i][j]   = 1;
            }
            reward[i][j]            = 0;
            seed_bank[i][j] = document.getElementById("seedbank").value;
            weed_hist[i][j]         = 0;
            weed_height[i][j]       = 0;
            weed_density[i][j]      = 0;
            policy[i][j]            = 0;
            value[i][j]             = 0.0;
            term_map[i][j]          = false;
        }
        for (var j=0; j < n_agents; ++j){
            qvalue[i][j]            = new Array(n_dim);
            qvalue_exp[i]           = new Array(n_dim);
            
            for (var k=0; k < n_dim; ++k){
                qvalue[i][j][k]     = 0.0;
                qvalue_exp[i][j]    = 0.0;
            }
        }
    }
    
    //initial_uniform(n_dim);
    //mdp_init_symbols(n_dim);
}

/*
function update_row_queue(){
    var agent_inc       = new Array(n_agents);
    var row_checked_exp2       = new Array(n_agents);
    
    var row_order       = [];
    var count           = 0;
    
    for (var i=0; i < n_agents; ++i){
        agent_inc[i]    = 0;
        row_queue[i]    = [];
    }
    
    for (var i=0; i < n_dim; ++i){
        row_weed_num[i] = 0;
        row_checked_exp2[i]=0;
        for (var j=0; j < n_dim; ++j){
            if(!PEI_on_not_off){
                if (reward[i][j] > 0){
                    row_reward_tot[i] += reward[i][j];
                    row_weed_num[i] += 1;
                }
            }
            else{
                if((reward[i][j] > 0) && (show_reward[i][j] == 1)){
                    row_reward_tot[i] += reward[i][j];
                    row_weed_num[i]   += 1;
                }
            }
        }
        if(row_weed_num[i] == 0){
            row_checked[i]  = 1;
        }
        else if (row_weed_num[i] > 0){
            row_checked[i]  = 0;
            count += 1;
        }
    }
    
    for (var i=0; i < count; ++i){
        var max_row_weed_num    = -1;
        var max_row             = -1;
        for (var j=0; j < n_dim; ++j){
            if((row_reward_tot[j] > max_row_weed_num) && (row_checked[j] == 0) && (show_row[i]  == 1)){
                max_row_weed_num = row_reward_tot[j];
                max_row = j;
            }
        }
        if (max_row != -1){
            row_checked[max_row] = 1;
            row_order[i] = max_row;
        }
    }
    
    for (var i=0; i < count; ++i){
        max_row = row_order[i];
        
        var min_dist            = n_dim;
        var min_agent           = -1;
        var dist;
        for (var j=0; j < n_agents; ++j){
            var state = agent_list[j].c2d(agent_list[j].location);
            dist = Math.abs(state[0] - max_row);
            if (dist < min_dist){
                min_dist = dist;
                min_agent = j;
            }
        }
        if (min_agent != -1){
            row_queue[min_agent][agent_inc[min_agent]] = max_row;
            agent_inc[min_agent] += 1;
        }
    }
    
    for(var i = 0; i < n_agents; ++i){
        var max_row_reward               = -1;
        var max_row                      = -1;
        for(var j=0; j<agent_inc[i]; ++j){
            if(row_reward_tot[row_queue[i][j]] > max_row_reward){
                max_row_reward           = row_reward_tot[row_queue[i][j]];
                max_row                  = row_queue[i][j];
            }
        }
        console.log(max_row);
        if (max_row != -1){
            row_queue[i] = [];
            row_queue[i][0] = max_row;
        }
    }
    if(PEI_on_not_off){
        for (var i=0; i < n_agents; ++i){
            if(agent_inc[i] == 0){
                var s         = agent_list[i].c2d(agent_list[i].location);
                var row_inc   = s[0];
                for(var j=0; j < n_dim; ++j){
                    if(show_row[row_inc] == 0){
                        break;
                    }
                    if(row_inc + 1 < n_dim){
                        row_inc += 1;
                    }
                    else{
                        row_inc = 0;
                    }
                }
                row_queue[i]                = [];
                if((row_inc == s[0]) && (show_row[row_inc] == 0)){
                    row_queue[i][agent_inc[i]]  = row_inc;
                }
                else if (show_row[row_inc] == 0){
                    row_queue[i][agent_inc[i]]  = row_inc;
                }
                else if (s[0] + 1 < n_dim){
                    row_queue[i][agent_inc[i]]  = s[0] + 1;
                }
            }
        }
    }
}
*/

function update_agent_reward_and_queue_and_qvalue(){
    var row_max_agent                   = new Array(n_dim);
    var agent_inc                       = new Array(n_agents);
    var max_agent_row                   = new Array(n_agents);
    
    var row_exp_max_agent               = new Array(n_dim);
    var agent_inc_exp                   = new Array(n_agents);
    var max_agent_row_exp               = new Array(n_agents);
    // var row_checked2                = new Array(n_dim);
    var row_checked_exp                 = new Array(n_dim);
    // var row_checked_exp2             = new Array(n_dim);
    
    for (var i=0; i < n_agents; ++i){
        max_agent_row[i]                = -1;
        agent_inc[i]                    = 0;
        agent_inc_exp[i]                = 0;
        //total_agent_reward[i]         = 0;
        row_queue[i]                    = [];
        row_queue_exp[i]                = [];
//        var s                         = agent_list[i].c2d(agent_list[i].location);
    }
    
    if(PEI_on_not_off){
        var sum = 0;
        for(var i = 0; i < n_dim; ++ i){
            if(show_row[i] == 1){
                sum += 1;
            }
        }
        if(sum >= n_dim){
            for(var i = 0; i < n_dim; ++ i){
                show_row[i] = 0;
            }
            number_rows_explored    = 0;
            explored_row_total      = 0;
        }
    }
    
    for (var i = 0; i < n_dim; i++){
        row_reward_tot[i]               = 0;
        row_weed_num[i]                 = 0;
        
        row_max_agent[i]                = -1;
        
        row_exp_max_agent[i]            = -1;
        //row_checked2[i]                 = 0;
        //row_checked_exp2[i]             = 0;
        
        for (var j = 0; j < n_dim; j++){
            if(!PEI_on_not_off){
                if (reward[i][j] > 0){
                    row_reward_tot[i]   += reward[i][j];
                    row_weed_num[i]     += weed_density[i][j];
                }
            }
            else{
                if((reward[i][j] > 0) && (show_reward[i][j] == 1)){
                    row_reward_tot[i]   += reward[i][j];
                    row_weed_num[i]     += weed_density[i][j];
                }
            }
        }
        if(row_weed_num[i] == 0){
            row_checked[i]              = 1;
        }
        else if (row_weed_num[i] > 0){
            row_checked[i]              = 0;
        }
        
        if (show_row[i] == 1){
            row_checked_exp[i]          = 1;
        }
        else if(show_row[i] == 0){
            row_checked_exp[i]          = 0;
        }
    }
    for (var i = 0; i < n_agents; ++i){
        row_checked[agent_list[i].queue[0]] = 1;
        row_checked_exp[agent_list[i].queue[0]] = 1;
    }
    
    for (var i=0; i < n_dim; ++i){
        if((row_checked[i]  == 0)){
            for (var j=0; j < n_agents; ++j){
                var s                     = agent_list[j].c2d(agent_list[j].location);
                var target_reward         = row_reward_tot[i]; // - (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                if(CO_on_not_off){
                    var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                    if((agent_list[j].battery - 0.05*t_target) <= 0){
                        t_target         += (Math.abs(s[0]-0))/agent_list[j].speed + T_CHARGE;
                    }
                }
                else{
                    var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                }
                update_qvalue(s[0], i, j, target_reward, t_target);
            }
            var qmax = -Infinity;
            for (var j=0; j < n_agents; ++j){
                var s                     = agent_list[j].c2d(agent_list[j].location);
                var qnext                 = qvalue[s[0]][j][i];
                if(qnext > qmax){
                    qmax                  = qnext;
                    row_max_agent[i]      = j;
                }
            }
   
            if(row_max_agent[i] != -1){
                row_queue[row_max_agent[i]][agent_inc[row_max_agent[i]]]    = i;
                agent_inc[row_max_agent[i]]                                 += 1;
                //row_checked[i]                                              = 1;
            }
        }
        if((row_checked_exp[i] == 0) && (TIG_on_not_off == 1)){
            for (var j=0; j < n_agents; ++j){
                var s                    = agent_list[j].c2d(agent_list[j].location);
                var information_IDX = 1;
                if(i + 1 < n_dim){
                    if(row_checked_exp[i + 1] == 0){
                        //qvalue_exp[j][i] += qvalue[s[0]][j][i+1]
                        information_IDX += 1;
                    }
                }
                if(i - 1 > 0){
                    if(row_checked_exp[i - 1] == 0){
                        //qvalue_exp[j][i] += qvalue[s[0]][j][i-1]
                        information_IDX += 1;
                    }
                }
                var target_reward         = average_row_reward*information_IDX;
                if(CO_on_not_off){
                    var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                    if((agent_list[j].battery - 0.05*t_target) <= 0){
                        t_target         += (Math.abs(s[0]-0))/agent_list[j].speed + T_CHARGE;
                    }
                }
                else{
                    var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                }
                qvalue_exp[j][i] = alpha * (Math.pow(gamma, t_target) * target_reward - qvalue_exp[j][i]);
            }
            var qmax = -Infinity;
            for (var j=0; j < n_agents; ++j){
                var qnext                = qvalue_exp[j][i];
                if(qnext > qmax){
                    qmax                 = qnext;
                    row_exp_max_agent[i] = j;
                }
            }
            
            if(row_exp_max_agent[i] != -1){
                row_queue_exp[row_exp_max_agent[i]][agent_inc_exp[row_exp_max_agent[i]]]    = i;
                agent_inc_exp[row_exp_max_agent[i]]                                         += 1;
                //row_checked_exp[i]                                                          = 1;
            }
        }
    }
    
    for(var i=0; i<n_agents; ++i){
        var qmax = -Infinity;
        for(var j=0; j<agent_inc[i]; ++j){
            var s                       = agent_list[i].c2d(agent_list[i].location);
            var qnext                   = qvalue[s[0]][i][row_queue[i][j]];
            if(qnext > qmax){
                qmax                    = qnext;
                max_agent_row[i]        = row_queue[i][j];
            }
        }
    }
    
    for(var i=0; i<n_agents; ++i){
        var s         = agent_list[i].c2d(agent_list[i].location);
        if(max_agent_row[i] != -1){
            row_queue[i]                 = [];
            row_queue[i][0]              = max_agent_row[i];
        }
    }
    
    if(TIG_on_not_off == 1){
        for(var i=0; i<n_agents; ++i){
            var qmax = -Infinity;
            for(var j=0; j<agent_inc_exp[i]; ++j){
                var s                    = agent_list[i].c2d(agent_list[i].location);
                var qnext                = qvalue_exp[i][row_queue_exp[i][j]];
                if(qnext > qmax){
                    qmax                 = qnext;
                    max_agent_row_exp[i] = row_queue_exp[i][j];
                }
            }
        }
        
        for(var i=0; i<n_agents; ++i){
            var s         = agent_list[i].c2d(agent_list[i].location);
            if(max_agent_row_exp[i] != -1){
                row_queue_exp[i]        = [];
                row_queue_exp[i][0]     = max_agent_row_exp[i];
            }
        }
    }
    
    if(PEI_on_not_off){
        for (var i=0; i < n_agents; ++i){
            if(TIG_on_not_off == 0){
                if(agent_inc[i] == 0){
                    var s         = agent_list[i].c2d(agent_list[i].location);
                    var row_inc   = s[0];
                    for(var j=0; j < n_dim; ++j){
                        if(row_checked_exp[row_inc] == 0){
                            break;
                        }
                        if(row_inc + 1 < n_dim){
                            row_inc += 1;
                        }
                        else{
                            row_inc = 0;
                        }
                    }
                    row_queue[i]                = [];
                    if(row_checked_exp[row_inc] == 0){
                        row_queue[i][0]  = row_inc;
                        row_checked_exp[row_inc] = 1;
                    }
                }
            }
            else{
                if((agent_inc[i] != 0) && (agent_inc_exp[i] != 0)){
                    if(qvalue_exp[i][row_queue_exp[i][0]] >= qvalue[i][row_queue[i][0]]){
                        row_queue[i] = [];
                        row_queue[i][0]  = row_queue_exp[i][0];
                        row_checked_exp[row_queue_exp[i][0]] = 1;
                    }
                }
                else if ((agent_inc[i] == 0) && (agent_inc_exp[i] != 0)){
                    row_queue[i] = [];
                    row_queue[i][0]  = row_queue_exp[i][0];
                    row_checked_exp[row_queue_exp[i][0]] = 1;
                }
                else if ((agent_inc[i] == 0) && (agent_inc_exp[i] == 0)) {
                    var s         = agent_list[i].c2d(agent_list[i].location);
                    var row_inc   = s[0];
                    for(var j=0; j < n_dim; ++j){
                        if(row_checked_exp[row_inc] == 0){
                            break;
                        }
                        if(row_inc + 1 < n_dim){
                            row_inc += 1;
                        }
                        else{
                            row_inc = 0;
                        }
                    }
                    row_queue[i]                = [];
                    if(row_checked_exp[row_inc] == 0){
                        row_queue[i][0]  = row_inc;
                        row_checked_exp[row_inc] = 1;
                    }
                }
            }
        }
    }
    
    //console.log(agent_inc);
    //console.log(row_max_agent);
    //console.log(max_agent_row);
}

//MDP FUNCTIONS
function mdp_step(current_state,action,n_dim){
    return current_state;
}

function update_qvalue(current_state, new_state, agent, target_reward, t_target){
    
    //var alpha = document.getElementById("alpha").value;
    //var gamma = document.getElementById("gamma").value;
    
    //var qnext = get_qvalue(current_state, agent);
    //var maxQnext = findMaxVal(qnext);
    var learned = Math.pow(gamma, t_target) * target_reward - get_qvalue(current_state, agent)[new_state];
    qvalue[current_state][agent][new_state] += alpha * learned;
}

function get_qvalue(current_state, agent){
    return qvalue[current_state][agent];
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

function initial_uniform(n_seeds,n_dim){
    for (var i = 0; i < n_seeds;++i){
        [xi,yi] = mdp_random_state(n_dim);
        weed_hist[xi][yi] += 1;
        weed_height[xi][yi] += 1;
        weed_density[xi][yi] += 1;
        reward[xi][yi] = 0.001*weed_height[xi][yi]*weed_density[xi][yi];
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
