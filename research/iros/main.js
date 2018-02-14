//------------------------------------------------------
//-- CONSTANTS & GLOBAL VARIABLES

//-- Canvas Parameters
var agent_list              = [];
var canvas;
var myGrid;
var n_dim;
var startTime, endTime;
var plotTimer               = 0;

//-- Simulation Parameters
var sim_states              = {reset:0,ready:4,run:5,wait:6,manual:7};
var sim_state               = sim_states.reset;
var mouse_pos               = [];
var message                 = [];
var t_time                  = 0;
var frame_time              = 0;
var reward                  = [];
var agent_reward            = [];
var reward_hist             = [];
var Q_radius                = [];

//-- Experiment Parameters
var n_episode               = 0;
var cum_reward              = 0;
var hist                    = [];
var row_queue               = [];
var row_checked             = [];
var row_weed_num            = [];
var row_reward_tot          = [];

//-- MDP Parameters
var policy                  = [];
var value                   = [];
var qvalue                  = [];
var transition              = [];
var term_map                = [];
var sym_map                 = [];
var n_actions               = 4;
var alpha                   = 0.9;
var gamma                   = 0.9;

//-- Environment Parameters
var actions                 = {idle:1, kill:2, left:3, right:4};
var state                   = new Array(5);
var statecharge             = [0, 0];
var update_count            = 0;
var T_KILL                  = 60; // sec to kill one weed
var total_agent_reward;
var n_agent_rows;

//-- Weed Parameters
var can_seed                = 10; // inch
var growth_factor           = 0.001;

//-- Agent Parameters
var MAX_SPEED               = 1;  // feet per sec
var MAX_WEED                = 5;  // max size inches that can kill
var T_CHARGE                = 60; // 60*60 ; // time to full charge in sec

//-- Algorithm Parameters
var DP_on_not_off           = 1;
var WH_on_not_off           = 1;
var PEI_on_not_off          = 1;
var TIG_on_not_off          = 1;
var CO_on_not_off           = 0;

//-- TIG Parameters
var number_rows_explored    = 0;
var explored_row_total      = 0;
var average_row_reward      = 0;

//-- Row Arrays
var show_reward             = [];
var show_row                = [];
var weed_hist               = [];
var weed_height             = [];
var weed_density            = [];
var seed_bank = [];

//-- MC Parameters
var curr_exp                = 1;
var growth_speed;                  // 1 inch per day
var spawn_probability;
var observation_radius;
var n_agents;
var agent_speed;

//MAIN CALL. Loop over updates in animate function
function main() {
    canvas = document.getElementById('example');
    if (! canvas) {
        console.log(' Failed to retrieve the < canvas > element');
        return false;
    }
    else {
	    console.log(' Got < canvas > element ');
    }

    generate();
    animate();
}

function animate(){
	setInterval(update, 10);
}

//CONTROL IN STATE MACHINE
function sim_run(){
    sim_state = sim_states.run;
    message = [];
}

function sim_stop(){
    sim_state = sim_states.ready;
}

//SIMULATION STATE MACHINE
function generate(){
    sim_state = sim_states.reset;
}

