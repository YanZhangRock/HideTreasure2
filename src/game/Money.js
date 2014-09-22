/**
 * Created by Rock on 8/21/14.
 */

var Money = Item.extend({
    isFake: false,
    guard: null,

    ctor: function( layer ) {
        this._super( "#money.png", layer );
    },

    onSteal: function( thief ) {
        this.map.grids[this.grid.x][this.grid.y].money = null;
        this.layer.removeChild( this );
    }
})