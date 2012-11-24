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
    //target: {x: undefined, y: undefined, obj: undefined},
    tileMap: undefined,
    
    Enemy: function(tileMap) {
        //setup animations
        this.requires("SpriteAnimation, Collision, Grid")
        .animate("walk_left", [ [0, 96], [32, 96], [64, 96] ])
        .animate("walk_right", [ [0, 144], [32, 144], [64, 144] ])
        .animate("walk_up", [ [0, 48], [32, 48], [64, 48] ])
        .animate("walk_down", [ [0, 0], [32, 0], [64, 0] ]);
        
        this.tileMap = tileMap;
        
        // generate player position
        var spawnPos = this.tileMap.spawnRelativeToCarrot();
        if (!spawnPos) {
            // TRACE
            if (_Globals.conf.get('trace'))
                console.log('Enemy: Spawn failed, No carrots! Spawning @random.');
                
            spawnPos = this.tileMap.spawnRelativeTo(0, 0);
            this.attr({x: spawnPos.x, y: spawnPos.y});
            this.newTarget(true);
        } else {
            this.attr({x: spawnPos.origin.x, y: spawnPos.origin.y});
            this.target.x = spawnPos.target.x;
            this.target.y = spawnPos.target.y;
        }        
        
        return this;
    },
    init: function() {
        this.requires("2D Canvas");
        this.target = {x: undefined, y: undefined, obj: undefined};
        this.digCarrot = {canPull: false, obj: undefined};
        this.pushedProps = {pushed: false, atFrame: 0};

    },
    // get new target/carrot position or go to random location of no targets exist
    newTarget: function(anywhere) {
        if (!anywhere) {
            var newObj = this.tileMap.findFreeCarrot();
            if (newObj) {
                // TRACE
                if (_Globals.conf.get('trace')) {
                    console.log('Enemy:' + this[0] + ' new target coords ' + newObj[0] 
                    + ' XY:' + newObj.x + ',' + newObj.y + ' occ: ' + newObj.occupied);
                }
                this.target.x = newObj.x;
                // fix Y pos to allow for proper distance calculation
                this.target.y = newObj.y - this.tileMap.get('carrotHeightOffset');
                this.target.obj = newObj;     
            } else {
                // no carrots, so choose a random place to go
                anywhere = true; 
            }
        }
        
        if (anywhere) {
            var newPos = this.tileMap.spawnAtRandom();
            this.target.x = newPos.x;
            this.target.y = newPos.y;
            this.target.obj = undefined;                
        }
        // reset pulling
        if (this.digCarrot.canPull) {
            this.digCarrot.canPull = false;
            this.digCarrot.obj.occupied = false;
            this.digCarrot.obj = undefined;
        }
        
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
        'pushCooldown': 30,
        
        // gfx properties
        'animSpeed': 5,
        'spriteHeight': 48,
        'z-index': 10,
    },
    initialize: function() {
        var model = this;
        
        if (Crafty("enemy").length > 12) {
            return;
        }
        
        model.set('sprite-z', model.get('spriteHeight') + model.get('z-index'));
        
        // init player entity
        var entity = Crafty.e("2D, Canvas, Enemy, enemy")
        .attr({
            move: {left: false, right: false, up: false, down: false},
            z: model.get('sprite-z'), speed: model.get('speed')
        })
        .Enemy(model.get('tileMap'))
        // updates
    	.bind("EnterFrame", function(frame) {
            
            if (this.pushedProps.pushed) {
                if (!this.pushedProps.atFrame) {
                    this.pushedProps.atFrame = frame.frame + model.get('pushCooldown');
                    return;
                }
                if (this.pushedProps.atFrame > frame.frame) {
                    return;
                }
                console.log('ahaha' + frame.frame);
                this.newTarget();
                this.pushedProps.pushed = false;
            }
            
            // --- Pull ---
            
            if (this.digCarrot.canPull) {
                this.stop();
                this.digCarrot.obj.health -= model.get('pullSpeed');
                    
//                if (_Globals.conf.get('debug'))
//                    console.log('extracting ...' + this.digCarrot.obj.health);
                    
                // if pulled, simply destroy entity, the hit check should determine if we
                // are about to pull another one or not
                if (this.digCarrot.obj.health <= 0) {
                    this.digCarrot.canPull = false;
                    this.digCarrot.obj.destroy();
                    this.newTarget();
                }
                return;
            }             
            
            // --- Move ---
            //console.log(this.id + " XY: " + this.x + "," + this.y);
            this.move.up = this.move.down = this.move.left = this.move.right = false;
                
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
            
            // --- Animate ---
            
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
            
            // --- Collisions  --- 
            
            var tileHits = this.hit('Layer2Tile');
            if (tileHits) {
                // go around
                var ox = tileHits[0].obj.x;
                var oy = tileHits[0].obj.y;
                
                var newX = oldx, newY = oldy;
                if (this.move.left || this.move.right) {
                    newY = this.y + (this.y < oy ? -1 : 1);
                }
                else if (this.move.up || this.move.down) {
                    newX = this.x + (this.x < ox ? -1 : 1);
                }
                
                //console.log('setting x:' + newX + ' y: ' + newY);
                this.attr({x: newX, y: newY});
                return;
            }
            
//            if (this._x > Crafty.viewport.width || this._x < -32
//            || this._y > Crafty.viewport.height || this._y < -32) {
//                
//            }

            // determine sprite Z-index 
            this.attr({z: this.y + model.get('sprite-z')});
            
            // --- Target ---
            
            // nearby carrot -> rise extracting flag
            var dx = this.x - this.target.x;
            var dy = this.y - this.target.y;
            var dist = (dx * dx + dy * dy);
            
            if (dist < 16) {
                var hits = this.hit('carrot');
                
                // check if we actually are on a carrot
                if (!hits) {
                    this.newTarget();
                    return;
                }
                    
                // we are pulling the first found
                var obj = hits[0].obj;
                
                // TRACE
                if (_Globals.conf.get('trace'))
                    console.log('Enemy: ' + this[0] + ' has reached ' + obj[0]);
                
                if (obj.occupied) {
                    this.newTarget();
                } else {
                    
                    // TRACE
                    if (_Globals.conf.get('trace'))
                        console.log("Enemy: carrot " + obj[0] + " hit & occupied!");
                        
                    obj.occupied = true;
                    this.digCarrot.obj = obj;
                    this.digCarrot.canPull = true;
                }
            } else {
                this.digCarrot.canPull = false;
                this.digCarrot.obj = undefined;
            }
    	})
        // Push back effect when player uses Push magic
        .bind("PushBack", function(playerPos) {
            
            // TRAC
            if (_Globals.conf.get('trace'))
                console.log("Enemy: %d is pushed back", this[0]);
            
            var newX = this.x;
            var newY = this.y;
            var amount = playerPos.amount;
            
            if (this.move.up && playerPos.y < this.y) {
                newY += amount;
            } else if (this.move.up && playerPos.y > this.y) {
                newY -= amount;
            } else if (this.move.down && playerPos.y < this.y) {
                newY += amount;
            } else if (this.move.down && playerPos.y > this.y) {
                newY -= amount;
            }
            
            if (this.move.left && playerPos.x < this.x) {
                newX += amount;
            } else if (this.move.left && playerPos.x > this.x) {
                newX -= amount;
            } if (this.move.right && playerPos.x < this.x) {
                newX += amount;
            } if (this.move.right && playerPos.x > this.x) {
                newX -= amount;
            }

            var newPos = this.tileMap.spawnAtPx(newX, newY);
            this.attr({x: newPos.x, y: newPos.y});
            
            // flag that pushed occured
            this.pushedProps.pushed = true;
            this.pushedProps.atFrame = undefined; //Crafty.frame.frame + model.get('pushCooldown');
            this.stop();
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