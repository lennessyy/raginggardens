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
 
Crafty.c("LeftControls", {
    init: function() {
        this.requires('Multiway');
    },
    
    leftControls: function(speed) {
        this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
        return this;
    }
    
}); 

/**
 * Component that initilizes player animation tweets
 */
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

/**
 * Displays shooting animation depending on player facing
 */
//Crafty.c('Shoot', {
//    _halfWidth: 16,
//    _halfHeight: 16,
//    
//    Shoot: function(px, py, pz, move) {
//        this.x = px;
//        this.y = py;
//        this.z = pz;
//        
//        if (move.left && move.up) {
//            this._anim = 'shot_nwse';
//        } else if (move.left && move.down) {
//            this._anim = 'shot_nesw';
//        } else if (move.right && move.up) {
//            this._anim = 'shot_nesw';
//        } else if (move.right && move.down) {
//            this._anim = 'shot_nwse';
//        } else if (move.up || move.down) {
//            this._anim = 'shot_ns';
//        } else if (move.left || move.right) {
//            this._anim = 'shot_ew';
//        }
//        
//        //console.log(this._anim + ' ' + move);
//        
//        var eShot = Crafty.e("2D, Canvas, " +  this._anim  + ", RealDelay")
//        .attr({z: this.z - 1, x: this.x + 24 - 16, y: this.y + 24 - 16})
//        .realDelay(function() {
//            //this._parent.detach(this);  // doesn't work :(
//            this.destroy();
//        }, 70);    
//        
//        return this;
//    },
//    init: function () {
//        this.requires("RealDelay");
//         
//    }    
//});

/**
 * Creates and handles all Player properties and actions - appearance, movement, score.
 */
