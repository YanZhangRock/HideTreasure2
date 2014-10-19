/**
 * Created by Rock on 9/23/14.
 */

var HighlightEffect = cc.Class.extend({
    count: 1,
    oriCount: 1,
    t1: 0,
    t2: 0,
    scale: 0,
    sprite: null,

    ctor: function ( sprite, callback, scale, time1, time2, count ) {
        var t1 = time1 ? time1 : HighlightEffect.TIME1;
        var t2 = time2 ? time2 : HighlightEffect.TIME2;
        var s = scale ? scale : HighlightEffect.SCALE;
        s = s <= 0 ? HighlightEffect.SCALE : s;
        this.scale = s;
        this.t1 = t1;
        this.t2 = t2;
        this.count = count || 1;
        this.oriCount = this.count;
        this.callback = callback;
        this.sprite = sprite;
        this._runCycle();
    },

    _runCycle: function() {
        if( this.count <= 0 ) {
            if( this.callback ) {
                this.callback();
            }
            return;
        }
        var preTime = 0
        if( this.oriCount > this.count ) {
            //preTime += this.t1;
        }
        this.count--;
        var sprite = this.sprite;
        var oriScale = sprite.getScale();
        var self = this;
        sprite.runAction(cc.sequence(
            cc.scaleTo( preTime, oriScale ),
            cc.scaleTo( this.t1, this.scale*oriScale ),
            cc.scaleTo( this.t2, oriScale ),
            cc.callFunc( function(){
                self._runCycle();
            } )
        ));
    }
});

HighlightEffect.TIME1 = 0.4;
HighlightEffect.TIME2 = 0.8;
HighlightEffect.SCALE = 3.0;
