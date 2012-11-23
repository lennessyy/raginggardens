/*
 * The MIT License
 * 
 * Copyright (c) 2012 Petar Petrov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
Crafty.scene("main", function() {
    
    // game map
    var tilemap = new Tilemap();
    // player
    var player = new Player({'tileMap': tilemap});
    
    /**
     * Triggers to update various game states
     */
    
    // UpdateStats Event
    Crafty.bind("UpdateScore",function(){
//        //calculate percents
//        player.heat.percent = Math.round(player.heat.current/player.heat.max * 100);
//        player.hp.percent = Math.round(player.hp.current/player.hp.max * 100);
//        player.shield.percent = Math.round(player.shield.current/player.shield.max * 100);
//       
//        //display the values
//        infos.heat.text('Heat: '+player.heat.current+ '/'+player.heat.max);
//        infos.hp.text('HP: '+player.hp.current+ '/'+player.hp.max);
//        infos.shield.text('Shield: '+player.shield.current+ '/'+player.shield.max);
//        infos.score.text("Score: "+player.score);
//        infos.lives.text("Lives: "+player.lives);
//        
//        //Update progressbars
//        bars.heat.progressbar({
//            value:player.heat.percent
//        });
//        bars.hp.progressbar({
//            value:player.hp.percent
//        });
//        bars.shield.progressbar({
//            value:player.shield.percent
//        });

    });  
    
    // Gameloop
    var carrotSpawnTime = Date.now();
    var enemySpawnTime = Date.now();
    
    Crafty.bind("EnterFrame",function(frame){
        
        //console.log('gameloop');
        
        $('#timer').text('Score: ' + frame.frame);
        $('#carrots').text('Carrots: ' + player.get('carrotsCount'));
        
        // --- game logic ---
        var currentTime = Date.now();
        
        if (currentTime - carrotSpawnTime > 2500) {
            tilemap.spawnCarrot();
            carrotSpawnTime = Date.now();
        }
        
        if (currentTime - enemySpawnTime > 1000) {
            var enemy = new Enemy({'tileMap': tilemap});
            enemySpawnTime = Date.now();
        }        
    });
    
    // display active FPS (only in DEBUG mode)
    if (_Globals.conf.get('debug')) {
        Crafty.e("2D, Canvas, FPS").attr({maxValues:10}).bind("MessureFPS", function(fps) {
            $('#fps').text('FPS: ' + fps.value);
            //console.log(this.values); // Display last x Values
        })
    }
     
});    

