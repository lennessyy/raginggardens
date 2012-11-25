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
     
    // UpdateStats Event - score, carrots
    Crafty.bind("UpdateStats",function() {
        $('#carrots').text('Carrots: ' + player.get('carrotsCount'));
    });
    
    // Show in-game message
    Crafty.bind("ShowMsg", function(msg) {
        if (msg == 'carrots') {
            $('#msgs').css('color','#aa0000');
            $('#msgs').text('Not enough carrots!');
        }
    });
    
    // Show HiScore Dialog
    Crafty.bind("ShowHiScore", function(text) {
        if (!text) {
            var hiscore = new Hiscore();
            
            // load scores
            var text = '<div>';
            text += '<span class="name">';
            text += '[Name]';
            text += '</span>';
            text += '<span class="score">';
            text += '[Carrots]';
            text += '</span>';
            text += '</div>';            
            hiscore.getAllScores(function(scores, server) {
                server.close();
                var i = 0;
                scores.each(function(obj) {
                    if (++i > 6)
                        return;
                    text += '<div>';
                    text += '<span class="name">';
                    text += obj.get('name');
                    text += '</span>';
                    text += '<span class="score">';
                    text += obj.get('score');
                    text += '</span>';
                    text += '</div>';
                    
                });                
                Crafty.trigger("ShowHiScore", text);
            });
            return;
        }
        
        $("#dialog-score").html(text);
        // show dialog
        $("#dialog-score").dialog({
            resizable: false,
            "width": 460,
            "height": 300,
            modal: true,
            "title": "Top 5 Scores",
            buttons: {
                "Reset Scores": function() {
                    // reset scores
                    var hiscore = new Hiscore();
                    hiscore.resetScores(function() {
                        Crafty.trigger("ShowHiScore");    
                        $(this).dialog("close");
                    });
                },
                "Let me out!": function() {
                    $(this).dialog("close");
                }
            },
            close: function(event, ui) {
                 //Crafty.destroy();
                //TODO:
                window.location.reload() // TODO: Cheap! :( Must replace with proper restart.
            }            
        });          
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
    var gameTimeLeft = Date.now() + _Globals.conf.get('gameTimeLimit'); 
    
    Crafty.bind("EnterFrame",function(frame){
        
        var currentTime = Date.now();
        
        if (gameTimeLeft < currentTime) {
            Crafty.stop();
            var hiscore = new Hiscore();
            hiscore.addScore('You', player.get('carrotsCount'), function() {
                Crafty.trigger("ShowHiScore");    
            });       
        } else {
            // --- time left
            var leftTime = (gameTimeLeft - currentTime) / 1000;
            var leftMin = Math.floor(leftTime / 60);
            var leftSec = leftTime % 60;
            $('#timer').text('Time Left: ' + leftMin.toFixed(0) + ':' + leftSec.toFixed(2));            
        }
        
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

