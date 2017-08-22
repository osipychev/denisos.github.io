// AGENT CLASS

var T_KILL = 10; // time sec to kill one weed

// A farm swarm robot class init
var FarmAgent = function (id, init_state, direction) {
    
    this.directions = {north:0, south:1};
    this.modes = {scout:0, idle:1, kill:2, inactive:-1, charging:3, going:4};
    
    this.location = [0,0]; // in feet
    this.speed = 1 * 1.46667; // in feet per second
    
    this.id = id;
    this.state = init_state.slice();
    
    this.mode = this.modes.idle;
    this.direction = direction;
        
    this.battery = 100;
    this.reward = 0;
    this.timer = 0;
    this.queue = [];
    
    //this.row_queue_num = 0;
    this.target = init_state.slice();
}

// method - update state of agent based on the current state
FarmAgent.prototype.step = function (n_dim, t_step) {
 
    switch(this.mode){
        case this.modes.scout:
            // move in a row
            if (this.direction == this.directions.north){
                //this.state[1] -= 1;
                this.location[1] -= this.speed * t_step;
                this.state = this.c2d(this.location);
                
            }
            else if (this.direction == this.directions.south){
                //this.state[1] += 1;
                this.location[1] += this.speed * t_step;
                this.state = this.c2d(this.location);
            }
        
            // if there is a weed - kill it,
            // if reached the end of row - wait for updates
            if (reward[this.state[0]][this.state[1]] > 0){
                this.mode = this.modes.kill;
            }
            else if (this.location[1] <= 0 || this.location[1] >= 209){
                this.mode = this.modes.idle;
                this.queue.shift();
                //this.row_queue_num += 1;
                //row_complete[this.state[0]] = 1;
            }
        
            // run out of battery for every move
            this.battery -= 0.05*t_step;
                        
            break;
            
        case this.modes.kill:
            if( this.timer > T_KILL){
                this.mode = this.modes.scout;
                this.timer = 0;
                this.reward += reward[this.state[0]][this.state[1]];
                reward[this.state[0]][this.state[1]] = 0;
            }
            else{
                this.timer += t_step;
            }
            this.battery -= 0.1*t_step;
            break;
            
        case this.modes.charging:
            if (this.battery >= 100){
                this.mode = this.modes.idle;
            }
            else{
                this.battery += 0.5*t_step;
            }
            break;
            
        case this.modes.inactive:
            if (this.state[0] != 0 || this.state[1] != 0){
                this.goTo([0,0]);
            }
            else{
                this.mode = this.modes.charging;
            }
            this.report();
            break;
            
        case this.modes.idle:
            console.log(this.report());
            cum_reward += this.reward;
            this.resetReward();
            console.log('Ageng #' + this.id + ' finished row.');
            if (this.queue.length > 1){
                this.target[0] = this.queue[0];
                this.target[1] = this.state[1];
                this.mode = this.modes.going;
            }
            break;
            
        case this.modes.going:
            if (this.target[0] > this.state[0]){
                //this.state[0] = Math.min(n_dim-1,this.state[0] + 1);
                this.location[0] += this.speed * t_step;
                this.state = this.c2d(this.location);
            }
            else if (this.target[0] < this.state[0]){
                //this.state[0] = Math.max(0,this.state[0] - 1);
                this.location[0] -= this.speed * t_step;
                this.state = this.c2d(this.location);
            }
            else if (this.target[0] == this.state[0]){
                this.mode = this.modes.scout;
                if (this.state[1] <= 0) this.direction = this.directions.south;
                else if (this.state[1] >= n_dim-1) {
                    this.direction = this.directions.north;
                }
            }
            break;
        }
                

    
    if (this.battery<0 && this.mode != this.modes.charging){
        this.mode = this.modes.inactive;
    }
}

FarmAgent.prototype.getMode = function () {
    return this.mode;
}

FarmAgent.prototype.goRight = function (n_dim) {
    this.state[0] = Math.min(n_dim-1,this.state[0] + 1);
}

FarmAgent.prototype.goLeft = function (n_dim) {
    this.state[0] = Math.max(0,this.state[0] - 1);
}

FarmAgent.prototype.goToRow = function (row) {
    if(this.state[0] > row){
        this.state[0] = Math.max(0,this.state[0] - 1);
    }
    else if (this.state[0] < row){
        this.state[0] = Math.min(n_dim-1,this.state[0] + 1);
    }
}

FarmAgent.prototype.goTo = function (state) {
    if (this.state[1] > state[1]){
        this.state[1] -= 1;
    }
    else if (this.state[1] < state[1]){
        this.state[1] += 1;
    }
    else if(this.state[0] > state[0]){
        this.state[0] = Math.max(0,this.state[0] - 1);
    }
    else if (this.state[0] < state[0]){
        this.state[0] = Math.min(n_dim-1,this.state[0] + 1);
    }
}

FarmAgent.prototype.getState = function () {
    return this.state;
}

FarmAgent.prototype.selState = function (s) {
    this.state = s;
}

FarmAgent.prototype.resetReward = function () {
    this.reward = 0;
}

FarmAgent.prototype.updateQueue = function (task) {
    this.queue = task;
}

FarmAgent.prototype.report = function () {
    var report_string = 'bot# ' + this.id + 
        ' comleted row# ' + this.state[0] + 
        '. Location: ' + this.location +
        '. Reward: ' + this.reward + 
        '. Battery: ' + this.battery;
    console.log(report_string);
    return report_string;
}

FarmAgent.prototype.full_report = function () {
    var report_string = '#' + this.id + 
        ',Loc:' + this.location + 
        ',St:' + this.state +
        ',Dir:' + this.direction +
        ',Mod:' + this.mode + 
        ',Tar:' + this.target +
        ',Kil:' + this.timer + 
        ',Rew:' + this.reward + 
        ',Bat:' + this.battery;
    console.log(report_string);
    return report_string;
}
    
FarmAgent.prototype.c2d = function (loc_xy){
    
    s[0] = Math.floor(loc_xy[0]/2.459); // avg width of the row
    s[1] = Math.floor(loc_xy[1]/2.459); // avg width of the row
    
    return s;
}