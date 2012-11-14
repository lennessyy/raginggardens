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
Crafty.c('Asteroid', {
    
    Asteroid: function(type) {
    },
    
    evaluate: function(tick) {
        
       this.rotation += 5;
        
    }
});

Asteroid = ActorObject.extend({
    defaults: {
        'size' : 2,
    },
    initialize: function() {
        var model = this;
        
        var pos = {x: 50, y: 50};
        if (model.get('size') == 1) {
            var pos = {x: 150, y: 150};
        }
        
        // Init Crafty entity
    	var entity = Crafty.e("2D, Canvas, big, Controls, Collision, Asteroid")
		
        .attr({move: {left: false, right: false, up: false, down: false}, xspeed: 0, yspeed: 0, 
            decay: 0.9, x: pos.x, y: pos.y, score: 0})
		
        .origin('center')
        
        ;
        
        model.set({'entity' : entity });
    }
});
