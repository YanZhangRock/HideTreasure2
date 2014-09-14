/**
 * Created by Rock on 8/21/14.
 */

var Trap = Item.extend({
    thief: null,

    ctor: function( layer ) {
        this._super( "#trap.png", layer );
        this.subImg = new cc.Sprite("#trap2.png");
        this.subImg.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: 0,
            y: 0,
            scale: 1.0
        });
        this.layer.objBatch.addChild( this.subImg );
        this.subImg.setVisible( false );
    },

    highLight: function( t1, t2, t3 ) {
        var oriScale = this.getScale();
        var self = this
        this.runAction(cc.sequence(
            cc.scaleTo( t1, 3*oriScale ),
            cc.scaleTo( t2, oriScale )
            //cc.fadeOut( t3 )
            ));
    },

    onCatch: function( thief ) {
        this.runAction( cc.fadeIn(0.1) );
        this.thief = thief;
        this.subImg.setVisible( true );
        this.setVisible( false );
        thief.pauseMove();
        this.schedule( this.onPauseEnd, Trap.PAUSE_TIME, 0 );
    },

    onPauseEnd: function() {
        this.subImg.setVisible( false );
        this.setVisible( true );
        this.unschedule( this.onPauseEnd );
        this.thief.continueMove();
    }
})

Trap.PAUSE_TIME = 0.6;