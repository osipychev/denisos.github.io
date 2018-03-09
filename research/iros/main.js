//------------------------------------------------------
//-- CONSTANTS & GLOBAL VARIABLES

//-- Canvas Parameters
var agent_list              = [];
var plotTimer               = 0;
var canvas;
var myGrid;
var n_dim;
var startTime, endTime;

//-- Simulation Parameters
var sim_states              = {reset:0,ready:4,run:5,wait:6,manual:7};
var sim_state               = sim_states.reset;
var mouse_pos               = [];
var message                 = [];
var t_time                  = 0;
var reward                  = [];
var agent_reward            = [];
var reward_hist             = [];

//-- Experiment Parameters
var cum_reward              = 0;
var hist                    = [];
var row_queue               = [];
var row_queue_exp           = [];

//-- MDP Parameters
var value                   = [];
var value_exp               = [];
var term_map                = [];
var n_actions               = 4;
var alpha                   = 0.999999999999;
var gamma                   = 0.999999999999;

//-- Environment Parameters
var actions                 = {idle:1, kill:2, left:3, right:4};
var state                   = new Array(5);
var statecharge             = [0, 0];
var T_KILL                  = 60;            // sec to kill one weed

//-- Row Arrays
var show_reward             = [];
var show_row                = [];
var row_occupied            = [];
var weed_hist               = [];
var weed_height             = [];
var weed_density            = [];
var seed_bank               = [];
var agent_bus               = [];

//-- Targeted Information Gathering (TIG) Parameters
var number_rows_explored    = 0;
var explored_row_total      = 0;
var average_row_reward      = 0;

//-- Weed Parameters
var growth_speed            = 1/(24*60*60);  // 1 inch per day

//-- Agent Parameters
var MAX_SPEED               = 1;            // feet per sec
var MAX_WEED                = 5;            // max size inches that can kill
var T_CHARGE                = 60;           // 60*60 ; // time to full charge in sec

//-- Algorithm Parameters
var TIG_on_not_off          = 1;            // Targeted InformationGathering on or off
var CO_on_not_off           = 0;            // Charging Optimization on or off

//-- MC Parameters
var n_episode               = 0;
var curr_exp                = 6;           // Current Experiment
var exp_episodes            = 10;          // Numeber of Episodes in Experiment
var episode_length_minutes  = 24*60*4;     // Number of Minutes of one Experiment - 4 days
var n_agents_min = 2;                      // Min Number of Agents
var n_agents_max = 10;                     // Max Number of Agents
var agent_speed_min = 1;                   // Min Agent Speed  speed feet per second
var agent_speed_max = 3;                   // Max Agent Speed  speed feet per second
var days_min = 1;                          // Min Number of Days of Weed Growth before simulation start
var days_max = 6;                          // Max Number of Days of Weed Growth before simulation start
var init_seedbank_min = 10;                // Min Initial Number of Seeds in Each Square of Seedbank
var init_seedbank_max = 100;               // Max Initial Number of Seeds in Each Square of Seedbank
var PEI_on_not_off;                        // Partial Eviromental Information on or off
var observation_radius;                    // Radius of Observation
var n_agents;                              // Number of Agents
var agent_speed;                           // Agent Speed feet per second
var days;                                  // Number of Days of Weed Growth before simulation start
var init_seedbank;                         // Initial Number of Seeds in Each Square of Seedbank

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
        if((n_episode == 0) && (document.getElementById("MC").checked == 0)){
            PEI_on_not_off = 1;
            observation_radius = document.getElementById("observation_radius").value;
            n_agents = document.getElementById("n_agents").value;
            agent_speed = document.getElementById("agent_speed").value; // 1 foot per second
            days = document.getElementById("days_allowance").value;
            init_seedbank = document.getElementById("seedbank").value;
        }
        else if ((n_episode == 0) && (document.getElementById("MC").checked == 1)){
            update_exp();
        }
        
        // clear variables
        n_iter                          = 0;
        cum_reward                      = 0;
        t_time                          = 0;
        plotTimer                       = 0;
        agent_list                      = [];
        reward_hist                     = [];
        hist                            = [];
        n_dim                           = document.getElementById("n_dim").value;
        
        if(n_episode == 0){
            message = "To start the simulation press RUN";
            sim_state = sim_states.ready;
        }
        else if((document.getElementById("MC").checked) && (n_episode > 0)){
            if(n_episode > exp_episodes){
                curr_exp += 1;
                n_episode = 1;
            }
            update_exp();
            sim_state = sim_states.run;
        }
        
        // initialize
        myGrid                          = new UGrid2D([-1.,-1.],[1.,1.],n_dim);
        mdp_init();
        
        if(document.getElementById("MC").checked){
           for (var t=0; t<days*24; ++t){
                weed_grow(reward,[n_dim,n_dim],60*60);
            }
        }
        else if(document.getElementById("uniform").checked){
            initial_uniform(document.getElementById("seedbank").value,n_dim);
        }
        else if(document.getElementById("binomial").checked){
            days = document.getElementById("days_allowance").value;
            for (var t=0; t<days*24; ++t){
                weed_grow(reward,[n_dim,n_dim],60*60);
            }
        }

        reward_hist = [{x:0,y:-totalReward(reward)/n_agents}];
        
        // spawn agents
        for (var i = 0; i < n_agents; ++i){
            agent_list[i] = new FarmAgent(i);
            agent_list[i].mode = agent_list[i].modes.idle;
        }

        update_agent_reward_and_queue_and_value();

        for (var i = 0; i < n_agents; ++i){
            agent_list[i].updateQueue(row_queue[i]);
            console.log(agent_list[i].queue);
        }
    }
    
    if (sim_state == sim_states.run){
        if(n_episode == 0){
            n_episode = 1;
        }
        var dt = -document.getElementById("tscale").value*(endTime - startTime)/1000.0;
        
        update_agent_reward_and_queue_and_value();
        weed_grow(reward,[n_dim,n_dim],dt);
        
        for (var i = 0; i < n_agents; ++i){
            agent_list[i].step(myGrid.n_dim, dt);
            //agent_list[i].report();
        }
        
        t_time += dt;
        
        if (plotTimer < t_time){
            reward_hist.push({x:t_time/60,y:-totalReward(reward)/n_agents});
            hist += 'time: ' + t_time/60 + ' Cum reward: ' + -totalReward(reward)/n_agents + '\n';
            plotTimer = t_time + 60;
            if (document.getElementById("show_graph").checked){
                plot_result(reward_hist);
            }
        }
    }
    
    endTime = new Date().getTime();
    if ((t_time/60 > episode_length_minutes) ||
        (reward_hist[reward_hist.length - 1]["y"] > -1)){
        sim_state = sim_states.reset;
        if(document.getElementById("MC").checked){
            save_to_file();
        }
        n_episode += 1;
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
                              turboThreshold:episode_length_minutes
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
    hiddenElement.download = 'data' + '_' + curr_exp + '_' + n_episode + '_' + PEI_on_not_off + '_' + observation_radius + '_'
    + n_agents + '_' + agent_speed + '_' + days + '_' + init_seedbank + '.txt';
    hiddenElement.click();
}

