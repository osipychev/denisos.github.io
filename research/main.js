//------------------------------------------------------
//-- CONSTANTS & GLOBAL VARIABLES

//-- Canvas Parameters
var canvas;
var myGrid;
var agent_list      = [];
var n_dim;

var startTime, endTime;

//-- Simulation Parameters
var sim_states      = {reset:0,ready:4,run:5,wait:6,manual:7};
var sim_state       = sim_states.reset;
var mouse_pos       = [];
var message         = [];
var t_time          = 0;
var frame_time      = 0;
var reward          = [];
var reward_hist     = [];

//-- Experiment Parameters
var n_episode       = 0;
var cum_reward      = 0;
var hist            = [];

var row_queue       = [];
var row_complete     = [];

//-- MDP Parameters
var policy          = [];
var value           = [];
var qvalue          = [];
var transition      = [];
var term_map        = [];
var sym_map         = [];
var n_actions       = 4;
var growth_step     = 100;
var reward_grown    = 700;

//Environment Parameters
var actions         = {idle:1, kill:2, left:3, right:4};
var n_agents        = 5;
var state           = new Array(5);
var statecharge     = [0, 0];

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
    
    canvas.addEventListener("mousedown", function(evt){
        var rect = canvas.getBoundingClientRect();
        mouse_pos = [evt.clientX - rect.left, evt.clientY - rect.top];
        selection(mouse_pos, myGrid.n_dim);
        console.log("Mouse click at:" + mouse_pos);
    }, false);

    generate();
    animate();
}

function animate(){
	setInterval(update, 10);
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
    sim_state = sim_states.reset;
}

function manual(){
    sim_state = sim_states.manual;
}

function update(){
    startTime         = new Date().getTime();
    var n_agent_rows    = Math.floor(n_dim/n_agents);
    //var init_row;
    if (sim_state == sim_states.reset){
        //sleep(10000);
        n_iter = 0;
        n_episode += 1;
        cum_reward = 0;
        t_time = 0;
        
        n_dim = document.getElementById("n_dim").value;
        n_agents = document.getElementById("n_agents").value;
        myGrid = new UGrid2D([-1.,-1.],[1.,1.],n_dim);
        mdp_init();
        
        agent_list = [];
        for (var i = 0; i < n_agents; ++i){
            //init_row = i*n_dim/n_agents;
            //row_queue[i][0] = init_row;
            agent_list[i] = new FarmAgent(i,[0,0],1);
            agent_list[i].mode = agent_list[i].modes.idle;
        }
        update_row_queue0();
        for (var i = 0; i < n_agents; ++i){
            agent_list[i].updateQueue(row_queue[i]);
            console.log(agent_list[i].queue);
            agent_list[i].mode = agent_list[i].modes.scout;
        }
        sim_state = sim_states.ready;
        if (n_episode>20){
            message ="Reached 20 episodes. Save and proceed.";
        }
        else{
            message = "Episode ended. Press RUN";
        }
        t_time = 0;
    }
    
    if (sim_state == sim_states.run){
        //update_row_queue();
        for (var i = 0; i < n_agents; ++i){
            agent_list[i].step(myGrid.n_dim, t_time);
        }
        
        t_time = -document.getElementById("tscale").value*(endTime - startTime)/1000.0;
        weed_grow(t_time);
        update_row_queue(agent_list);
        for (var i = 0; i < n_agents; ++i){
            agent_list[i].updateQueue(row_queue[i]);
        }
        
    }
    
    endTime = new Date().getTime();
    
    // DRAW AND UPDATE
    draw();
}

// function plot_result(reward_hist){
//    Highcharts.chart('container', {
//                     chart: {type: 'scatter',zoomType: 'xy'},
//                     title: {text: 'Cumulative Reward Vs. Episode'},
//                     xAxis: {title: {enabled: true,text: 'Episode'},
//                        startOnTick: true,endOnTick: true,showLastLabel: true},
//                     yAxis: {title: {text: 'Cumulative Reward'}},
//                     legend: {layout: 'vertical',align: 'left',verticalAlign: 'top',x: 50,y: 25,floating: true,
//                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',borderWidth: 1},
//                     plotOptions: {scatter: {marker: {radius: 5,states: {hover: {enabled: true,lineColor: 'rgb(100,100,100)'}}},
//                     states: {hover: {marker: {enabled: false}}},
//                     tooltip: {headerFormat: '<b>{series.name}</b><br>',pointFormat: 'Episode: {point.x}, Reward: {point.y}'}}},
//                     series: [{lineWidth:2,name: 'Reward',color: 'rgba(223, 83, 83, .5)',data: reward_hist}]});
// }

function draw(){
    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (document.getElementById("show_weed").checked)
        myGrid.show_colors(canvas,reward);
    
    myGrid.show_state(canvas,agent_list);
    myGrid.draw_grid(canvas);
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
//------------------------------------------------------
