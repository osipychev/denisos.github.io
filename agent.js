// AGENT INSTANCE
var T_KILL = 10;

// A farm swarm robot class
var FarmAgent = function (id, init_state, direction) {
    
    this.directions = {north:0, south:1};
    this.modes = {scout:0, idle:1, kill:2, inactive:-1};
    
    this.id = id;
    this.state = init_state;
    
    this.mode = this.modes.idle;
    this.direction = direction;
        
    this.battery = 100;
    this.reward = 0;
    this.timer = 0;
}

// method - update location based on the current direction
FarmAgent.prototype.step = function () {
 
    if (this.mode == this.modes.scout){
        if (this.direction == this.directions.north) this.state[1] -= 1
        else if (this.direction == this.directions.south) this.state[1] += 1
        
        if (this.state[1] <= 0 || this.state[1] >= n_dim-1){
            this.mode = this.modes.idle;
            this.direction = ! this.direction;
        }
        
        if (reward[this.state[0]][this.state[1]] > 0){
            this.mode = this.modes.kill;
        }
        this.battery -= 0.05;
    }
    else if (this.mode == this.modes.kill && reward[this.state[0]][this.state[1]] > 0){
        if( this.timer > T_KILL){
            this.mode = this.modes.scout;
            this.timer = 0;
            this.reward += reward[this.state[0]][this.state[1]];
            reward[this.state[0]][this.state[1]] = 0;
        }
        else this.timer += 1;
        this.battery -= 0.1;
    }
    
    if (this.battery<0) this.mode = this.modes.inactive;
}

FarmAgent.prototype.getMode = function () {
    return this.mode;
}

FarmAgent.prototype.goRight = function () {
    this.state[0] = Math.min(n_dim-1,this.state[0] + 1);
}

FarmAgent.prototype.goLeft = function () {
    this.state[0] = Math.max(0,this.state[0] - 1);
}

FarmAgent.prototype.getState = function () {
    return this.state;
}

FarmAgent.prototype.resetReward = function () {
    this.reward = 0;
}

FarmAgent.prototype.report = function () {
    var report_string = 'bot# ' + this.id + 
        ' comleted row# ' + this.state[0] + 
        '. Reward: ' + this.reward + 
        '. Battery: ' + this.battery;
    return report_string;
}