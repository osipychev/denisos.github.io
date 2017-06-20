// Create keyboard control variables
var keyEvents = {};
keyEvents.esc = 27;
keyEvents.space = 32;
keyEvents.left = 37;
keyEvents.right = 39;
keyEvents.up = 38;
keyEvents.down = 40;
keyEvents.released = {space:true,left:true,right:true,up:true,down:true};
keyEvents.active = {esc:false,space:false,left:false,right:false,up:false,down:false};

// MOUSE CONTROL
function selection(xy_pos){
    
    var deltaX = width / n_dim;
    var deltaY = height / n_dim;

    var xi = Math.floor(xy_pos[0]/deltaX);
    var yi = Math.floor(xy_pos[1]/deltaY);
    
    if (sim_state == sim_states.goal_sel){
        reward[xi][yi] += 100;
        term_map[xi][yi] = true;}
    else if (sim_state == sim_states.obst_sel) reward[xi][yi] -= 10;
    else if (sim_state == sim_states.init_sel) state = [xi,yi];
}

//-------------KEYS CONTROL ---------------------------------------------------
/**
 * function handleKeyDown
 * change the keyEvents for corresponding button to true
 * @param {html events} event from the browser
 */
function handleKeyDown(event) {
        keyEvents[event.keyCode] = true;
}

/**
 * function handleKeyUp
 * change the keyEvents for corresponding button to false
 * @param {html events} event from the browser
 */
function handleKeyUp(event) {
        keyEvents[event.keyCode] = false;
}

/**
 * function handleKeys()
 * apply control when the corresponding keyEvent is true
 */
function handleKeys() {
    if (keyEvents[keyEvents.left]) {
        if (keyEvents.released.left){ 
            keyEvents.active.left = true;
            console.log("Left button pressed");
            keyEvents.released.left = false;
        }
    }
    else keyEvents.released.left = true;
    
    if (keyEvents[keyEvents.right]){
        if (keyEvents.released.right){ 
            keyEvents.active.right = true;
            console.log("Right button pressed");
            keyEvents.released.right = false;
        }
    }
    else keyEvents.released.right = true;
    
    if (keyEvents[keyEvents.up]){
        if (keyEvents.released.up){ 
            keyEvents.active.up = true;
            console.log("Up button pressed");
            keyEvents.released.up = false;
        }
    }
    else keyEvents.released.up = true;
    
    if (keyEvents[keyEvents.down]){
        if (keyEvents.released.down){ 
            keyEvents.active.down = true;
            console.log("Down button pressed");
            keyEvents.released.down = false;
        }
    }
    else keyEvents.released.down = true;
    
}