//UPDATE FUNCTION
function update(){
    startTime = new Date().getTime();
    if (sim_state == sim_states.reset){
        if(document.getElementById("MC").checked){
            // update parameters of the simulation is MonteCarlo selected
            update_exp();
        }
        else {
            growth_speed            = 1/(24*60*60); // 1 inch per day
            // spawn_probability       = 1000000; // we don't need it nows
            observation_radius      = 1;
            n_agents                = 5;
            agent_speed             = 1; // 1 foot per second
        }
        n_iter              = 0;
        n_episode           += 1;
        cum_reward          = 0;
        t_time              = 0;
        update_count        = 0;
        agent_list          = [];
        reward_hist = [];
        
        n_dim               = document.getElementById("n_dim").value;
        // total_agent_reward  = new Array(n_agents); //dont need it now
        // n_agent_rows        = Math.floor((n_dim - 1)/(n_agents)) + 1;
        myGrid              = new UGrid2D([-1.,-1.],[1.,1.],n_dim);
        mdp_init();
        
        if(document.getElementById("uniform").checked){
            initial_uniform(document.getElementById("seedbank").value,n_dim);
        }
        else if(document.getElementById("binomial").checked){
            var days = document.getElementById("days_allowance").value;
            for (var t=0; t<days*24; ++t){
                weed_grow(reward,[n_dim,n_dim],60*60);
            }
        }
        //weed_grow(reward,[n_dim,n_dim],dt);
        
        // spawn agents
        for (var i = 0; i < n_agents; ++i){
            agent_list[i] = new FarmAgent(i);
            agent_list[i].mode = agent_list[i].modes.idle;
        }
        //if(DP_on_not_off){
            update_agent_reward_and_queue_and_qvalue();
        // }
        //else{
        //    update_row_queue();
        //}
        for (var i = 0; i < n_agents; ++i){
            agent_list[i].updateQueue(row_queue[i]);
            console.log(agent_list[i].queue);
        }
        sim_state = sim_states.ready;
        
        if (n_episode > 1){
            if(document.getElementById("MC").checked){
                //upload_to_file();
                save_to_file();
                message = "Experiment " + curr_exp + " complete.";
                curr_exp += 1;
                update_exp();
                sim_state == sim_states.run
            }
            else{
                message ="Experiment end. Save and proceed.";
            }
        }
        else{
            message = "To start the simulation press RUN";
        }
    }
    
    if (sim_state == sim_states.run){
        
        var dt = -document.getElementById("tscale").value*(endTime - startTime)/1000.0;
        
        update_agent_reward_and_queue_and_qvalue();
        weed_grow(reward,[n_dim,n_dim],dt);
        
        for (var i = 0; i < n_agents; ++i){
            agent_list[i].step(myGrid.n_dim, dt);
            //agent_list[i].report();
        }
        
        t_time += dt;
        
        if (document.getElementById("show_graph").checked && plotTimer < t_time){
            plotTimer = t_time + 60;
            reward_hist.push({x:t_time/60,y:-totalReward(reward)/n_agents});
            hist += 'time: ' + t_time/60 + ' Cum reward: ' + -totalReward(reward)/n_agents + '\n';
            plot_result(reward_hist);
        }
    }
    
    endTime = new Date().getTime();
    if(t_time > 360000){
        sim_state = sim_states.reset;
    }
    
    // DRAW AND UPDATE
    if(document.getElementById("show_visual").checked){
        draw();
    }
}

function plot_result(reward_hist){
    Highcharts.chart('container', {
                     title: {text: 'Cumulative Reward Vs. Time'},
                     xAxis: {title: {enabled: true,text: 'Time (min)'}},
                     yAxis: {title: {text: 'Cumulative Reward'}},
                     series: [{
                              name: 'Reward',
                              data: reward_hist,
                              lineWidth: 1,
                              }],
                     plotOptions: {
                         line: {
                             marker: {
                                 enabled: false
                             },
                             animation: false,
                         }
                     },
     });
}

function save_to_file(){
    var hiddenElement = document.createElement('a');
    
    hiddenElement.href = 'data:attachment/text,' + encodeURI(hist);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'data_' + new Date().getTime() + '_' + growth_speed + '_' + spawn_probability + '_' + observation_radius + '_' + n_agents + '_' + agent_speed + '.txt';
    hiddenElement.click();
}

function update_exp(){
    switch (curr_exp){
        case 1:
            MC_on_not_off           = 1;
            growth_speed            = 10/(24*60*60); // 1 inch per day
            spawn_probability       = 1000000;
            observation_radius      = 1;
            n_agents                = 5;
            agent_speed             = 1.46667;
            break;
        case 2:
            MC_on_not_off           = 1;
            growth_speed            = 10/(24*60*60); // 1 inch per day
            spawn_probability       = 1000000;
            observation_radius      = 1;
            n_agents                = 5;
            agent_speed             = 1.46667;
            break;
        case 3:
            MC_on_not_off           = 1;
            growth_speed            = 10/(24*60*60); // 1 inch per day
            spawn_probability       = 1000000;
            observation_radius      = 1;
            n_agents                = 5;
            agent_speed             = 1.46667;
            break;
        case 4:
            MC_on_not_off           = 1;
            growth_speed            = 10/(24*60*60); // 1 inch per day
            spawn_probability       = 1000000;
            observation_radius      = 1;
            n_agents                = 5;
            agent_speed             = 1.46667;
            break;
        case 5:
            curr_exp = 1;
            break;
    }
}

function draw(){
    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (document.getElementById("show_weed").checked)
        myGrid.show_colors(canvas,weed_height);
    
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

function totalReward(r_matr){
    var total = 0;
    for (var i = 0; i < n_dim; i++){
         for (var j = 0; j < n_dim; j++)
            total += r_matr[i][j];
    }
    return total;
}
//------------------------------------------------------
