//------------------------------------------------------
// AGENT CLASS designed for DASLAB weeding simulator.
// uses the following global constants
// agent_speed
// MAX_WEED
//

// A farm swarm robot class init
var FarmAgent = function (id) {
    
    MAX_SPEED = agent_speed// for Wyatt code.
    
    this.id         = id;    
    this.directions = {north:0, south:1};
    this.modes      = {scout:0, idle:1, kill:2, inactive:-1, charging:3, going:4};
    
    this.mode       = this.modes.idle;
    this.location   = [0,0]; //[2.459*(n_dim-1)/(n_agents-1)*id,0]; // in feet
    this.d_location = [0,0] // discrete representation of location
    this.direction  = this.directions.north;
    this.speed      = MAX_SPEED; // in feet per second    
    this.battery    = 100;
    this.reward     = 0;
    this.timer      = 0; // some timer for internal agent use (like battery charge and how long it kills the weed)
    this.queue      = [];
    
    this.target     = [0,0];
}

// method - update state of agent based on the current state
FarmAgent.prototype.step = function (n_dim, t_step) {
    var new_state, new_location;
    switch(this.mode){
        case this.modes.scout:
            // move in a row
            if (this.direction == this.directions.north){
                this.location[1] -= this.speed * t_step;
            }
            else if (this.direction == this.directions.south){
                this.location[1] += this.speed * t_step;
            }
            
            // check if any location was skipped due to time scale
            var prev_d_location = this.d_location;
            this.d_location = this.c2d(this.location);
            var states_passed = this.d_location[1] - prev_d_location[1];
            
            // check if there is a weed - change mode to kill
            for (var i=0; i<Math.abs(states_passed); ++i){
                var check_loc = prev_d_location;
                check_loc[1] = prev_d_location[1] + Math.sign(states_passed);
                if ((weed_density[check_loc[0]][check_loc[1]] > 0) &&
                    (weed_height[check_loc[0]][check_loc[1]] < MAX_WEED)){
                    this.mode = this.modes.kill;
                    this.d_location = check_loc;
                    this.location = this.d2c([check_loc[0],check_loc[1]]);
                    break;
                }
            }
                        
            // if reached the end of row - wait for updates
            if (this.mode == this.modes.scout &&
                ((this.d_location[1] <= 0 && this.direction == this.directions.north) ||
                 (this.d_location[1] >= n_dim-1 && this.direction == this.directions.south))){
                this.mode = this.modes.idle;
                this.queue.shift();
            }
            
            // run out of battery for every move
            this.battery -= 0.005*t_step;
            break;
            
        case this.modes.kill:
            if( this.timer > T_KILL*weed_density[this.d_location[0]][this.d_location[1]]){
                this.mode = this.modes.scout;
                this.timer = 0;
                this.reward += reward[this.d_location[0]][this.d_location[1]];
                reward[this.d_location[0]][this.d_location[1]] = 0;
                weed_density[this.d_location[0]][this.d_location[1]] = 0;
                weed_height[this.d_location[0]][this.d_location[1]] = 0;
                //console.log('bot#' + this.id + '.Finished killing.');
            }
            else{
                this.timer += t_step;
            }
            this.battery -= 0.01*t_step;
            break;
            
        case this.modes.charging:
            if (this.battery >= 100){
                if(this.battery > 100.0){
                    this.battery = 100.0;
                }
                //console.log('bot#' + this.id + '.Battery full.');
                this.mode = this.modes.idle;
            }
            else{
                this.battery += (100.0*t_step)/T_CHARGE;
            }
            break;
            
        case this.modes.inactive:
            var s = this.c2d(this.location);
            if (s[0] != 0 || s[1] != 0){
                this.goTo([0,0], t_step);
                //console.log('bot#' + this.id + '.Agent Inactive');
            }
            else{
                this.mode = this.modes.charging;
            }
            this.report();
            break;
            
        case this.modes.idle:
            //this.report();
            //this.resetReward();
            //console.log('bot#' + this.id + '.Waiting a task.');
            if (this.queue.length >= 1){
                var s = this.c2d(this.location);
                this.target[0] = this.queue[0];
                this.target[1] = s[1];
                this.mode = this.modes.going;
                //console.log('bot#' + this.id + '.Going to ' +this.target +'.');
            }
            else if(this.queue.length == 0){
                //if(RP_on_not_off){
                //   update_agent_reward_and_queue_and_qvalue();
                // }
                //else{
                //    update_row_queue();
                //}
                // var occupied = 0;
                // for (var i = 0; i < n_agents; ++i){
                //     if((i != this.id) && (agent_list[i].queue[0] == row_queue[this.id][0])){
                //         var occupied = 1;
                //     }
                //}
                if (row_queue[this.id].length > 0){
                    this.updateQueue(row_queue[this.id]);
                    console.log(this.queue);
                    explored_row_total += this.reward;
                    number_rows_explored += 1;
                    average_row_reward = explored_row_total/number_rows_explored;
                    this.reward = 0;
                }
            }
            break;
            
        case this.modes.going:
            var s = this.c2d(this.location);
            if (this.target[0] > s[0]){
                this.location[0] += this.speed * t_step;
            }
            else if (this.target[0] < s[0]){
                this.location[0] -= this.speed * t_step;
            }
            else if (this.target[0] == s[0]){
                this.mode = this.modes.scout;
                //console.log('bot#' + this.id + '.Arrived ' + s + '.');
                if (s[1] <= 0)
                    this.direction = this.directions.south;
                else if (s[1] >= n_dim-1) {
                    this.direction = this.directions.north;
                }
            }
            break;
    }
    if (this.battery<0 && this.mode != this.modes.charging){
        this.mode = this.modes.inactive;
    }
    var s = this.c2d(this.location);
    if(PEI_on_not_off){
        for(var i = Math.max(0,s[0]-observation_radius); i < Math.min(n_dim, s[0] + observation_radius); ++i){
            for(var j = Math.max(0,s[1]-observation_radius); j < Math.min(n_dim, s[1]+observation_radius); ++j){
                if(reward[i][j] > 0){
                    if(show_reward[i][j] != 1){
                        show_reward[i][j] = 1;
                    }
                }
            }
        }
        if ((s[1] <= 0 && this.direction == this.directions.north) || (s[1] >= n_dim-1 && this.direction == this.directions.south)){
            for(var i = Math.max(0,s[0]-observation_radius); i < Math.min(n_dim, s[0]+observation_radius); ++i){
                show_row[i] = 1;
            }
        }
    }
}