function update_exp(){
    switch (curr_exp){
        case 1:
            PEI_on_not_off          = 0;
            observation_radius      = 0;
            n_agents                = 5;
            agent_speed             = 1;
            days                    = 3;
            init_seedbank           = 20;
            break;
        case 2:
            PEI_on_not_off          = 1;
            observation_radius      = 0;
            n_agents                = 5;
            agent_speed             = 1;
            days                    = 3;
            init_seedbank           = 20;
            break;
        case 3:
            PEI_on_not_off          = 1;
            observation_radius      = 1;
            n_agents                = 5;
            agent_speed             = 1;
            days                    = 3;
            init_seedbank           = 20;
            break;
        case 4:
            PEI_on_not_off          = 1;
            observation_radius      = 1;
            n_agents                = 5;
            agent_speed             = Math.floor(Math.random() * (agent_speed_max - agent_speed_min + 1)) + agent_speed_min;
            days                    = 3;
            init_seedbank           = Math.floor(Math.random() * (init_seedbank_max - init_seedbank_min + 1)) + init_seedbank_min;
            break;
        case 5:
            PEI_on_not_off          = 1;
            observation_radius      = 1;
            n_agents                = 5;
            agent_speed             = Math.floor(Math.random() * (agent_speed_max - agent_speed_min + 1)) + agent_speed_min;
            days                    = Math.floor(Math.random() * (days_max - days_min + 1)) + days_min;
            init_seedbank           = 20;
            break;
        case 6:
            PEI_on_not_off          = 1;
            observation_radius      = 1;
            n_agents                = Math.floor(Math.random() * (n_agents_max - n_agents_min + 1)) + n_agents_min;
            agent_speed             = 1;
            days                    = 3;
            init_seedbank           = Math.floor(Math.random() * (init_seedbank_max - init_seedbank_min + 1)) + init_seedbank_min;
            break;
        case 7:
            PEI_on_not_off          = 1;
            observation_radius      = 1;
            n_agents                = Math.floor(Math.random() * (n_agents_max - n_agents_min + 1)) + n_agents_min;
            agent_speed             = 1;
            days                    = Math.floor(Math.random() * (days_max - days_min + 1)) + days_min;
            init_seedbank           = 20;
            break;
        case 8:
            curr_exp = 1;
            sim_state = sim_states.ready;
            break;
    }
}

function draw(){
    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (document.getElementById("show_weed").checked){
        myGrid.show_colors(canvas,weed_height);
    }
    
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

