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
    Crafty.bind("UpdateStats",function() {
        $('#carrots').text('Carrots: ' + player.get('carrotsCount'));
    });  
    
    // display active FPS (only in DEBUG mode)
    if (_Globals.conf.get('debug')) {
        Crafty.e("2D, Canvas, FPS").attr({maxValues:10}).bind("MessureFPS", function(fps) {
            $('#fps').text('FPS: ' + fps.value);
            //console.log(this.values); // Display last x Values
        })
    }    
    
    // Gameloop
    var carrotSpawnTime = Date.now();
    var enemySpawnTime = Date.now();
    // 5 minutes
    var gameTimeLeft = Date.now() + 100000; 
    
    Crafty.bind("EnterFrame",function(frame){
        
        var currentTime = Date.now();
        
        // --- time left
        var leftTime = (gameTimeLeft - currentTime) / 1000;
        var leftMin = Math.floor(leftTime / 60);
        var leftSec = leftTime % 60;
        
        $('#timer').text('Time Left: ' + leftMin.toFixed(0) + ':' + leftSec.toFixed(2));
        
        // --- game logic
        var currentTime = Date.now();
        
        if (currentTime - carrotSpawnTime > 600) {
            tilemap.spawnCarrot();
            carrotSpawnTime = Date.now();
        }
        
        if (currentTime - enemySpawnTime > 1000) {
            var enemy = new Enemy({'tileMap': tilemap});
            enemySpawnTime = Date.now();
        }        
    });
    
    Crafty.trigger("UpdateStats");
     
});    

