/**
 * Created by Rock on 9/23/14.
 */

var HighlightEffect = cc.Class.extend({

    ctor: function ( sprite, callback, scale, time1, time2 ) {
        var t1 = time1 ? time1 : HighlightEffect.TIME1;
        var t2 = time2 ? time2 : HighlightEffect.TIME2;
        var s = scale ? scale : HighlightEffect.SCALE;
        s = s <= 0 ? HighlightEffect.SCALE : s;
        // run action
        var oriScale = sprite.getScale();
        sprite.runAction(cc.sequence(
            cc.scaleTo( t1, s*oriScale ),
            cc.scaleTo( t2, oriScale ),
            cc.callFunc( function(){
                if( callback ) {
                    callback();
                }
            } )
        ));
    }
});

HighlightEffect.TIME1 = 0.4;
HighlightEffect.TIME2 = 0.8;
HighlightEffect.SCALE = 3.0;
