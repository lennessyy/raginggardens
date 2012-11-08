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
    require(["src/config.js"], function() {
        
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
            25).canvas.init();
        Crafty.background('rgb(0,0,0)');

        /**
         * Load assets
        */        
        
        Crafty.scene("loading", function() {
            Crafty.load(["art/sprite1.png", "art/bg1.png"], function() {
        	    
                // --- Graphics
    		    Crafty.sprite(64, "art/sprite1.png", {
    			    ship: [0,0],
    			    big: [1,0],
    			    medium: [2,0],
    			    small: [3,0]
    		    });
                
                // --- Audio
                //Crafty.audio.add("Blaster", ["space-blaster.wav", "space-blaster.mp3"]) 
                
    		    Crafty.scene("main");
            });
            
            console.log("Loading ...");
            
            Crafty.background("#000");
            Crafty.e("2D, DOM, Text")
            .attr({
                w: 100,
                h: 20,
                x: 150,
                y: 120
            })
            .text("Loading")
            .css({"text-align": "center", "color" : "#fff"});            
        });
        
        /**
         * Load required scenes and game data
        */           
        
		require([
            "src/scene.game.js",
            "src/actor_object.js",
            "src/asteroid.js",
            "src/player.js"
        ], function() {
            
            Crafty.scene("loading");
            
            });        
	});
});