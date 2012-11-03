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
    
    // Init game engine
    require(['src/config.js'], function() {
        
        Crafty.init(1024, 768, 25).canvas.init();
        Crafty.background('rgb(0,0,0)');
        
        //preload the needed assets
        Crafty.load(["art/sprite1.png", "art/bg1.png"], function() {
		    
            //splice the spritemap
		    Crafty.sprite(64, "art/sprite1.png", {
			    ship: [0,0],
			    big: [1,0],
			    medium: [2,0],
			    small: [3,0]
		    });
        
        
        
        });
    

		//Crafty.audio.add("Blaster", ["space-blaster.wav", "space-blaster.mp3"])

		//start the main scene when loaded
		Crafty.scene("main");
	});

    Crafty.scene("main", function() {
		Crafty.background("url('art/bg1.png')");
        
        var player = Crafty.e("2D, Canvas, Color")
          .color("red")
          .attr({x: 150, w:50, h:50});
// Can use the arrow keys as well,
  // but we don't want to accidentally change slides
  player.addComponent("Fourway").fourway(5)
        
        //score display
    	var score = Crafty.e("2D, DOM, Text")
			.text("Score: 0")
			.attr({x: Crafty.viewport.width - 300, y: Crafty.viewport.height - 50, w: 100, h:50})
			.css({color: "#fff"});        
        
        //player entity
    	var player = Crafty.e("2D, Canvas, ship, Controls, Collision")
			.attr({move: {left: false, right: false, up: false, down: false}, xspeed: 0, yspeed: 0, decay: 0.9, 
				x: Crafty.viewport.width / 2, y: Crafty.viewport.height / 2, score: 0})
			.origin("center")
			.bind("KeyDown", function(e) {
				//on keydown, set the move booleans
				if(e.keyCode === Crafty.keys.RIGHT_ARROW) {
					this.move.right = true;
				} else if(e.keyCode === Crafty.keys.LEFT_ARROW) {
					this.move.left = true;
				} else if(e.keyCode === Crafty.keys.UP_ARROW) {
					this.move.up = true;
				} else if (e.keyCode === Crafty.keys.SPACE) {
					console.log("Blast");
					Crafty.audio.play("Blaster");
					//create a bullet entity
					Crafty.e("2D, DOM, Color, bullet")
						.attr({
							x: this._x, 
							y: this._y, 
							w: 2, 
							h: 5, 
							rotation: this._rotation, 
							xspeed: 5 * Math.sin(this._rotation / 57.3), 
							yspeed: 5 * Math.cos(this._rotation / 57.3)
						})
						.color("rgb(255, 0, 0)")
						.bind("EnterFrame", function() {
							this.x += this.xspeed;
							this.y -= this.yspeed;

							//destroy if it goes out of bounds
							if(this._x > Crafty.viewport.width || this._x < 0 || this._y > Crafty.viewport.height || this._y < 0) {
								this.destroy();
							}
						});
				}
			}).bind("KeyUp", function(e) {
				//on key up, set the move booleans to false
				if(e.keyCode === Crafty.keys.RIGHT_ARROW) {
					this.move.right = false;
				} else if(e.keyCode === Crafty.keys.LEFT_ARROW) {
					this.move.left = false;
				} else if(e.keyCode === Crafty.keys.UP_ARROW) {
					this.move.up = false;
				}
			}).bind("EnterFrame", function() {
				if(this.move.right) this.rotation += 5;
				if(this.move.left) this.rotation -= 5;

				//acceleration and movement vector
				var vx = Math.sin(this._rotation * Math.PI / 180) * 0.3,
					vy = Math.cos(this._rotation * Math.PI / 180) * 0.3;

				//if the move up is true, increment the y/xspeeds
				if(this.move.up) {
					this.yspeed -= vy;
					this.xspeed += vx;
				} else {
					//if released, slow down the ship
					this.xspeed *= this.decay;
					this.yspeed *= this.decay;
				}

				//move the ship by the x and y speeds or movement vector
				this.x += this.xspeed;
				this.y += this.yspeed;

				//if ship goes out of bounds, put him back
				if(this._x > Crafty.viewport.width) {
					this.x = -64;
				}
				if(this._x < -64) {
					this.x =  Crafty.viewport.width;
				}
				if(this._y > Crafty.viewport.height) {
					this.y = -64;
				}
				if(this._y < -64) {
					this.y = Crafty.viewport.height;
				}

//				//if all asteroids are gone, start again with more
//				if(asteroidCount <= 0) {
//					initRocks(lastCount, lastCount * 2);
//				}
			});
//            .collision()
//			.onHit("asteroid", function() {
//				//if player gets hit, restart the game
//				Crafty.scene("main");
//			});        
    });

});