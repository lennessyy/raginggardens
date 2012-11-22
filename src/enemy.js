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
 
/**
 * Component that initilizes player animation tweets
 */
Crafty.c('Enemy', {
    Enemy: function() {
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
 * Creates and handles all Enemy actions and attributes
 */
Enemy = ActorObject.extend({
    defaults: {
        // references
        'tileMap': undefined,
        
        // behavior
        'speed': 2,
        'pullSpeed': 1,
        
        // gfx properties
        'animSpeed': 5,
        'spriteHeight': 48,
        'z-index': 10,
        
    },
    initialize: function() {
        var model = this;
        
        if (Crafty("enemy").length > 15) {
            return;
        }
        
        model.set('sprite-z', model.get('spriteHeight') + model.get('z-index'));
        
        // generate player position
        var spawnPos = model.get('tileMap').spawnRelativeToCarrot();
        if (spawnPos == undefined) {
            console.log("Cannot spawn, no carrots!");
            return;
        }
            
        // init player entity
        var entity = Crafty.e("2D, Canvas, Enemy, enemy")
        .attr({
            move: {left: false, right: false, up: false, down: false},
            digCarrot: {canPull: false, obj: undefined },
            target: {x: spawnPos.targetX, y: spawnPos.targetY},
            //actions: {action1: keyState.none, action2: keyState.none},
            x: spawnPos.x, y: spawnPos.y, z: model.get('sprite-z'),
            speed: model.get('speed')
        })
        .Enemy()
        // updates
    	.bind("EnterFrame", function() {
            
            // see if we need to move
            var dx = this.x - this.target.x;
            var dy = this.y + 24 - this.target.y;
            if ((dx * dx + dy * dy) > 64) {
                if (this.x < this.target.x) {
                    this.move.right = true;
                } else if (this.x > this.target.x) {
                    this.move.left = true;
                }
                
                if (this.y < this.target.y) {
                    this.move.down = true;
                } else if (this.y > this.target.y) {
                    this.move.up = true;
                }
            } else {
                return;
            }
            // ---
            
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
            
            this.move.up = this.move.down = this.move.left = this.move.right = false;
            
            // --- Pull ---
            
//            if (this.digCarrot.canPull) {
//                if (this.actions.action1 === keyState.up) {
//                    this.actions.action1 = keyState.none; // reset
//                    this.digCarrot.obj.health -= model.get('pullSpeed');
//                    
//                    if (_Globals.conf.get('debug'))
//                        console.log('extracting ...' + this.digCarrot.obj.health);
//                    
//                    // if pulled, simply destroy entity, the hit check should determine if we
//                    // are about to pull another one or not
//                    if (this.digCarrot.obj.health <= 0) {
//                        model.set('carrotsCount', model.get('carrotsCount') + 1);
//                        this.digCarrot.obj.destroy();
//                    }
//                }
//            }            
            
            // --- check for collisions --- 
            if (this.hit('stone_small') || this.hit('tree') 
            || this.hit('barrel_small') || this.hit('stone_big'))  {
                this.attr({x: oldx, y: oldy + 2});
                return;
            }
            
//            if (this._x > Crafty.viewport.width || this._x < -32
//            || this._y > Crafty.viewport.height || this._y < -32) {
//                
//            }
            
            // nearby carrot -> rise extracting flag
            var hits = this.hit('carrot');
            if (hits) {
                // we are pulling the first found
                this.digCarrot.canPull = true;
                this.digCarrot.obj = hits[0].obj;
            } else {
                this.digCarrot.canPull = false;
                this.digCarrot.obj = undefined;
            }
            
            // determine sprite Z-index
            this.attr({z: this.y + model.get('sprite-z')});
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