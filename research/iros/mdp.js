//------------------------------------------------------
// MDP CLASS

function mdp_init(){
    row_queue                       = new Array(n_agents);
    row_queue_exp                   = new Array(n_agents);
    agent_busy                      = new Array(n_agents);
    show_row                        = new Array(n_dim);
    row_occupied                    = new Array(n_dim);
    
    value                           = [];
    value_exp                       = [];
    
    row_queue                       = [];
    row_queue_exp                   = [];
    
    for (var i=0; i < n_agents; ++i){
        row_queue[i]                = [];
        row_queue_exp[i]            = [];
        agent_busy[i]               = 0;
    }
    
    for (var i=0; i < n_dim; ++i){
        show_row[i]                 = 0;
        row_occupied[i]             = 0;
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
        seed_bank[i]                = new Array(n_dim);
        term_map[i]                 = new Array(n_dim);
        
        value[i]                    = new Array(n_agents);
        value_exp[i]                = new Array(n_agents);
        
        for (var j=0; j < n_dim; ++j){
            if(PEI_on_not_off){
                show_reward[i][j]   = 0;
            }
            else{
                show_reward[i][j]   = 1;
            }
            reward[i][j]            = 0;
            seed_bank[i][j]         = init_seedbank;
            weed_hist[i][j]         = 0;
            weed_height[i][j]       = 0;
            weed_density[i][j]      = 0;
            term_map[i][j]          = false;
        }
        for (var j=0; j < n_agents; ++j){
            value[i][j]            = new Array(n_dim);
            value_exp[i][j]        = new Array(n_dim);
            
            for (var k=0; k < n_dim; ++k){
                value[i][j][k]     = 0.0;
                value_exp[i][j][k] = 0.0;
            }
        }
    }
}

