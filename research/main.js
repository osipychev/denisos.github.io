//------------------------------------------------------
//-- SIMULATION CONSTANTS & GLOBAL VARIABLES

//-- Canvas Parameters
var canvas;
var myEnv;
var n_dim;

//-- Simulation global variables
var sim_states = {reset:0,ready:4,run:5,wait:6,manual:7};
var sim_state = sim_states.reset;
var userMessage = [];
var total_time = 0;
var startTime, endTime;
var plotTimer = 0;

//reward_hist.push({x:0,y:0});

//-- Experiment Parameters
var n_episode       = 0;
var cum_reward      = 0;
var hist            = [];
var row_queue       = [];
var row_complete    = [];

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
    
//    // Mouse event listener
//    canvas.addEventListener("mousedown", function(evt){
//        var rect = canvas.getBoundingClientRect();
//        mouse_pos = [evt.clientX - rect.left, evt.clientY - rect.top];
//        selection(mouse_pos, myGrid.n_dim);
//        console.log("Mouse click at:" + mouse_pos);
//    }, false);

    sim_reset();
    animate();
}

function animate(){
	setInterval(update, 10);
}

//CONTROL
function sim_run(){
    sim_state = sim_states.run;
    userMessage = [];
}

function sim_stop(){
    sim_state = sim_states.ready;
}

function sim_reset(){
    sim_state = sim_states.reset;
}

function update(){
    startTime = new Date().getTime();
    
    //sim init
    if (sim_state == sim_states.reset){
        n_iter = 0;
        n_episode += 1;
        cum_reward = 0;
        //t_time = 0;
        //update_count = 0;
        
        n_dim = document.getElementById("n_dim").value;
        myEnv = new UGrid2D([-1.,-1.],[1.,1.],n_dim);
//        console.log(n_agent_rows);
        mdp_init();
        
        // initialize robots
        n_agents = document.getElementById("n_agents").value;
        agent_list = [];
        for (var i = 0; i < n_agents; ++i){
            agent_list[i] = new FarmAgent(i,[0,0]);
            agent_list[i].mode = agent_list[i].modes.idle;
        }

        sim_state = sim_states.ready;
        
        userMessage = "Press RUN to start simulation";
    }
    
    if (sim_state == sim_states.run){
        
        var dt = -document.getElementById("tscale").value*(endTime - startTime)/1000.0;
//        weed_grow(reward,[n_dim,n_dim],dt);
        
        for (var i = 0; i < n_agents; i++){
            agent_list[i].step(myEnv.n_dim, dt);
            agent_list[i].report();
            //agent_list[i].full_report();
        }
        
        total_time += dt;
        
//        console.log(est_reward(reward));
//        
//        console.log(sortIndices(est_reward(reward)));
//        console.log(simple_planning(est_reward(reward),n_agents));
        row_queue = simple_planning(est_reward(reward),n_agents);
        for (var i = 0; i < n_agents; i++){
            if (agent_list[i].mode == agent_list[i].modes.idle)
            agent_list[i].updateQueue(row_queue[i]);
        }
        //console.log('x:'+ t_time + ',y:'+-totalReward(reward));
        //console.log(reward_hist);
    }
    
    endTime = new Date().getTime();
    
    // DRAW AND UPDATE
    draw();
}

function plot_result(reward_hist){
    Highcharts.chart('container', {
        title: {text: 'Reward history'},
        xAxis: {title: {text: 'Time'}},
        yAxis: {title: {text: 'Accumulated reward'}},
        series: [{data: reward_hist,lineWidth: 1}],
        plotOptions: { line: { marker: {enabled: false}, animation: false}}
    });
}

function draw(){
    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (document.getElementById("show_weed").checked)
        myEnv.show_colors(canvas,reward);
    
    myEnv.show_state(canvas,agent_list);
    myEnv.draw_grid(canvas);
    myEnv.print_message(canvas,userMessage);
    
            
        if (plotTimer < total_time){
            plotTimer = total_time + 60;
            reward_hist.push({x:total_time/60,y:-totalReward(reward)});
            plot_result(reward_hist);
        }
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) break;
  }
}