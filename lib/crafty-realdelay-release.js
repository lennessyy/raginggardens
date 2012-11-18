/*!
* RealDelay Component for CraftyJS
* https://github.com/hugeen/Crafty-RealDelay-component
*
* Copyright 2012 by hugeen.
* Licensed under the MIT license.
*/
Crafty.c("RealDelay",{init:function(){this._realDelays=[];this.bind("EnterFrame",function(){var b=new Date().getTime();for(var a in this._realDelays){var c=this._realDelays[a];if(!c.triggered&&c.start+c.delay+c.pause<b){c.triggered=true;c.func.call(this)}}});this.bind("Pause",function(){var b=new Date().getTime();for(var a in this._realDelays){var c=this._realDelays[a];c.pauseBuffer=b}});this.bind("Unpause",function(){var b=new Date().getTime();for(var a in this._realDelays){var c=this._realDelays[a];c.pause+=b-c.pauseBuffer}})},realDelay:function(b,a){return this._realDelays.push({start:new Date().getTime(),func:b,delay:a,triggered:false,pauseBuffer:0,pause:0})}});