/**
 * Created by Rock on 9/16/14.
 */

var DirArrow = cc.Node.extend({
    arrows: [],
    animIdx: 0,

    ctor: function () {
        this._super();
        this.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * DirArrow.POS1.x,
            y: g_size.height * DirArrow.POS1.y,
            scale: 1.0
        });
        var mid = Math.floor( DirArrow.NUM / 2 );
        for( var i=0; i< DirArrow.NUM; i++ ) {
            var arrow = new cc.Sprite( "#direction.png" );
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
    },

    showArrows: function( dir ) {
        this._stopAnim();
        var rot = 0;
        var pos = DirArrow.POS1;
        switch ( dir ) {
            case Def.LEFT:
                rot = 180;
                pos = DirArrow.POS1;
                break;
            case Def.RIGHT:
                rot = 0;
                pos = DirArrow.POS1;
                break;
            case Def.UP:
                rot = 270;
                //pos = DirArrow.POS2;
                break;
            case Def.DOWN:
                rot = 90;
                //pos = DirArrow.POS2;
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
        this.animIdx = 0;
        this._hideAllArrow();
        this.schedule( this._updateAnim, 0.02 );
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
    },

    _hideAllArrow: function() {
        for( var i in this.arrows ) {
            this.arrows[i].setVisible( false );
        }
    }
});

DirArrow.NUM = 5;
DirArrow.POS1 = { x: 0.52, y: 0.06 };
DirArrow.POS2 = { x: 0.98, y: 0.50 };
DirArrow.DIST = 25;