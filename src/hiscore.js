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
 
Hiscore = Backbone.Model.extend({
    defaults: {
        // references
        'storageName': 'RGGame_dc32000e-afd6-481e-8807-4dd838f2d922',
        'version': 1,
        'storageTable': 'hiscore',
        'maxScores': 3,
    },
    // storage init
    initialize: function() {
        //window.shimIndexedDB && window.shimIndexedDB.__useShim();
        
    },
    open: function(fnCallback) {
        //var model = this;
        
        db.open({
            server: this.get('storageName'),
            version: this.get('version'),
            schema: {
                hiscore: {
                    key: {
                        keyPath: 'id',
                        autoIncrement: true
                    }
                }
            }
            
        })
        .done(function(server) {
            if (fnCallback) {
                // console.log('DB server opened.');
                //model.set('server', server);
                if (fnCallback)
                    fnCallback(server);
            }
        });        
    },
    // save score for given person
    saveScore: function(who, score, fnCallback) {
        var model = this;
        this.open(function(server) {
            
            server.add(model.get('storageTable'), {
                name: who,
                score: parseInt(score)
            })
            .done(function(res) {
                server.close();
                
                if (fnCallback)
                    fnCallback(res);
            });

        });
    },
    // get an array list of all scores
    getAllScoresRaw: function(fnCallback) {
        var model = this;
        this.open(function(server) {
            
            server.query(model.get('storageTable'))
            .all()
            .execute()
            .done(function(results) {
                if (fnCallback) {
                    fnCallback(results, server);
                } else {
                    server.close();
                }
            });

        });        
    },
    // get sorted list of top 3 scores 
    getAllScores: function(fnCallback) {
        this.getAllScoresRaw(function(scores, server) {
            var sortedScores = new Backbone.Collection;
            
            sortedScores.comparator = function(obj1, obj2) {
                return obj1.get('score') < obj2.get('score');
            };
            
            _.each(scores, function(obj) {
                sortedScores.add({'name': obj.name, 'score': obj.score});    
            });
            
            if (fnCallback) {
                fnCallback(sortedScores, server);
            }
        });
    },
    // remove all scores
    removeAllScores: function(fnCallback) {
        var model = this;
        this.getAllScoresRaw(function(scores, server) {
            
            //this.open(function(server) {
//                console.log('shall remove ' + scores.length);
                for (var i = 0; i < scores.length; i++) {
//                    console.log('removing');
//                    console.log(scores[i]);
                    server.remove(model.get('storageTable'), scores[i].id)
                    .done(function(key) {
                        // bla
                    });
                }               
//                server.close();
//                
                if (fnCallback) {
                    fnCallback(server);
                } else {
                    server.close();
                }
            //});
        });                
    },
    // close DB connection
    close: function(server) {
        server = server || model.get('server');
        if (server) {
            server.close();
        }
    }
});