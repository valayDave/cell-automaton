$(document).ready(function(){
    // block size`
    var size = 1;

    // get some info about the canvas
    var canvas = document.getElementById('cell_animate');
    var ctx = canvas.getContext('2d');

    var play_button = document.getElementById('generate_grid_btn');
    
    // how many cells fit on the canvas
    var w = ~~ (canvas.width / size);
    var h = ~~ (canvas.height / size);
    

    // create empty state array
    var state = new Array(h);
    for (var y = 0; y < h; ++y) {
        state[y] = new Array(w);
    }

    canvasWidth = canvas.offsetWidth;
    canvasHeight = canvas.offsetHeight;
    

    block_array = [];
    function getStartState(colCount){
        var return_arr = [];
        var center_elem = null;
        if(colCount % 2==0){
            center_elem = colCount/2;
        }else{
            center_elem = Math.floor(colCount/2);
        }
        for(var i=0;i<colCount;i++){
            if(i == center_elem){
                return_arr.push(1);
            }else{
                return_arr.push(0);
            }
        }
        return return_arr;
    }

    var ruleMaps = {
        "30" : {
            '111': 0,
            '110': 0,
            '101': 0,
            '100': 1,
            '011': 1,
            '010': 1,
            '001': 1,
            '000': 0   
        },
        '102' : {
            '111': 0,
            '110': 1,
            '101': 1,
            '100': 0,
            '011': 0,
            '010': 1,
            '001': 1,
            '000': 0   
        },
        '146':{
            '111': 1,
            '110': 0,
            '101': 0,
            '100': 1,
            '011': 0,
            '010': 0,
            '001': 1,
            '000': 0   
        },
        '110':{
            '111': 0,
            '110': 1,
            '101': 1,
            '100': 0,
            '011': 1,
            '010': 1,
            '001': 1,
            '000': 0
        },
        '126':{
            '111': 0,
            '110': 1,
            '101': 1,
            '100': 1,
            '011': 1,
            '010': 1,
            '001': 1,
            '000': 0
        }

    }
    // quick fill function to save repeating myself later
    function fill(s, gx, gy) {
        ctx.fillStyle = s;
        ctx.fillRect(gx * size, gy * size, size, size);
    }
    function execute_rule(rowCount,colCount,selected_rule){
        var startState = getStartState(colCount);
        var generations = [startState];
        for(var i=1;i<rowCount;i++){
            var ancestors = generations[i-1];
            var decendents = [];
            for(var j=0;j<colCount;j++){
                var neighbor_arr = [];
                if(j==0){
                    Array.prototype.push.apply(neighbor_arr, [0,ancestors[j],ancestors[j+1]]);
                }else if (j==colCount-1){
                    Array.prototype.push.apply(neighbor_arr, [ancestors[j-1],ancestors[j],0]);
                }else{
                    Array.prototype.push.apply(neighbor_arr, [ancestors[j-1],ancestors[j],ancestors[j+1]]);
                }
                decendents.push(ruleMaps[selected_rule][neighbor_arr.join("")]);
            }
            generations.push(decendents);
        }
        return generations;
    }

    function getSelectedRule(){
        var selected_rule = $('input[name=rule]:checked').val();
        if(!ruleMaps[selected_rule]){
            console.log("Rule Not Present :",selected_rule);
            return selected_rule;
        }
        return selected_rule;
    }

    function checkAnimation(){
        var selected_rule = $('input[name=animate]:checked').val();
        return selected_rule  === 'True';
    }

    function colorCanvas(generations,rowBlockCount,colBlockCount){
        for(var i=0;i<rowBlockCount;i++){
            for(var j=0;j<colBlockCount;j++){
                if(generations[i][j] == 0){
                    fill('white',j,i);
                }else{
                    fill('black',j,i);
                }
            }     
        }
    }

    function animateCanvas(generations,rowBlockCount,colBlockCount){
        var top_loop_index = 0;
        var bottom_loop_index = 0;
        var check_loop_completion = true;

        function draw(){
            for(top_loop_index;top_loop_index<rowBlockCount;top_loop_index++){
                for(bottom_loop_index;bottom_loop_index<colBlockCount;bottom_loop_index++){
                    if(generations[i][j] == 0){
                        fill('white',bottom_loop_index,top_loop_index);
                    }else{
                        fill('black',bottom_loop_index,top_loop_index);
                    }
                }     
            }
        }

    }



    //Actual Inputs read Over Here and dynamic canvas created Here. 
    $(play_button).click(function(){
        var block_size = document.getElementById('block_size');
        var reached_size = null;
        try{
            reached_size = parseInt(block_size.value);
        }catch(err){
            return alert("Please Enter Integer value");
        }
        if(reached_size){
            size = reached_size;
        }
        console.log("Size : !",size);
        run_generation();
    });

    var run_generation = function(){
        var colBlockCount= canvasWidth/size;
        var rowBlockCount = canvasHeight/size;
        var selected_rule = getSelectedRule();
        if(!selected_rule){
            return alert("Please Select a Rule ");
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var generations = execute_rule(rowBlockCount,colBlockCount,selected_rule);
        if(checkAnimation()){
            animateCanvas(generations,rowBlockCount,colBlockCount);
        }else{
            colorCanvas(generations,rowBlockCount,colBlockCount);
        }
    };
    $(play_button).click(run_generation);
});



 // setInterval(draw)
        
        // function topLoop(){
        //     setTimeout(function(){
        //         top_loop_index++;
        //         if(!check_loop_completion){
        //             topLoop();
        //             return;
        //         }
        //         bottomLoop();
        //         bottom_loop_index =0;
        //         if(top_loop_index < rowBlockCount){
        //             topLoop();
        //         }
        //     },50)
        // }

        // function bottomLoop(){
        //     setTimeout(function(){
        //         check_loop_completion = false;
        //         bottom_loop_index++;
        //         if(generations[top_loop_index][bottom_loop_index] == 0){
        //             fill('white',bottom_loop_index,top_loop_index);
        //         }else{
        //             fill('black',bottom_loop_index,top_loop_index);
        //         }
        //         if(bottom_loop_index < colBlockCount){
        //             bottomLoop();
        //         }else{
        //             check_loop_completion = true;
        //         }
        //     },30);
        // }


// // click event, using jQuery for cross-browser convenience
// $(canvas).click(function(e) {

//     // quick fill function to save repeating myself later
//     function fill(s, gx, gy) {
//         ctx.fillStyle = s;
//         ctx.fillRect(gx * size, gy * size, size, size);
//     }

//     // get mouse click position
//     var mx = e.offsetX;
//     var my = e.offsetY;
//     console.log(mx,my);

//     // calculate grid square numbers
//     var gx = ~~ (mx / size);
//     var gy = ~~ (my / size);
    
//     // make sure we're in bounds
//     if (gx < 0 || gx >= w || gy < 0 || gy >= h) {
//         return;
//     }

//     if (state[gy][gx]) {
//         // if pressed before, flash red
//         fill('red', gx, gy);
//         setTimeout(function() {
//             fill('black', gx, gy)
//         }, 1000);
//     } else {
//         state[gy][gx] = true;
//         fill('black', gx, gy);
//     }
// });