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
 
var Hiscore = Backbone.Model.extend({
    defaults: {},
    initialize: function() {
        // Leer
    },
    open: function(fnCallback) {
        if (!GJAPI || !GJAPI.bActive) {
            console.error('Gamejolt login not active!');
        } else {
            console.log('Gamejolt user ' + GJAPI.sUserName);
        }
    },
    // save score for given person directly to DB
    save: function(wscore, fnCallback) {
        if (GJAPI && GJAPI.bActive) {
            GJAPI.ScoreAdd(_Globals.conf.get('tid'), wscore, wscore + ' carrots', '', function (pResponse) {
                if (pResponse && !!!pResponse.success) {
                    console.error('Error writing score!', pResponse.message);
                    fnCallback && fnCallback(null);
                } else {
                    fnCallback && fnCallback(true);
                }
            });
        } else {
            fnCallback && fnCallback(null);
        }
    },
    // get sorted list of top scores 
    getAllScores: function(fnCallback) {
        var results = [];
        if (GJAPI && GJAPI.bActive) {
            GJAPI.ScoreFetch(_Globals.conf.get('tid'), GJAPI.SCORE_ALL, 50, function (pResponse) {
                if (pResponse && !!!pResponse.success) {
                    console.error('Error fetching scores!', pResponse.message);
                    fnCallback && fnCallback(null);
                } else {
                    for(var i = 0; i < pResponse.scores.length; i++) {
                        var entry = pResponse.scores[i];
                        results.push({
                            name: (entry.user ? entry.user : entry.guest), 
                            score: entry.score
                        });
                    }
                    fnCallback && fnCallback(results);
                }
            });
        } else {
            fnCallback && fnCallback(null);    
        }
    }
});


// Show Hiscore Dialog - View/Reset scores
Crafty.bind("ShowSaveHiscore", function(score) {
    // show dialog
    $("#dialog-save-score").dialog({
        resizable: false,
        "width": 400,
        "height": 300,
        modal: false,
        "title": "Save Hiscore",
        zIndex: 20,
        buttons: {
            "Yes": function() {
                 hiscore.save(score, function (success) {
                    if (success) {
                        Crafty.trigger('ShowHiscore', {
                            text: undefined, 
                            refresh: true
                        });
                    } else {
                        Crafty.trigger('ShowHiscore', {
                            text: 'Failed saving your score! Sorry :(', refresh: true
                        });
                    }
                });
                $(this).dialog("close");
            },
            "No": function() {
                $(this).dialog("close");
                Crafty.trigger('ShowHiscore', {text: undefined, refresh: true});
            }            
        },
    });
});

// Show Hiscore Dialog - View/Reset scores
Crafty.bind("ShowHiscore", function(params) {
    $("#dialog-score").dialog({
        resizable: false,
        width: 400,
        minHeight: 520,
        height: 520,
        modal: true,
        position: 'top',
        "title": "Top 50 Scores",
        open: function() {
             $("#dialog-score").css({'height': '520px'});
            if (!params.text) {
                $("#dialog-score").html('<p>Please wait while loading scores ...</p>');
                var hiscore = _Globals['hiscore'];
//                hiscore.open();
                
                // load scores
                //var text = '<div style="position: absolute; top: 0; left: 0;">';
                var text = '<div>';
                text += '<span class="name u">';
                text += 'Name';
                text += '</span>';
                text += '<span class="score u">';
                text += 'Carrots';
                text += '</span>';
                text += '</div>';            
                hiscore.getAllScores(function(scores, server) {
                    // on error
                    if (!scores) {
                        text += '<div>';
                        text += '<span class="name">';
                        text += 'Failed loading scores!';
                        text += '</span>';
                        text += '<span class="score">';
                        text += '</span>';
                        text += '</div>';
                    } else {
                        _.each(scores, function(obj, i) {
                            if (++i > 50) {
                                return;
                            }
                            text += '<div>';
                            text += '<span class="name">';
                            text += i + '. ';
                            text += obj.name;
                            text += '</span>';
                            text += '<span class="score">';
                            text += obj.score;
                            text += '</span>';
                            text += '</div>';
                            
                        });
                        //text += '</div>';
                    }
                    $("#dialog-score").html(text);
                    //Crafty.trigger("ShowHiscore", {text: text, refresh: params.refresh});
                });
                return;
            } else {
                $("#dialog-score").html(params.text);
            }  
        },
        buttons: {
            "Refresh Scores": function() {
                $(this).dialog("close");
                Crafty.trigger('ShowHiscore', params);
            },
            "Let me out!": function() {
                if (params.refresh) {
                    // TODO: Cheap! :( Must replace with proper restart.
                    window.location.reload();
                }                
                $(this).dialog("close");
            }
        },
        close: function(event, ui) {
//            if (params.refresh) {
//                // TODO: Cheap! :( Must replace with proper restart.
//                window.location.reload() 
//            }
        }
    });
    
});