FarmAgent.prototype.goTo = function (state, t_step) {
    var s = this.c2d(this.location);
    // move in a row
    if (state[1] > s[1]){
        this.location[1] += this.speed * t_step;
    }
    else if (state[1] < s[1]){
        this.location[1] -= this.speed * t_step;
    }
    // move accross rows
    else if (state[0] > s[0]){
        this.location[0] += this.speed * t_step;
    }
    else if (state[0] < s[0]){
        this.location[0] -= this.speed * t_step;
    }
}

FarmAgent.prototype.getMode = function () {
    return this.mode;
}

FarmAgent.prototype.getState = function () {
    return this.c2d(this.location);;
}

FarmAgent.prototype.resetReward = function () {
    this.reward = 0;
}

FarmAgent.prototype.updateQueue = function (task) {
    this.queue = task;
}

FarmAgent.prototype.report = function () {
    var report_string = 'bot# ' + this.id + 
        ',Loc:' + this.location + 
        ',St:' + this.c2d(this.location); +
        ',Dir:' + this.direction +
        ',Mod:' + this.mode + 
        ',Tar:' + this.target +
        ',Kil:' + this.timer + 
        ',Rew:' + this.reward + 
        ',Bat:' + this.battery;
    console.log(report_string);
    return report_string;
}
   
//SERVICE FUNCTIONS
FarmAgent.prototype.c2d = function (loc_xy){
    var s = [];
    s[0] = Math.floor(loc_xy[0]/2.459); // avg width of the row
    s[1] = Math.floor(loc_xy[1]/2.459); // avg width of the row
    s[0] = Math.max(0,Math.min(n_dim-1,s[0]));
    s[1] = Math.max(0,Math.min(n_dim-1,s[1]));
    return s;
}

FarmAgent.prototype.d2c = function (d_loc_xy){
    var l = [];
    l[0] = (d_loc_xy[0]+0.5) * 2.459; // avg width of the row
    l[1] = (d_loc_xy[1]+0.5) * 2.459; // avg width of the row
    return l;
}
//------------------------------------------------------
