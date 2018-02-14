//------------------------------------------------------
//-- CONSTANTS & GLOBAL VARIABLES
var myGrid;
var canvas;
var n_dim;
var n_iter      = 0;
var state       = [0,0];
var n_actions   = 4;
var sim_states  = {reset:0,ready:4,run:5,wait:6};
var sim_state   = sim_states.reset;
var mouse_pos   = [];
var reward_hist = [];
var message     = [];

//-- EXPERIMENT GLOBALS
var n_episode   = 0;
var cum_reward  = 0;
var hist        = [];
var curr_exp    = 1;

//-- MDP PARAMETERS
var n_dim       = 5;
var epsilon     = 0.95;
var max_iter    = 1000;
var alpha       = 0.9;
var gamma       = 0.9;

//-- TRANSITIONS
var norm_trans = 1;
var semi_trans = 0;
var rand_trans = 0;

//-- VISUALIZATION
var show_R      = 0;
var show_Q      = 0;
var show_Pi     = 0;
var show_goal   = 0;
var show_labels = 0;

//-- CONTROL
var ctrl_RL     = 0;
var ctrl_human  = 1;


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

function upload_to_file(){
    console.log(' Upload ');
    file_name = ['data_' + new Date().getTime()];
    
    if(norm_trans){
        file_name += '_Normal';
    }
    if(semi_trans){
        file_name += '_SCrazy';
    }
    if(rand_trans){
        file_name += '_Crazy';
    }
    
    if(show_R){
        file_name += '_R';
    }
    if(show_Q){
        file_name += '_Q';
    }
    if(show_Pi){
        file_name += '_Pi';
    }
    if(show_goal){
        file_name += '_G';
    }
    if(show_labels){
        file_name += '_L';
    }
    
    file_name += '.txt';
    
    AWS.config.update({
                      accessKeyId : 'AKIAJSJ7L6V5OLUAXXVQ',
                      secretAccessKey : 't6NAhqOodosUowVkfhd4MMHgI0LA693uzo71S4Tk'
                      });
    AWS.config.region = 'us-east-2';
    
    var bucketName = 'human-rl-gridworld'; // 3. Enter your bucket name
    var bucket = new AWS.S3({
                            params: {
                            Bucket: bucketName
                            }
                            });
    
    var results = document.getElementById('results');
    
    results.innerHTML = '';

    var params = {
                Key: 'testing/' + file_name,
                ContentType: 'text/plain',
                Body: hist,
                ACL: 'public-read'
                };
    bucket.putObject(params, function(err, data) {
                    if (err)
                    {
                        results.innerHTML = 'ERROR: ' + err;
                    }
                    else
                    {
                        listObjs();
                    }
    });
    
    function listObjs() {
        var prefix = 'testing';
        bucket.listObjects({
                                Prefix: prefix
                           },
                           function(err, data) {
                                    if (err) {
                                        results.innerHTML = 'ERROR: ' + err;
                                    }
                                    else
                                    {
                                        var objKeys = "";
                                        data.Contents.forEach(function(obj) {
                                                              objKeys += obj.Key + "<br>";
                                        });
                                    results.innerHTML = objKeys;
                                    }
                           });
    }
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
    //n_dim = document.getElementById("n_dim").value;
    myGrid = new UGrid2D([-1.,-1.],[1.,1.],n_dim);
    mdp_init(n_dim);
    reward_hist = [];
    hist = [];
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
        if (n_episode>20){
            upload_to_file();
            message = "Experiment " + curr_exp + "/4 Complete. Press RUN.";
            curr_exp += 1;
            update_exp();
            generate();

        }
        else{
            message = "Episode ended. Press RUN";
        }
    }
    
    //var epsilon = document.getElementById("epsilon").value;
    //var max_iter = document.getElementById("num_iter").value
    
    if (n_iter < max_iter && (sim_state == sim_states.run) ){
		
        var action=-1;
        
        if(ctrl_RL){
            if (Math.random() < epsilon){
                action = findMaxInd(get_qvalue(state));
                console.log("best action");
            }
            else{
                action = Math.floor(Math.random() * n_actions);
                console.log("random action");
            }
        }
        else if(ctrl_human){
            handleKeys();
            if (keyEvents.active.left){
                action = 0;
                keyEvents.active.left = false;
            }
            else if (keyEvents.active.right){
                action = 1;
                keyEvents.active.right = false;
            }
            else if (keyEvents.active.up){
                action = 2;
                keyEvents.active.up = false;
            }
            else if (keyEvents.active.down){
                action = 3;
                keyEvents.active.down = false;
            }
        }

        if (action > -1){
            n_iter += 1;
            console.log("Action taken:",action);
            var prev_state = state.slice();
            state = mdp_step(state,action,n_dim,norm_trans,semi_trans,rand_trans);
            var rwrd = reward[state[0]][state[1]];
            update_qvalue(prev_state,state,action,rwrd,alpha,gamma);
        
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

function update_exp(){
    switch (curr_exp){
        case 1:
            //-- TRANSITIONS
            norm_trans = 1;
            semi_trans = 0;
            rand_trans = 0;
            
            //-- VISUALIZATION
            show_R      = 0;
            show_Q      = 0;
            show_Pi     = 0;
            show_goal   = 0;
            show_labels = 0;
            break;
        case 2:
            //-- TRANSITIONS
            norm_trans = 0;
            semi_trans = 0;
            rand_trans = 1;
            
            //-- VISUALIZATION
            show_R      = 0;
            show_Q      = 0;
            show_Pi     = 0;
            show_goal   = 0;
            show_labels = 0;
            break;
        case 3:
            //-- TRANSITIONS
            norm_trans = 0;
            semi_trans = 0;
            rand_trans = 1;
            
            //-- VISUALIZATION
            show_R      = 0;
            show_Q      = 0;
            show_Pi     = 1;
            show_goal   = 0;
            show_labels = 0;
            break;
        case 4:
            //-- TRANSITIONS
            norm_trans = 0;
            semi_trans = 1;
            rand_trans = 0;
            
            //-- VISUALIZATION
            show_R      = 0;
            show_Q      = 0;
            show_Pi     = 0;
            show_goal   = 0;
            show_labels = 0;
            break;
        case 5:
            curr_exp = 1;
            break;
    }
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

    if (show_R){
        myGrid.show_values(canvas,reward,n_dim);
    }
    if (show_Q){
        myGrid.show_qvalues(canvas,qvalue,n_dim,n_actions);
    }
    if (show_Pi){
        myGrid.show_policy(canvas,qvalue,n_dim,n_actions);
    }
    if (show_goal){
        myGrid.show_colors(canvas,reward,n_dim);
    }
    if (show_labels){
        myGrid.show_symbols(canvas,sym_map,n_dim);
    }
    myGrid.show_state(canvas,state,n_dim);
    myGrid.draw_grid(canvas);
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
