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
Player = ActorObject.extend({
    defaults: {
        'speed' : 2,
    },
    initialize: function() {
    	var model = this;
    	var entity = Crafty.e("2D, Canvas, ship, Controls, Collision")
		
        .attr({move: {left: false, right: false, up: false, down: false}, xspeed: 0, yspeed: 0, 
            decay: 0.9, x: Crafty.viewport.width / 2, y: Crafty.viewport.height / 2, score: 0})
		
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

//    	entity
//            .attr({x: ((Crafty.viewport.width/2) - (entity.w/2)), y: 0, z: 300})
//            .collision(new Crafty.polygon([21,63],[40,55],[59,52],[71,52],[74,39],[83,24],[102,13],[117,13],[119,13],[136,24],[147,37],[151,51],[174,54],[190,58],[195,62],[200,68],[196,78],[180,85],[148,91],[102,92],[70,91],[46,86],[24,80],[17,68],[18,64]))
//            .multiway(model.get('speed'), {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
//            .bind('EnterFrame', function(e){
//
//            })
//            .bind('Click', function(){
//                
//            })
//            .setName('Ufo');
//
//            entity.origin(entity.w/2, entity.h/2);

    	model.set({'entity' : entity });
    }
});