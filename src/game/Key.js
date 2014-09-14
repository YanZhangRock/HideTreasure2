/**
 * Created by Rock on 8/21/14.
 */

var Key = Item.extend({

    ctor: function( layer ) {
        this._super( "#key.png", layer );
    },

    onCatch: function( thief ) {
        if( !this.isVisible() ) return;
        thief.keyNum++;
        this.setVisible( false );
    }
})

Trap.PAUSE_TIME = 0.6;