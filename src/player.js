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
 
Crafty.c("MouseDirection", {
    _dirAngle: 0, // simple type -> not shared

    _onmousemove: function (e) {
        if (this.disableControls || this.disregardMouseInput) {
            return;
        }
        
    	var dx = e.realX - this.x, 
            dy = e.realY - this.y;
            
        //_dirAngle = Math.asin(dy / Math.sqrt(dx * dx + dy * dy)) * 2 * Math.PI;
        this._dirAngle = Math.atan2(dy, dx);
        
        if (Crafty.math.withinRange(this._dirAngle, this._pi_4, this.pi_4)) { // RIGHT
            this._dirMove = this._directions.right;
        } else if (Crafty.math.withinRange(this._dirAngle, this.pi_4, this.pi_34)) { // DOWN
            this._dirMove = this._directions.down;
        } else if (Crafty.math.withinRange(this._dirAngle, this.pi_34, this.pi)) { // LEFT
            this._dirMove = this._directions.left;
        }
        
        if (Crafty.math.withinRange(this._dirAngle, this._pi, this._pi_34)) { // LEFT
            this._dirMove = this._directions.left;
        } else if (Crafty.math.withinRange(this._dirAngle, this._pi_34, this._pi_4)) { // UP
            this._dirMove = this._directions.up;
        } else if (Crafty.math.withinRange(this._dirAngle, this._pi_4, 0)) { // RIGHT
            this._dirMove = this._directions.right;
        }    
    },

    init: function () {
        this.requires("Mouse");
        
        // init radian angular measurements with respect to atan2 (arctangent) calculations
        // this would mean in the ranges of (0, -pi) and (0, pi).
        // This was helpful :P - http://en.wikipedia.org/wiki/File:Degree-Radian_Conversion.svg
        this.pi = Math.PI;
        this._pi = -1 * Math.PI;
        this.pi_4 = Math.PI / 4;
        this._pi_4 = -1 * this.pi_4;
        this.pi_34 = 3 * Math.PI / 4;
        this._pi_34 = -1 * this.pi_34;
        
        this._directions = {none: 0, left : -1, right : 1, up : -2, down : 2};
        this._dirMove = this._directions.none;

        Crafty.addEvent(this, Crafty.stage.elem, "mousemove", this._onmousemove);
    }
});

Crafty.c('Dude', {
    Dude: function() {
            //setup animations
            this.requires("SpriteAnimation, Collision, Grid")
            .animate("walk_left", [ [0, 96], [32, 96], [64, 96] ])
            .animate("walk_right", [ [0, 144], [32, 144], [64, 144] ])
            .animate("walk_up", [ [0, 48], [32, 48], [64, 48] ])
            .animate("walk_down", [ [0, 0], [32, 0], [64, 0] ])
            return this;
    }
});

Player = ActorObject.extend({
    defaults: {
        'speed' : 2,
        'spriteHeight' : 48,
        'z-index' : 10,
    },
    initialize: function() {
    	var model = this;
        
        model.set('sprite-z', model.get('spriteHeight') + model.get('z-index'));
        
    	var entity = Crafty.e("2D, Canvas, Dude, player, MouseDirection")
		
        .attr({move: {left: false, right: false, up: false, down: false},
                x: 16, y: 304, z: 10,
                speed: 2
        })
        //.leftControls(model.get('speed'))
        .Dude()
        
        // movement
        .bind("KeyDown", function(e) {
    		if (e.keyCode === Crafty.keys.D) {
				this.move.right = true;
			} else if(e.keyCode === Crafty.keys.A) {
				this.move.left = true;
			} else if(e.keyCode === Crafty.keys.W) {
				this.move.up = true;            
			} else if(e.keyCode === Crafty.keys.S) { 
                this.move.down = true;
			}
        })
    	.bind("KeyUp", function(e) {
        	if (e.keyCode === Crafty.keys.D) {
				this.move.right = false;
			} else if(e.keyCode === Crafty.keys.A) {
				this.move.left = false;
			} else if(e.keyCode === Crafty.keys.W) {
				this.move.up = false;            
			} else if(e.keyCode === Crafty.keys.S) { 
                this.move.down = false;
			}      
    	})
        // updates
    	.bind("EnterFrame", function() {
            
            var oldx = this.x;
            var oldy = this.y;
            var moving = this.move.up || this.move.down || this.move.left || this.move.right;

			if (this.move.up) {
//                this.x += Math.cos(this._dirAngle) * this.speed;
//                this.y += Math.sin(this._dirAngle) * this.speed;
                this.y -= this.speed;
			} 
            if (this.move.down) {
                this.y += this.speed;
			} 
            if (this.move.left) {
                this.x -= this.speed;
			} 
            if (this.move.right) {
                this.x += this.speed;
			}
            
            // determine which animation to show depending on the angle of movement
            if (moving) {
                var animation = undefined;
                
                if (this._dirMove == this._directions.up) {
                    animation = 'walk_up';
                } else if (this._dirMove == this._directions.down) {
                    animation = 'walk_down';
                } else if (this._dirMove == this._directions.left) {
                    animation = 'walk_left';
                } else if (this._dirMove == this._directions.right) {
                    animation = 'walk_right';
                }
                
//                _Globals.conf.debug('walk=' + animation + ' / angle=' + this._dirAngle);

                if (animation && !this.isPlaying(animation))
                    this.stop().animate(animation, 5, -1);
                
            } else {
                this.stop();
            }
            
            // check for collisions
            if(this.hit('stone_small') || this.hit('tree') 
            || this.hit('barrel_small') || this.hit('stone_big')) {
                console.log("Hit ");
                this.attr({x: oldx, y: oldy});
                return;
            }
            
            // determine how to Z-index
            this.attr({z: this.y + model.get('sprite-z')});

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
    	})
        
        // collision detection
        .bind('Move', function(from) {

        })
        // define player collision properties
        .collision(
            [8, 40], 
            [24, 40], 
            [24, 48], 
            [8, 48]
        );         

    	model.set({'entity' : entity });
    }
});


