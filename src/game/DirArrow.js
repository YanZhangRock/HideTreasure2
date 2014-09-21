/**
 * Created by Rock on 9/16/14.
 */

var DirArrow = cc.Node.extend({
    arrows: [],
    animIdx: 0,
    animation: null,

    ctor: function () {
        this._super();
        this.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * DirArrow.POS.x,
            y: g_size.height * DirArrow.POS.y,
            scale: 1.0
        });
        var mid = Math.floor( DirArrow.NUM / 2 );
        for( var i=0; i< DirArrow.NUM; i++ ) {
            var arrow = new cc.Sprite( "#direction2.png" );
            arrow.attr({
                anchorX: 0.5,
                anchorY: 0.5,
                x: ( i - mid ) * DirArrow.DIST,
                y: 0,
                scale: 1.0
            });
            this.addChild( arrow, 0 );
            this.arrows.push( arrow );
        }
        this._initAnimation();
    },

    _initAnimation: function() {
        var animFrames = [];
        var frameNames = ["direction.png", "direction2.png"];
        for ( var j = 0; j < 2; j++ ) {
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameNames[j]);
            var animFrame = new cc.AnimationFrame();
            animFrame.initWithSpriteFrame(spriteFrame, 1, null);
            animFrames.push(animFrame);
        }
        this.animation = new cc.Animation( animFrames, 0.4, 999 );
    },

    showArrows: function( dir ) {
        this._stopAnim();
        var rot = 0;
        var pos = DirArrow.POS;
        switch ( dir ) {
            case Def.LEFT:
                rot = 180;
                break;
            case Def.RIGHT:
                rot = 0;
                break;
            case Def.UP:
                rot = 270;
                break;
            case Def.DOWN:
                rot = 90;
                break;
        }
        this.setPosition( g_size.width * pos.x, g_size.height * pos.y );
        this.setRotation( rot );
        this.setVisible( true );
        this._playAnim();
    },

    hideArrows: function() {
        this._stopAnim();
        this.setVisible( false );
    },

    _stopAnim: function() {
        this.unscheduleAllCallbacks();
    },

    _playAnim: function() {
        this._stopAnim();
        for( var i in this.arrows ) {
            this.arrows[i].stopAllActions();
        }
        this.animIdx = 0;
        this._hideAllArrow();
        this.schedule( this._updateAnim, 0.06 );
    },

    _updateAnim: function() {
        if( this.animIdx >= this.arrows.length ) {
            //this._hideAllArrow();
            this.animIdx = 0;
            this._stopAnim();
            //this.schedule( function(){ this._playAnim(); }, 20, 0 );
            return;
        }
        var arrow = this.arrows[this.animIdx++];
        arrow.setVisible( true );
        var animate = new cc.Animate( this.animation );
        arrow.runAction( animate );
    },

    _hideAllArrow: function() {
        for( var i in this.arrows ) {
            this.arrows[i].setVisible( false );
        }
    }
});

DirArrow.NUM = 5;
DirArrow.POS = { x: 0.52, y: 0.07 };
DirArrow.DIST = 20;