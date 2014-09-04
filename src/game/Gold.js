/**
 * Created by Rock on 8/22/14.
 */

var Gold = cc.Sprite.extend({
    layer: null,
    grid: null,

    ctor: function ( layer ) {
        this._super( "#gold.png" );
        this.layer = layer;
        this.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: 0,
            y: 0,
            scale: 0.5
        });
    },

    collideRect: function( x, y ) {
        return cc.rect(x - 10, y - 10, 20, 20);
    },

    onPicked: function( thief ) {
        thief.addScore( 10 );
        this.grid.gold = null;
        Util.arrayRemove( this.layer.golds, this );
        this.layer.goldNum--;
        this.layer.mapBatch.removeChild( this );
        if( this.layer.goldNum <= 0 ) {
            for( var i in this.layer.moneys ) {
                this.layer.moneys[i].setVisible( true );
            }
        }
    }
});