function update_agent_reward_and_queue_and_value(){
    var row_max_agent                   = new Array(n_dim);
    var agent_inc                       = new Array(n_agents);
    var max_agent_row                   = new Array(n_agents);
    var row_checked                     = new Array(n_dim);
    
    var row_max_agent_exp               = new Array(n_dim);
    var agent_inc_exp                   = new Array(n_agents);
    var max_agent_row_exp               = new Array(n_agents);
    var row_checked_exp                 = new Array(n_dim);
    
    var row_weed_num                    = new Array(n_dim);
    var row_reward_tot                  = new Array(n_dim);
    
    for (var i=0; i < n_agents; ++i){
        max_agent_row[i]                = -1;
        max_agent_row_exp[i]            = -1;
        agent_inc[i]                    = 0;
        agent_inc_exp[i]                = 0;
        row_queue[i]                    = [];
        row_queue_exp[i]                = [];
    }
    
    for (var i=0; i < n_dim; ++i){
        value[i]                   = new Array(n_agents);
        value_exp[i]               = new Array(n_agents);
        for (var j=0; j < n_agents; ++j){
            value[i][j]            = new Array(n_dim);
            value_exp[i][j]        = new Array(n_dim);
            for (var k=0; k < n_dim; ++k){
                value[i][j][k]     = 0.0;
                value_exp[i][j][k] = 0.0;
            }
        }
    }
    
    if(PEI_on_not_off == 1){
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
            average_row_reward      = 0;
        }
    }
    
    for (var i = 0; i < n_dim; i++){
        row_reward_tot[i]               = 0;
        row_weed_num[i]                 = 0;
        
        row_max_agent[i]                = -1;
        row_max_agent_exp[i]            = -1;
        
        for (var j = 0; j < n_dim; j++){
            if(PEI_on_not_off == 0){
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
        
        if(row_occupied[i] == 1){
            row_checked[i]              = 1;
            row_checked_exp[i]          = 1;
        }
    }
    
    for (var i = 0; i < n_agents; ++i){
        show_row[agent_list[i].d_location[0]] = 1;
        row_occupied[agent_list[i].d_location[0]] = 1;
        row_checked[agent_list[i].d_location[0]] = 1;
        row_checked_exp[agent_list[i].d_location[0]] = 1;
    }
    
   
    for (var j=0; j < n_agents; ++j){
        var s                    = agent_list[j].d_location;
        for (var i=0; i < n_dim; ++i){
            if(row_checked[i]  == 0){
                if(agent_busy[j] == 0){
                    var target_reward         = row_reward_tot[i];
                    if(CO_on_not_off){
                        var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                        if((agent_list[j].battery - 0.05*t_target) <= 0){
                            t_target         += (Math.abs(s[0]-0))/agent_list[j].speed + T_CHARGE;
                        }
                    }
                    else{
                        var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                    }
                    update_value(s[0], i, j, target_reward, t_target);
                }
            }
        }
            
        var qmax = -Infinity;
        for (var i=0; i < n_dim; ++i){
            if(row_checked[i]  == 0){
                if(agent_busy[j] == 0){
                    var qnext                 = value[s[0]][j][i];
                    if(qnext > qmax){
                        qmax                  = qnext;
                        max_agent_row[j]      = i;
                    }
                }
            }
        }
            
        if((max_agent_row[j] != -1) && (qmax > 0)){
            row_queue[j]                      = [];
            row_queue[j][0]                   = max_agent_row[j];
            agent_inc[j]                     += 1;
            row_reward_tot[max_agent_row[j]]  = 0;
        }
        
        
        if (((max_agent_row[j] == -1) || (qmax <= 0)) && (PEI_on_not_off == 0)){
            var row_inc   = s[0];
            for(var k=0; k < n_dim; ++k){
                if(row_occupied[row_inc] == 0){
                    break;
                }
                if(row_inc + 1 < n_dim){
                    row_inc += 1;
                }
                else{
                    row_inc = 0;
                }
            }
            row_queue[j]                = [];
            row_queue[j][0]             = row_inc;
            agent_inc[j]               += 1;
            row_reward_tot[row_inc]     = 0;
        }
        
        if((PEI_on_not_off == 1) && (TIG_on_not_off == 1)){
            for (var i=0; i < n_dim; ++i){
                if(row_checked_exp[i] == 0){
                    if(agent_busy[j] == 0){
                        var information_IDX      = 0;
                        for(var k = Math.max(0,s[0]-observation_radius); k <= Math.min(n_dim, s[0] + observation_radius); ++k){
                            if(show_row[k] == 0){
                                information_IDX += 1;
                            }
                        }
                        var target_reward         = (average_row_reward * information_IDX);
                        if(CO_on_not_off){
                            var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                            if((agent_list[j].battery - 0.05*t_target) <= 0){
                                t_target         += (Math.abs(s[0]-0))/agent_list[j].speed + T_CHARGE;
                            }
                        }
                        else{
                            var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                        }
                        update_value_exp(s[0], i, j, target_reward, t_target);
                    }
                }
            }
            
            var qmax = -Infinity;
            for (var i=0; i < n_dim; ++i){
                if(row_checked_exp[i] == 0){
                    if(agent_busy[j] == 0){
                        var qnext                = value_exp[s[0]][j][i];
                        if(qnext > qmax){
                            qmax                 = qnext;
                            max_agent_row_exp[j] = i;
                        }
                    }
                }
            }
            
            if(max_agent_row[j] != -1){
                row_queue_exp[j]                      = [];
                row_queue_exp[j][0]                   = i;
                agent_inc_exp[j]                     += 1;
                row_checked_exp[max_agent_row_exp[j]] = 1;
            }
        }
    }
    
    if(PEI_on_not_off == 1){
        for (var i=0; i < n_agents; ++i){
            var s          = agent_list[i].d_location;
            if(agent_busy[i] == 0){
                if(TIG_on_not_off == 0){
                    if(agent_inc[i] == 0){
                        var row_inc   = s[0];
                        for(var j=0; j < n_dim; ++j){
                            if(show__row[row_inc] == 0){
                                break;
                            }
                            if(row_inc + 1 < n_dim){
                                row_inc += 1;
                            }
                            else{
                                row_inc = 0;
                            }
                        }
                        row_queue[i]                      = [];
                        if(show_row[row_inc] == 0){
                            row_queue[i][0]               = row_inc;
                            show_row[row_inc]             = 1;
                        }
                    }
                    if(agent_inc[i] != 0){
                        show_row[row_queue[i][0]]         = 1;
                    }
                }
                else{
                    if((agent_inc[i] != 0) && (agent_inc_exp[i] == 0)){
                        show_row[row_queue[i][0]]         = 1;
                    }
                    else if((agent_inc[i] != 0) && (agent_inc_exp[i] != 0)){
                        if(value_exp[i][row_queue_exp[i][0]] >= value[i][row_queue[i][0]]){
                            row_queue[i] = [];
                            row_queue[i][0]  = row_queue_exp[i][0];
                            show_row[row_queue_exp[i][0]] = 1;
                        }
                        else{
                            show_row[row_queue[i][0]]     = 1;
                        }
                    }
                    else if ((agent_inc[i] == 0) && (agent_inc_exp[i] != 0)){
                        row_queue[i] = [];
                        row_queue[i][0]  = row_queue_exp[i][0];
                        show_row[row_queue_exp[i][0]]      = 1;
                    }
                    else if ((agent_inc[i] == 0) && (agent_inc_exp[i] == 0)) {
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
                        if(show_row[row_inc] == 0){
                            row_queue[i][0]  = row_inc;
                            show_row[row_inc]        = 1;
                        }
                    }
                }
            }
        }
    }
    
    //console.log(row_weed_num);
    //console.log(agent_inc);
    //console.log(row_max_agent);
    //console.log(max_agent_row);
}

/*function update_agent_reward_and_queue_and_value(){
    var row_max_agent                   = new Array(n_dim);
    var agent_inc                       = new Array(n_agents);
    var max_agent_row                   = new Array(n_agents);
    var row_checked                     = new Array(n_dim);
    
    var row_max_agent_exp               = new Array(n_dim);
    var agent_inc_exp                   = new Array(n_agents);
    var max_agent_row_exp               = new Array(n_agents);
    var row_checked_exp                 = new Array(n_dim);
    
    var row_weed_num                    = new Array(n_dim);
    var row_reward_tot                  = new Array(n_dim);
    
    for (var i=0; i < n_agents; ++i){
        max_agent_row[i]                = -1;
        max_agent_row_exp[i]            = -1;
        agent_inc[i]                    = 0;
        agent_inc_exp[i]                = 0;
        row_queue[i]                    = [];
        row_queue_exp[i]                = [];
    }
    
    for (var i=0; i < n_dim; ++i){
        value[i]                   = new Array(n_agents);
        value_exp[i]               = new Array(n_agents);
        for (var j=0; j < n_agents; ++j){
            value[i][j]            = new Array(n_dim);
            value_exp[i][j]        = new Array(n_dim);
            for (var k=0; k < n_dim; ++k){
                value[i][j][k]     = 0.0;
                value_exp[i][j][k] = 0.0;
            }
        }
    }
    
    if(PEI_on_not_off == 1){
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
            average_row_reward      = 0;
        }
    }
    
    for (var i = 0; i < n_dim; i++){
        row_reward_tot[i]               = 0;
        row_weed_num[i]                 = 0;
        
        row_max_agent[i]                = -1;
        row_max_agent_exp[i]            = -1;
        
        for (var j = 0; j < n_dim; j++){
            if(PEI_on_not_off == 0){
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
        
        if(row_occupied[i] == 1){
            row_checked[i]              = 1;
            row_checked_exp[i]          = 1;
        }
    }
    
    for (var i = 0; i < n_agents; ++i){
        show_row[agent_list[i].d_location[0]] = 1;
        row_occupied[agent_list[i].d_location[0]] = 1;
        row_checked[agent_list[i].d_location[0]] = 1;
        row_checked_exp[agent_list[i].d_location[0]] = 1;
    }
    
    for (var i=0; i < n_dim; ++i){
        if(row_checked[i]  == 0){
            for (var j=0; j < n_agents; ++j){
                if(agent_busy[j] == 0){
                    var s                     = agent_list[j].d_location;
                    var target_reward         = row_reward_tot[i];
                    if(CO_on_not_off){
                        var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                        if((agent_list[j].battery - 0.05*t_target) <= 0){
                            t_target         += (Math.abs(s[0]-0))/agent_list[j].speed + T_CHARGE;
                        }
                    }
                    else{
                        var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                    }
                    update_value(s[0], i, j, target_reward, t_target);
                }
            }
            var qmax = -Infinity;
            for (var j=0; j < n_agents; ++j){
                if(agent_busy[j] == 0){
                    var s                     = agent_list[j].d_location;
                    var qnext                 = value[s[0]][j][i];
                    if(qnext > qmax){
                        qmax                  = qnext;
                        row_max_agent[i]      = j;
                    }
                }
            }
            if(row_max_agent[i] != -1){
                row_queue[row_max_agent[i]][agent_inc[row_max_agent[i]]]    = i;
                agent_inc[row_max_agent[i]]                                 += 1;
            }
        }
        if((row_checked_exp[i] == 0) && (PEI_on_not_off == 1) && (TIG_on_not_off == 1)){
            for (var j=0; j < n_agents; ++j){
                if(agent_busy[j] == 0){
                    var s                    = agent_list[j].d_location;
                    var information_IDX      = 0;
                    for(var k = Math.max(0,s[0]-observation_radius); k <= Math.min(n_dim, s[0] + observation_radius); ++k){
                        if(show_row[k] == 0){
                            information_IDX += 1;
                        }
                    }
                    var target_reward         = (average_row_reward * information_IDX);
                    if(CO_on_not_off){
                        var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                        if((agent_list[j].battery - 0.05*t_target) <= 0){
                            t_target         += (Math.abs(s[0]-0))/agent_list[j].speed + T_CHARGE;
                        }
                    }
                    else{
                        var t_target          = (Math.abs(s[0]-i)/agent_list[j].speed + 209/agent_list[j].speed + T_KILL*row_weed_num[i]);
                    }
                    update_value_exp(s[0], i, j, target_reward, t_target);
                }
            }
            var qmax = -Infinity;
            for (var j=0; j < n_agents; ++j){
                if(agent_busy[j] == 0){
                    var qnext                = value_exp[s[0]][j][i];
                    if(qnext > qmax){
                        qmax                 = qnext;
                        row_max_agent_exp[i] = j;
                    }
                }
            }
            
            if(row_max_agent_exp[i] != -1){
                row_queue_exp[row_max_agent_exp[i]][agent_inc_exp[row_max_agent_exp[i]]]    = i;
                agent_inc_exp[row_max_agent_exp[i]]                                         += 1;
            }
        }
    }
    
    for(var i=0; i<n_agents; ++i){
        if(agent_busy[i] == 0){
            var s                           = agent_list[i].d_location;
            var qmax                        = -Infinity;
            for(var j=0; j<agent_inc[i]; ++j){
                var qnext                   = value[s[0]][i][row_queue[i][j]];
                if(qnext > qmax){
                    qmax                    = qnext;
                    max_agent_row[i]        = row_queue[i][j];
                }
            }
        }
    }
    
    for(var i=0; i<n_agents; ++i){
        if(agent_busy[i] == 0){
            var s                            = agent_list[i].d_location;
            if(max_agent_row[i] != -1){
                row_queue[i]                 = [];
                row_queue[i][0]              = max_agent_row[i];
            }
            if ((max_agent_row[i] == -1) && (PEI_on_not_off == 0)){
                var row_inc   = s[0];
                for(var j=0; j < n_dim; ++j){
                    if(row_occupied[row_inc] == 0){
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
                row_queue[i][0]             = row_inc;
                row_occupied[row_inc]       = 1;
            }
        }
    }
    
    if((PEI_on_not_off == 1) && (TIG_on_not_off == 1)){
        for(var i=0; i<n_agents; ++i){
            if(agent_busy[i] == 0){
                var s                    = agent_list[i].d_location;
                var qmax = -Infinity;
                for(var j=0; j<agent_inc_exp[i]; ++j){
                    var qnext                = value_exp[s[0]][i][row_queue_exp[i][j]];
                    if(qnext > qmax){
                        qmax                 = qnext;
                        max_agent_row_exp[i] = row_queue_exp[i][j];
                    }
                }
            }
        }
        
        for(var i=0; i<n_agents; ++i){
            if(agent_busy[i] == 0){
                var s         = agent_list[i].d_location;
                if(max_agent_row_exp[i] != -1){
                    row_queue_exp[i]        = [];
                    row_queue_exp[i][0]     = max_agent_row_exp[i];
                }
            }
        }
    }
    
    if(PEI_on_not_off == 1){
        for (var i=0; i < n_agents; ++i){
            if(agent_busy[i] == 0){
                var s          = agent_list[i].d_location;
                if(TIG_on_not_off == 0){
                    if(agent_inc[i] == 0){
                        var row_inc   = s[0];
                        for(var j=0; j < n_dim; ++j){
                            if(show__row[row_inc] == 0){
                                break;
                            }
                            if(row_inc + 1 < n_dim){
                                row_inc += 1;
                            }
                            else{
                                row_inc = 0;
                            }
                        }
                        row_queue[i]                      = [];
                        if(show_row[row_inc] == 0){
                            row_queue[i][0]               = row_inc;
                            show_row[row_inc]             = 1;
                        }
                    }
                    if(agent_inc[i] != 0){
                        show_row[row_queue[i][0]]         = 1;
                    }
                }
                else{
                    if((agent_inc[i] != 0) && (agent_inc_exp[i] == 0)){
                        show_row[row_queue[i][0]]         = 1;
                    }
                    else if((agent_inc[i] != 0) && (agent_inc_exp[i] != 0)){
                        if(value_exp[i][row_queue_exp[i][0]] >= value[i][row_queue[i][0]]){
                            row_queue[i] = [];
                            row_queue[i][0]  = row_queue_exp[i][0];
                            show_row[row_queue_exp[i][0]] = 1;
                        }
                        else{
                            show_row[row_queue[i][0]]     = 1;
                        }
                    }
                    else if ((agent_inc[i] == 0) && (agent_inc_exp[i] != 0)){
                        row_queue[i] = [];
                        row_queue[i][0]  = row_queue_exp[i][0];
                        show_row[row_queue_exp[i][0]]      = 1;
                    }
                    else if ((agent_inc[i] == 0) && (agent_inc_exp[i] == 0)) {
                       
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
                        if(show_row[row_inc] == 0){
                            row_queue[i][0]  = row_inc;
                            show_row[row_inc]        = 1;
                        }
                    }
                }
            }
        }
    }
    
    //console.log(row_weed_num);
    //console.log(agent_inc);
    //console.log(row_max_agent);
    //console.log(max_agent_row);
}*/

//MDP FUNCTIONS
function mdp_step(current_state,action,n_dim){
    return current_state;
}

function update_value(current_state, new_state, agent, target_reward, t_target){
    var learned = Math.pow(gamma, t_target) * target_reward - get_value(current_state, agent)[new_state];
    value[current_state][agent][new_state] += alpha * learned;
}

function update_value_exp(current_state, new_state, agent, target_reward, t_target){
    var learned = Math.pow(gamma, t_target) * target_reward - get_value(current_state, agent)[new_state];
    value_exp[current_state][agent][new_state] += alpha * learned;
}

function get_value(current_state, agent){
    return value[current_state][agent];
}

function initial_uniform(n_seeds,n_dim){
    for (var i = 0; i < n_seeds;++i){
        [xi,yi] = mdp_random_state(n_dim);
        weed_hist[xi][yi] += 1;
        weed_height[xi][yi] += 1;
        weed_density[xi][yi] += 1;
        reward[xi][yi] = weed_height[xi][yi];
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
