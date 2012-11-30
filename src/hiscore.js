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
 * Save hi-scores into localstorage (IndexedDB or WebSQL)
 *
 * TODO: Needs reworking, as db.open() is called too frequently!
 * And also - this Async. impl sucks :(
 */
Hiscore = Backbone.Model.extend({
    defaults: {
        // references
        'storageName': 'RGGame_dc32000e-afd6-481e-8807-4dd838f2d922',
        'version': 1,
        'storageTable': 'hiscore',
        'maxScores': 6,
        'defaultScores': [ 
            {name: 'Raging Hero', score: 300}, 
            {name: 'Kage Bunshin no Jutsu', score: 201}, 
            {name: 'Now we\'re talking', score: 152}, 
            {name: 'Sucks to be you', score: 101}, 
            {name: 'Absolute looser', score: 64},         
            ],
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
    // get list of saved scores, add this score to list, remove all, sort and save again
    addScore: function(who, score, fnCallback) {
        var model = this;
        
        this.getAllScores(function(sortedScores, server) {
            sortedScores.add({'name': who, 'score': score});    
            model.removeAllScores(function() {
                // save max
                var max = model.get('maxScores');
                sortedScores.each(function(obj) {
                    if (max-- <= 0)
                        return;
                    model.saveScore(obj.get('name'), obj.get('score'));
                });            
                
                if (fnCallback)
                    fnCallback(server, sortedScores);                   
            });
        });
    },
    // save score for given person directly to DB
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
    // reset Scores
    resetScores: function(fnCallback) {
        var defaults = this.get('defaultScores');
        var model = this;
        this.removeAllScores(function(server) {
            server.close();
            
            var sortedScores = new Backbone.Collection;
            sortedScores.comparator = function(obj1, obj2) {
                return obj1.get('score') < obj2.get('score');
            };
            
            // add ew
            _.each(defaults, function(obj) {
                sortedScores.add({'name': obj.name, 'score': obj.score}); 
                model.saveScore(obj.name, obj.score);
            });
            
            if (fnCallback) {
                fnCallback(sortedScores, server);
            } else {
                server.close();
            }            
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


// Show Hiscore Dialog - View/Reset scores
Crafty.bind("ShowHiscore", function(params) {
    console.log(params);
    
    if (!params.text) {
        var hiscore = new Hiscore();
        
        // load scores
        var text = '<div>';
        text += '<span class="name">';
        text += '[Name]';
        text += '</span>';
        text += '<span class="score">';
        text += '[Carrots]';
        text += '</span>';
        text += '</div>';            
        hiscore.getAllScores(function(scores, server) {
            server.close();
            var i = 0;
            scores.each(function(obj) {
                if (++i > 6)
                    return;
                text += '<div>';
                text += '<span class="name">';
                text += obj.get('name');
                text += '</span>';
                text += '<span class="score">';
                text += obj.get('score');
                text += '</span>';
                text += '</div>';
                
            });                
            Crafty.trigger("ShowHiscore", {text: text, refresh: params.refresh});
        });
        return;
    }
    
    $("#dialog-score").html(params.text);
    // show dialog
    $("#dialog-score").dialog({
        resizable: false,
        "width": 460,
        "height": 300,
        modal: true,
        "title": "Top 6 Scores",
        buttons: {
            "Reset Scores": function() {
                // reset scores
                var hiscore = new Hiscore();
                hiscore.resetScores(function() {
                    Crafty.trigger("ShowHiscore", {text: undefined, refresh: params.refresh});    
                    $(this).dialog("close");
                });
            },
            "Let me out!": function() {
                $(this).dialog("close");
            }
        },
        close: function(event, ui) {
            if (params.refresh) {
                // TODO: Cheap! :( Must replace with proper restart.
                window.location.reload() 
            }
        }
    });
});
