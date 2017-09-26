//- CONSTANTS 
var MAX_SPEED = 2; //miles per hour
var MAX_WEED = 5; // max size inches that can kill
var T_CHARGE = 60*60; // time to full charge in sec

//------------------------------------------------------
// AGENT CLASS

// A farm swarm robot class init
var FarmAgent = function (id, init_loc) {
    
    this.directions = {north:0, south:1};
    this.modes = {scout:0, idle:1, kill:2, inactive:-1, charging:3, going:4};
    
    this.location = init_loc.slice(); // in feet
    this.speed = MAX_SPEED * 1.46667; // in feet per second
    
    this.id = id;

    this.mode = this.modes.idle;
    this.direction = 0;
        
    this.battery = 100;
    this.reward = 0;
    this.timer = 0;
    this.queue = [];
    
    this.target = init_loc.slice();
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
        
            var s = this.c2d(this.location);
            
            // if there is a weed - kill it,
            if ((reward[s[0]][s[1]] > 0) && (reward[s[0]][s[1]] < MAX_WEED)){
                this.mode = this.modes.kill;
                console.log('bot#' + this.id + '.Found a weed.Killing');
            }
            
            // if reached the end of row - wait for updates
            else if ((s[1] <= 0 &&
                     this.direction == this.directions.north) ||
                     (s[1] >= n_dim-1 &&
                     this.direction == this.directions.south)){
                this.mode = this.modes.idle;
                console.log('bot#' + this.id + '.Finished row ' + s[0] + '.');
                this.queue.shift();
            }
            
            // run out of battery for every move
            this.battery -= 0.05*t_step;
            break;
            
        case this.modes.kill:
            if( this.timer > T_KILL){
                this.mode = this.modes.scout;
                this.timer = 0;
                var s = this.c2d(this.location);
                this.reward += reward[s[0]][s[1]];
                reward[s[0]][s[1]] = 0;
                console.log('bot#' + this.id + '.Finished killing.');
            }
            else{
                this.timer += t_step;
            }
            this.battery -= 0.1*t_step;
            break;
            
        case this.modes.charging:
            if (this.battery >= 100){
                this.mode = this.modes.idle;
                console.log('bot#' + this.id + '.Battery full.');
            }
            else{
                this.battery += 100.0*t_step/T_CHARGE;
            }
            break;
            
        case this.modes.inactive:
            var s = this.c2d(this.location);
            if (s[0] != 0 || s[1] != 0){
                this.goTo([0,0], t_step);
                console.log('bot#' + this.id + '.Battery empty');
            }
            else{
                this.mode = this.modes.charging;
            }
            this.report();
            break;
            
        case this.modes.idle:
            this.report();
            console.log('bot#' + this.id + '.Waiting a task.');
            if (this.queue.length > 1){
                var s = this.c2d(this.location);
                this.target[0] = this.queue[0];
                this.target[1] = s[1];
                this.mode = this.modes.going;
                console.log('bot#' + this.id + '.Going to ' +this.target +'.');
            }
//            else if (this.queue.length <= 1){
//                update_row_queue();
//                this.updateQueue(row_queue[this.id]);
//                console.log(this.queue);
//                if (this.queue.length > 1){
//                    var s = this.c2d(this.location);
//                    this.target[0] = this.queue[0];
//                    this.target[1] = s[1];
//                    this.mode = this.modes.going;
//                    console.log('bot#' + this.id + '.Going to ' +this.target +'.');
//                }
//                else{
//                    this.mode = this.modes.inactive;
//                }
//            }
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
                console.log('bot#' + this.id + '.Arrived ' + s + '.');
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
        ' comleted row# ' + this.c2d(this.location); + 
        '. Location: ' + this.location +
        '. Reward: ' + this.reward + 
        '. Battery: ' + this.battery;
    console.log(report_string);
    return report_string;
}

FarmAgent.prototype.full_report = function () {
    var report_string = '#' + this.id + 
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
    
FarmAgent.prototype.c2d = function (loc_xy){
    var s = [];
    
    s[0] = Math.floor(loc_xy[0]/2.459); // avg width of the row
    s[1] = Math.floor(loc_xy[1]/2.459); // avg width of the row
    
    return s;
}
//------------------------------------------------------
