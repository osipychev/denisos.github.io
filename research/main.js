//------------------------------------------------------
	
//-- CONSTANTS & GLOBAL VARIABLES
var n_iter = 0;
var myGrid;
var canvas;
var n_dim;
var state = [0,0];
var n_actions = 5;
var sim_states = {reset:0,ready:4,run:5,wait:6};
var sim_state = sim_states.reset;
var mouse_pos = [];
var reward_hist = [];
var message = [];

//-- Experiment globals
var n_episode = 0;
var cum_reward = 0;
var hist = ['\n'];

//MAIN
function main() {
    canvas = document.getElementById('example');
    if (! canvas) {
        console.log(' Failed to retrieve the < canvas > element');
        return false;
    }
    else {
	    console.log(' Got < canvas > element ');
    }
    
//    canvas.addEventListener("mousedown", function(evt){
//        var rect = canvas.getBoundingClientRect();
//        mouse_pos = [evt.clientX - rect.left, evt.clientY - rect.top];
//        selection(mouse_pos);
//        console.log("Mouse click at:", mouse_pos);
//    }, false);
    
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    generate();
    animate();
}

function animate(){
	setInterval(update, 10);
}

function save_to_file(){
    var hiddenElement = document.createElement('a');

    hiddenElement.href = 'data:attachment/text,' + encodeURI(hist);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'data.txt';
    hiddenElement.click();
}

//CONTROL
function sim_run(){
    sim_state = sim_states.run;
    message = [];
}

function sim_stop(){
    sim_state = sim_states.ready;
}

//SIMULATION
function generate(){
    n_dim = document.getElementById("n_dim").value;
    myGrid = new UGrid2D([-1.,-1.],[1.,1.],n_dim);
    mdp_init(n_dim);
    reward_hist = [];
    hist = ['\n'];
    n_episode = 0;
}

function singleUpdate(){
    sim_state = sim_states.run;
    update();
    sim_state = sim_states.ready;
}

function update(){
    
    if (sim_state == sim_states.reset){
        
        sleep(10000);
        n_iter = 0;
        n_episode += 1;
        cum_reward = 0;
        state = mdp_random_state(n_dim);
        sim_state = sim_states.ready;
        if (n_episode>20) message ="Reached 20 episodes. Save and proceed."
        else message = "Episode ended. Press RUN";
        
    }
    
    var epsilon = document.getElementById("epsilon").value;
    var max_iter = document.getElementById("num_iter").value
    
    if (n_iter < max_iter && (sim_state == sim_states.run) ){
		
        var action=-1;
        
        if(document.getElementById("ctrl_RL").checked){
            if (Math.random() < epsilon){
                action = findMaxInd(get_qvalue(state));
                console.log("best action");
            }
            else{
                action = Math.floor(Math.random() * 5);
                console.log("random action");
            }
        }
        else if(document.getElementById("ctrl_human").checked){
            handleKeys();
            if (keyEvents.active.left){
                action = 1;
                keyEvents.active.left = false;
            }
            else if (keyEvents.active.right){
                action = 2;
                keyEvents.active.right = false;
            }  
            else if (keyEvents.active.up){
                action = 3;
                keyEvents.active.up = false;
            }
            else if (keyEvents.active.down){
                action = 4;
                keyEvents.active.down = false;
            } 
        }

        if (action > -1){
            n_iter += 1;
            console.log("Action taken:",action);
            var prev_state = state.slice();
            state = mdp_step(state,action,n_dim);
            var rwrd = reward[state[0]][state[1]];
            update_qvalue(prev_state,state,action,rwrd);
        
            cum_reward += rwrd;
            if (term_map[state[0]][state[1]] == true){
                sim_state = sim_states.reset;
                hist += 'Num iter: ' + n_iter + ' Cum reward: ' + cum_reward + '\n';
                reward_hist.push({x:n_episode,y:cum_reward});
                console.log(reward_hist);
                plot_result(reward_hist);
                if (rwrd>0) message = 'You found the goal';
                else message = 'You found the pit';
            }
        }
    }
       // DRAW AND UPDATE
    draw();
}

function plot_result(reward_hist){
    Highcharts.chart('container', {
                     chart: {type: 'scatter',zoomType: 'xy'},
                     title: {text: 'Cumulative Reward Vs. Episode'},
                     xAxis: {title: {enabled: true,text: 'Episode'},
                        startOnTick: true,endOnTick: true,showLastLabel: true},
                     yAxis: {title: {text: 'Cumulative Reward'}},
                     legend: {layout: 'vertical',align: 'left',verticalAlign: 'top',x: 50,y: 25,floating: true,
                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',borderWidth: 1},
                     plotOptions: {scatter: {marker: {radius: 5,states: {hover: {enabled: true,lineColor: 'rgb(100,100,100)'}}},
                     states: {hover: {marker: {enabled: false}}},
                     tooltip: {headerFormat: '<b>{series.name}</b><br>',pointFormat: 'Episode: {point.x}, Reward: {point.y}'}}},
                     series: [{lineWidth:2,name: 'Reward',color: 'rgba(223, 83, 83, .5)',data: reward_hist}]});
}

function draw(){
    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (document.getElementById("show_goal").checked) myGrid.show_colors(canvas,reward,n_dim);
    
    myGrid.show_state(canvas,state,n_dim);
    myGrid.draw_grid(canvas);
    
    if (document.getElementById("show_R").checked)
        myGrid.show_values(canvas,reward,n_dim);
    else if (document.getElementById("show_Q").checked)
        myGrid.show_qvalues(canvas,qvalue,n_dim,n_actions);
    else if (document.getElementById("show_Pi").checked)
        myGrid.show_policy(canvas,qvalue,n_dim,n_actions);
    myGrid.print_string(canvas,state,'reward: '+cum_reward,n_dim);
    myGrid.print_message(canvas,message);
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
