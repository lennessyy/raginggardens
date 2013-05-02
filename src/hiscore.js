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
 * 
 */
Hiscore = Backbone.Model.extend({
    defaults: {
    },
    // storage init
    initialize: function() {
       // window.shimIndexedDB && window.shimIndexedDB.__useShim();
    },
    open: function(fnCallback) {
    	var model = this;
    	var leaderboard = new Clay.Leaderboard( { id: 1213, limit: 50 } );
    	model.set('lb', leaderboard);
    },
    // save score for given person directly to DB
    save: function(who, wscore, fnCallback) {
        var model = this;
        
        // ... I know you can, but please don't :(
		var options = {
			name: who,    
			score: wscore,
//			hideUI: true
		};
		model.get('lb').post(options, function(response) {
		    // Callback
           if (fnCallback)  {
               console.log(response);
               if (response.success) {
                   fnCallback(true);
               } else {
                   fnCallback(null);
               }
           }		    
		});        
        
//        var userScore = {};
//        userScore.Name = who;
//        userScore.Points = score;
    
//        // submit to the highest-is-best table "highscores"
//        Playtomic.Leaderboards.Save(userScore, model.get('board'), function(response) {
//           if (fnCallback)  {
//               console.log(response);
//               if (response.Success) {
//                   fnCallback(true);
//               } else {
//                   fnCallback(null);
//               }
//           }
//        },
//        {allowduplicates: true}
//        ); 
    },
    // get sorted list of top scores 
    getAllScores: function(fnCallback) {
        var model = this;
        
        var leaderboard = model.get('lb');
        
        leaderboard.fetch({}, function(results) {
        	console.log(results);
            if(results && results.length > 0) {
                // send back
                if (fnCallback) {
                    var result = [];
                    for(var i=0; i < results.length; i++) {
                        var score = results[i];
                        result.push({name: score.name, score: score.score });
                    }
                    
                    fnCallback(result);
                }
            } else {
                // score listing failed because of response.ErrorCode
                if (_Globals.conf.get('debug')) {
                    console.log("Load scores failed!");
                    console.log(response);
                }
                // flag that something went wrong
                if (fnCallback) {
                    fnCallback(null);
                }
            }
        }); // end List
    },
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
                while(true) {
                    var name = prompt("Please enter your rabbit name (Maximum 10 characters)", "");
                    if (name != null && name.trim() != "") {
                        var hiscore = _Globals['hiscore'];
                        //hiscore.open();

                        name = name.replace(/<(?:.|\n)*?>/gm, '');
                        name = name.substr(0, 10);
                        
                        //$("#dialog-save-score").html('<p>Please wait while saving your score ...</p>');
                        
                        hiscore.save(name, score, function(success) {
                            if (success) {
                                Crafty.trigger('ShowHiscore', {text: undefined, refresh: true});
                            } else {
                                Crafty.trigger('ShowHiscore', {text: 'Failed saving your score! Sorry :(', refresh: true});
                            }
                        }); 
                        
                        break;
                    } else if (name === null) {
                        window.location.reload();
                        break;
                    }
                }
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
    //console.log(params);
    
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
                    var i = 0;
                    _.each(scores, function(obj) {
                        if (++i > 50)
                            return;
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
