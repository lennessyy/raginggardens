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
 
Tilemap = ActorObject.extend({
    defaults: {
        // pixel size
        'pxWidth' : _Globals.conf.get('screen-width'),
        'pxHeight' : _Globals.conf.get('screen-height'),   
        
        // tilemap width & height
        'tileSize' : 64,
        'width' : _Globals.conf.get('screen-width') / 64,
        'height' : _Globals.conf.get('screen-height') / 64,
        'spawnArea': undefined,
        'base-z' : 10,
        'maxObstacles' : 5,
        
        // Carrots 
        'carrotHeightOffset': 16,
        'maxCarrots' : 2,
        'carrotHealth': 100,
        'currentCarrots' : 0,
        'carrotSpawnTime' : 2000,
        
        // globals
        obstaclesMap: undefined,
    },
    initialize: function() {
        var model = this;
        
        // items spawning area
        model.set('spawnArea', {
            top: 1, 
            left: 1, 
            right: model.get('width') - 1,
            bottom: model.get('height') - 1
        });
        model.set('spawnAreaPx', {
            top: model.get('tileSize') * model.get('spawnArea').top, 
            left: model.get('tileSize') * model.get('spawnArea').left, 
            right: model.get('tileSize') * model.get('spawnArea').right,
            bottom: model.get('tileSize') * model.get('spawnArea').bottom
        });        
        
        // generate layer #1 - ground tiles
        for (var i = 0; i < model.get('width'); i++) {
            for (var j = 0; j < model.get('height'); j++) {
                var entity = Crafty.e("2D, Canvas, grass")
                .attr({x: i * model.get('tileSize'), y: j * model.get('tileSize'), z: 0});
            }
        }
        
        // generate layer #2 - obstacles
        var obstaclesCoords = [];
        
        for (var i = 0; i < model.get('maxObstacles'); i++) {
            var type = Crafty.math.randomInt(1, 4);
            var occupiedTile = false;
            var ox;
            var oy;
            var oz;
            var spriteName = '';
            
            do {
                ox = Crafty.math.randomInt(model.get('spawnArea').left, model.get('spawnArea').right);
                oy = Crafty.math.randomInt(model.get('spawnArea').top, model.get('spawnArea').bottom);
                occupiedTile = _.size(_.where(obstaclesCoords, {x: ox, y: oy})) > 0;
                
                if (_Globals.conf.get('debug') && occupiedTile)
                    console.log("Calculate new obstalce position for " + i);
                
            } while (occupiedTile);
            
            // save into tile map
            obstaclesCoords.push({x: ox, y: oy});
            
            // get absolute position
            ox *= model.get('tileSize');
            oy *= model.get('tileSize');
            
            if (type == 1) { // small stone
                spriteName = 'stone_small';
                oz = model.get('base-z') + oy + model.get('tileSize') - 16;
            } else if (type == 2) {
                spriteName = 'stone_big';
                oz = model.get('base-z') + oy + model.get('tileSize') - 8;
            } else if (type == 3) {
                spriteName = 'tree';
                oz = model.get('base-z') + oy + model.get('tileSize');
            } else if (type == 4) {
                spriteName = 'barrel_small';
                oz = model.get('base-z') + oy + model.get('tileSize') - 16;
//            } else if (type == 5) {
//                spriteName = 'barrel_big';
            } else {
                continue;
            }
            
             var entity = Crafty.e("2D, Canvas, " + spriteName + ", Collision")
                .attr({x: ox, y: oy, z: oz});
                
            if (type == 1) { // stone_small
                entity.collision(
                    [16, 40], 
                    [48, 40], 
                    [48, 48], 
                    [16, 48]
                );
            } else if (type == 2) { // stone_big
                entity.collision(
                    [16, 40], 
                    [48, 40], 
                    [48, 48], 
                    [16, 48]
                );                       
            } else if (type == 3) { // tree
                entity.collision(
                    [12, 52], 
                    [56, 52], 
                    [56, 64], 
                    [12, 64]
                );                 
            } else if (type == 4) { // barrel_small
                entity.collision(
                    [16, 40], 
                    [48, 40], 
                    [48, 48], 
                    [16, 48]
                );                      
            }
        }
        
        // set into local var
        model.set('obstaclesMap', obstaclesCoords);
    },
    // Spawn new carrot only if maximum is not reached
    spawnCarrot: function() {
        if (Crafty("carrot").length < this.get('maxCarrots')) {
            
            var ox = Crafty.math.randomInt(this.get('spawnArea').left, this.get('spawnArea').right);
            var oy = Crafty.math.randomInt(this.get('spawnArea').top, this.get('spawnArea').bottom);
            var pos = this.spawnAt(ox, oy);
            
            var oz = this.get('base-z') + 24 + pos.y + 1;
                    
            Crafty.e("2D, Canvas, carrot, SpriteAnimation, Collision")
                .attr({
                    x: pos.x, y: pos.y, z: oz, 
                    health: this.get('carrotHealth'),
                    occupied: false,
                })
                .animate('wind', 0, 0, 3) // setup animation
                .animate('wind', 15, -1); // play animation
        }
    },
    // get unoccupied map position given start coordinates
    spawnAt: function(startX, startY) {
        
        var cx = startX,
            cy = startY;
            
        var occupiedTile = false;
        var nextX = [1, 0, -1, 0];
        var nextY = [0, 1, 0, -1];
        var i = 0, m = 1;
        
        do {
            occupiedTile = _.size(_.where(this.get('obstaclesMap'), {x: cx, y: cy})) > 0;
                
            if (occupiedTile) {
                // nadebugvaj gooo ....
                if (_Globals.conf.get('trace'))
                    console.log("spawnAt: Cannot spawn at " + cx + "," + cy);
                    
                cx = startX + nextX[i] * m;
                cy = startY + nextY[i] * m;
                
                if ( ++i > 3 ) {
                    i = 0;
                    m++; 
                }
            }
                
        } while (occupiedTile);
        
        return {x: cx * this.get('tileSize'), y: cy * this.get('tileSize')};
    }, 
    // try to spawn coords at the central tile map position
    spawnAtCentre: function() {
        return this.spawnAt(
            this.get('width') * 0.5, 
            this.get('height') * 0.5);
    },
    // try to spawn coords at random free position
    spawnAtCentre: function() {
        return this.spawnAt(
            this.get('width') * 0.5, 
            this.get('height') * 0.5);
    },    
    // spawn (enemy) object at an edge of the map 
    spawnRelativeToCarrot: function() {
        var obj = this.findFreeCarrot();
        if (obj != undefined) {
            var sx, sy;
            var dxl = obj.x - this.get('spawnAreaPx').left;
            var dxr = this.get('spawnAreaPx').right - obj.x;
            
            // get random X position
            if (dxl < dxr) {
                sx = Crafty.math.randomInt(0, this.get('spawnArea').left);
            } else {
                sx = Crafty.math.randomInt(this.get('spawnArea').right, this.get('spawnArea').right + 2);
            }
            
            // get random Y position
            var dyt = obj.y - this.get('spawnAreaPx').top;
            var dyb = this.get('spawnAreaPx').bottom - obj.y;
            
            if (dyt < dyb) {
                sy = Crafty.math.randomInt(0, this.get('spawnArea').top);
            } else {
                sy = Crafty.math.randomInt(this.get('spawnArea').bottom, this.get('spawnArea').bottom + 2);
            }
            
            // console.log("dxl,dxr " + dxl + " " + dxr);
            // console.log("dyt,dyb " + dyt + " " + dyb);
            
            sx *= this.get('tileSize');
            sy *= this.get('tileSize');
            
            //if (_Globals.conf.get('debug'))
            //    console.log("Spawning close to carrot at: " + sx + "," + sy);                
                
            return {x: sx, y: sy, targetX: obj.x, targetY: obj.y};
        }
        
        // return undefined;
    },
    // get non-occupied carrot entity
    findFreeCarrot: function() {
        var carrotsArray = _.shuffle(Crafty("carrot"));  
        var ret = _.find(carrotsArray, function(carrotObj) { 
            var obj = Crafty(carrotObj);
            return (obj != undefined) && (!obj.occupied);
        });
        
        if (ret != undefined)
            return Crafty(ret);
    }
});
 