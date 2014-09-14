/**
 * Created by Rock on 8/21/14.
 */

var Item = cc.Sprite.extend({
    layer: null,
    map: null,
    grid: null,
    subImg: null,

    ctor: function( img, layer ) {
        this._super( img );
        this.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: 0,
            y: 0,
            scale: 1.0
        });
        this.layer = layer;
        this.map = layer.map;
    },

    highLight: function( t1, t2 ) {
        var oriScale = this.getScale();
        this.runAction(cc.sequence(
            cc.scaleTo( t1, 3*oriScale ),
            cc.scaleTo( t2, oriScale )
        ));
    },

    setGrid: function( grid ) {
        this.grid = grid;
        this.setPosition( Util.grid2World( grid ) );
        if( this.subImg ) {
            this.subImg.setPosition( Util.grid2World( grid ) );
        }
    },

    collideRect: function( x, y ) {
        return cc.rect(x - 10, y - 10, 20, 20);
    }
})