Player = ActorObject.extend({
    defaults: {
        // references
        'tileMap': undefined,
        
        // behavior
        'speed': 2,
        'pullSpeed': 2,
        
        // gfx properties
        'animSpeed': 5,
        'spriteHeight': 48,
        'z-index': 10,
        
        // scores
        'carrotsCount': 0,
        'killsCount': 0
    },
    initialize: function() {
    	var model = this;
        
        model.set('sprite-z', model.get('spriteHeight') + model.get('z-index'));
        var keyState = {none: 0, down: 1, up: 2};
        
        // generate player position
        var spawnPos = model.get('tileMap').spawnAtCentre();
            
        // init player entity
    	var entity = Crafty.e("2D, Canvas, Dude, player, LeftControls")
        .attr({
            move: {left: false, right: false, up: false, down: false},
            digCarrot: {canPull: false, obj: undefined},
            pullBars: {red: undefined, green: undefined},
            actions: {action1: keyState.none, action2: keyState.none},
            x: spawnPos.x, y: spawnPos.y, z: model.get('sprite-z'),
            speed: model.get('speed')
        })
        .Dude()
        // movement
        .bind("KeyDown", function(e) {
    		if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
				this.move.right = true;
			} else if(e.keyCode === Crafty.keys.LEFT_ARROW) {
				this.move.left = true;
			} else if(e.keyCode === Crafty.keys.UP_ARROW) {
				this.move.up = true;            
			} else if(e.keyCode === Crafty.keys.DOWN_ARROW) { 
                this.move.down = true;
			} else if (e.keyCode === Crafty.keys.Z) {
                this.actions.action1 = keyState.down;
			}
            
            //this.preventTypeaheadFind(e);
        })
    	.bind("KeyUp", function(e) {
        	if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
				this.move.right = false;
			} else if(e.keyCode === Crafty.keys.LEFT_ARROW) {
				this.move.left = false;
			} else if(e.keyCode === Crafty.keys.UP_ARROW) {
				this.move.up = false;            
			} else if(e.keyCode === Crafty.keys.DOWN_ARROW) { 
                this.move.down = false;
    	    } else if (e.keyCode === Crafty.keys.Z) {
                this.actions.action1 = keyState.up;
			}            
            
            //this.preventTypeaheadFind(e);
    	})
        // updates
    	.bind("EnterFrame", function() {
            
            var oldx = this.x;
            var oldy = this.y;
            var moving = this.move.up || this.move.down || this.move.left || this.move.right;

			if (this.move.up) {
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
            
            // --- determine which animation to show depending on the angle of movement
            
            if (moving) {
                if (this.move.left) {
                    if (!this.isPlaying("walk_left"))
                        this.stop().animate("walk_left", model.get('animSpeed'), -1);
                } else if (this.move.right) {
                    if (!this.isPlaying("walk_right"))
                        this.stop().animate("walk_right", model.get('animSpeed'), -1);
                } else if (this.move.up) {
                    if (!this.isPlaying("walk_up"))
                        this.stop().animate("walk_up", model.get('animSpeed'), -1);
                } else if (this.move.down) {
                    if (!this.isPlaying("walk_down"))
                        this.stop().animate("walk_down", model.get('animSpeed'), -1);
                }
            } else {
                this.stop();
            }
            
            // --- Pull ---
            
            if (this.digCarrot.canPull) {
                if (this.actions.action1 === keyState.down) {
                    // this.actions.action1 = keyState.none; // reset
                    this.digCarrot.obj.health -= model.get('pullSpeed');
                    this.trigger("UpdatePullBar", this.digCarrot.obj.health);
                    
                    if (_Globals.conf.get('debug'))
                        console.log('Player: extracting ...' + this.digCarrot.obj.health);
                    
                    // if pulled, simply destroy entity, the hit check should determine if we
                    // are about to pull another one or not
                    if (this.digCarrot.obj.health <= 0) {
                        model.set('carrotsCount', model.get('carrotsCount') + 1);
                        this.digCarrot.obj.destroy();
                        this.trigger('HidePullBar');
                    }
                }
            }            
            
            // --- check for collisions --- 
            
            if (this.hit('Layer2Tile') || this._x > Crafty.viewport.width || this._x < -64
                || this._y > Crafty.viewport.height || this._y < -64) {
                    
                if (_Globals.conf.get('trace'))
                    console.log("Player: Hit object or wall");
                
                this.attr({x: oldx, y: oldy});
                return;
            }
            
            // nearby carrot -> rise extracting flag
            var hits = this.hit('carrot');
            if (hits) {
                if (!this.digCarrot.canPull) {
                    // we are pulling the first found
                    this.digCarrot.canPull = true;
                    this.digCarrot.obj = hits[0].obj;
                    this.trigger('ShowPullBar', this.digCarrot.obj);
                }
            } else if (this.digCarrot.canPull) {
                this.digCarrot.canPull = false;
                this.digCarrot.obj = undefined;
                this.trigger('HidePullBar');
            }
            
            // determine sprite Z-index
            this.attr({z: this.y + model.get('sprite-z')});
    	})
        // show bar with how much effort there is to pull a carrot (carrot's health)
        .bind("ShowPullBar", function(carrotObj) {
            this.pullBars.red = Crafty.e("2D, Canvas, Color")
                .attr({x: carrotObj.x, y: carrotObj.y - 5, w: 32, h: 5, z: 998})
                .color("#aa0000");
            
            this.pullBars.green = Crafty.e("2D, Canvas, Color")
                .attr({x: carrotObj.x, y: carrotObj.y - 5, w: 32, h: 5, z: 999})
                .color("#00aa00");            
        })     
        .bind("HidePullBar", function(health) {
            if (this.pullBars.red) {
                this.pullBars.red.destroy();
                this.pullBars.red = undefined;
            }
            if (this.pullBars.green) {
                this.pullBars.green.destroy();
                this.pullBars.green = undefined;
            }
        })   
        .bind("UpdatePullBar", function(health) {
            if (this.pullBars.green && health >= 0) {
                this.pullBars.green.w = 0.32 * health;
            }
        })          
        // define player collision properties
        .collision(
            [8, 40], 
            [24, 40], 
            [24, 48], 
            [8, 48]
        );
        
        // bind to object
    	model.set({'entity' : entity });
    }
});