//var entity = Crafty.e("2D, Canvas, ship, Controls, Collision")
//
//       .attr({move: {left: false, right: false, up: false, down: false}, xspeed: 0, yspeed: 0, 
//            decay: 0.9, x: Crafty.viewport.width / 2, y: Crafty.viewport.height / 2, score: 0, z: 1})
//    	
//        .origin("center")
//		
//        .bind("KeyDown", function(e) {
//			//on keydown, set the move booleans
//			if(e.keyCode === Crafty.keys.RIGHT_ARROW) {
//				this.move.right = true;
//			} else if(e.keyCode === Crafty.keys.LEFT_ARROW) {
//				this.move.left = true;
//			} else if(e.keyCode === Crafty.keys.UP_ARROW) {
//				this.move.up = true;
//			} else if (e.keyCode === Crafty.keys.SPACE) {
//				console.log("Blast");
//                
//				Crafty.audio.play("Blaster");
//                
//				//create a bullet entity
//				Crafty.e("2D, DOM, Color, bullet")
//					.attr({
//						x: this._x, 
//						y: this._y, 
//						w: 2, 
//						h: 5, 
//						rotation: this._rotation, 
//						xspeed: 5 * Math.sin(this._rotation / 57.3), 
//						yspeed: 5 * Math.cos(this._rotation / 57.3)
//					})
//					.color("rgb(255, 0, 0)")
//					.bind("EnterFrame", function() {
//						this.x += this.xspeed;
//						this.y -= this.yspeed;
//
//						//destroy if it goes out of bounds
//						if(this._x > Crafty.viewport.width || this._x < 0 || this._y > Crafty.viewport.height || this._y < 0) {
//							this.destroy();
//						}
//					});
//			}
//		}).bind("KeyUp", function(e) {
//			//on key up, set the move booleans to false
//			if(e.keyCode === Crafty.keys.RIGHT_ARROW) {
//				this.move.right = false;
//			} else if(e.keyCode === Crafty.keys.LEFT_ARROW) {
//				this.move.left = false;
//			} else if(e.keyCode === Crafty.keys.UP_ARROW) {
//				this.move.up = false;
//			}
//		}).bind("EnterFrame", function() {
//			if(this.move.right) this.rotation += 5;
//			if(this.move.left) this.rotation -= 5;
//
//			//acceleration and movement vector
//			var vx = Math.sin(this._rotation * Math.PI / 180) * 0.3,
//				vy = Math.cos(this._rotation * Math.PI / 180) * 0.3;
//
//			//if the move up is true, increment the y/xspeeds
//			if(this.move.up) {
//				this.yspeed -= vy;
//				this.xspeed += vx;
//			} else {
//				//if released, slow down the ship
//				this.xspeed *= this.decay;
//				this.yspeed *= this.decay;
//			}
//
//			//move the ship by the x and y speeds or movement vector
//			this.x += this.xspeed;
//			this.y += this.yspeed;
//
//			//if ship goes out of bounds, put him back
//			if(this._x > Crafty.viewport.width) {
//				this.x = -64;
//			}
//			if(this._x < -64) {
//				this.x =  Crafty.viewport.width;
//			}
//			if(this._y > Crafty.viewport.height) {
//				this.y = -64;
//			}
//			if(this._y < -64) {
//				this.y = Crafty.viewport.height;
//			}
//
////				//if all asteroids are gone, start again with more
////				if(asteroidCount <= 0) {
////					initRocks(lastCount, lastCount * 2);
////				}
//		});
////            .collision()
////			.onHit("asteroid", function() {
////				//if player gets hit, restart the game
////				Crafty.scene("main");
////			});   