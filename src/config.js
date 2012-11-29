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
Config = Backbone.Model.extend({
    defaults: {
        // engine 
        'trace' : false,
        'debug' : true,
        'renderType' : 'Canvas',
        'screen-width' : 1024,
        'screen-height' : 768,
        
        // media
        'sfx': true,
        'sfx_vol': 0.4,
        'music': true,
        'music_vol': 0.3,
        
        // gameplay
        'defaultCarrots': 10,
        'gameTimeLimit': 120 * 1000, // 300 * 1000, // milliseconds
        'maxEnemiesToSpawn': 10,
        'maxCarrotsToSpawn': 11,
        'carrotsCollect': 3,
        'carrotsPushCost': 1,
        'carrotsForkCost': 2,
        
    },
    initialize: function() {
       
    },
    
//    debug : function(obj) {
//        if (this.get('debug'))
//            console.log(obj);
//            //console.log('DEBUG:' + text);
//    }
});