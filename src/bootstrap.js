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
$(document).ready(function() {
    require(["src/config.js", "src/actor_object.js"], function() {
        
        /**
         * Global Registry
        */
        
        _Globals['conf'] = new Config({});
        
        /**
         * Init Crafty Engine
        */
        
        Crafty.init(
            _Globals.conf.get('screen-width'), 
            _Globals.conf.get('screen-height'), 
            50).canvas.init();
        Crafty.background('rgb(0,0,0)');

        /**
         * Load assets
        */        
        
        Crafty.scene("loading", function() {
            Crafty.load([
                "art/moosader_tiles.png", 
                "art/stuz_rabbit.png",
               // "art/crosshairs_small_32x32.png",
                "art/moosader_flower.png",
                ], 
            
            function() {
        	    
                // --- Graphics
        	    Crafty.sprite(64, "art/moosader_tiles.png", {
    			    grass: [0,0],
    			    stone_small: [1,0],
    			    stone_big: [2,0],
    			    tree: [0,1],
                    barrel_big: [1,1],
                    barrel_small: [2,1],
    		    });
                
                Crafty.sprite("art/stuz_rabbit.png", {
    			    player: [0, 0, 32, 48],
    		    });
                
                Crafty.sprite("art/moosader_ayne.png", {
        		    enemy: [0, 0, 32, 48],
    		    });                
                
//                Crafty.sprite(32, "art/crosshairs_small_32x32.png", {
//        		    crosshair: [0, 0],
//                    crosshair_target: [0, 1],
//    		    });   
                
                Crafty.sprite(32, "art/moosader_flower.png", {
                    carrot: [0, 0],
    		    });                  
                
                // --- Audio
                //Crafty.audio.add("Blaster", ["space-blaster.wav", "space-blaster.mp3"]) 
                
    		    Crafty.scene("main");
            },
            // On Progress
            function(e) {
                // TODO:
            },
            // On Error
            function(e) {
                // TODO
            });
            
            console.log("Loading ...");
            
            Crafty.background("#000");
            Crafty.e("2D, Canvas, Text")
            .attr({
                w: 100,
                h: 20,
                x: 150,
                y: 120
            })
            .text("Loading");
//            .css({"text-align": "center", "color" : "#fff"});            
        });
        
        /**
         * Load required scenes and game data
         */           
    	require([
            "src/actor_object.js",
            "src/asteroid.js",
            "src/tilemap.js",
            "src/player.js",
            "src/enemy.js",
            "src/scene.game.js"
        ], function() {            
                
        Crafty.scene("loading");
            
        });    
        
	});
});