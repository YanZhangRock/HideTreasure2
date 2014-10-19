/**
 * Created by Rock on 10/18/14.
 */

var ShareMenu = cc.Class.extend({
    layer: null,
    coverMenu: null,
    contentSprite: null,
    zOrder: 0,
    isActive: false,

    ctor: function ( layer, zOrder ) {
        this.layer = layer;
        this.zOrder = zOrder;
    },

    activate: function() {
        if( this.isActive ) return;
        this.isActive = true;
        var self = this;
        //this._addCoverMenu();
        this._addContentSprite();
        new HighlightEffect( this.contentSprite, function(){
            self.layer.schedule( function(){self.cancel();}, 1.4, 0 );
        }, 1.2, 0.25, 0.25, 2 );
    },

    cancel: function() {
        this.isActive = false;
        //this.layer.removeChild( this.coverMenu );
        if( this.contentSprite == null ) return;
        this.layer.removeChild( this.contentSprite );
        this.contentSprite = null;
    },

    _addCoverMenu: function() {
        var self = this;
        var btn = new cc.MenuItemImage(
            res.Grey,
            res.Grey,
            function () {
                self.cancel();
            }, this);
        btn.attr({
            x: g_size.width * 0.5,
            y: g_size.height * 0.5,
            anchorX: 0.5,
            anchorY: 0.5
        });
        var menu = new cc.Menu(btn);
        menu.x = 0;
        menu.y = 0;
        menu.setOpacity(180);
        menu.setScale(100);
        this.coverMenu = menu;
        this.layer.addChild( menu, this.zOrder );
    },

    _addContentSprite: function() {
        var sprite = new cc.Sprite( res.Share );
        sprite.attr({
            x: g_size.width * 0.7,
            y: g_size.height * 0.9,
            scale: 1.0
        });
        this.contentSprite = sprite;
        this.layer.addChild( sprite, this.zOrder+1 );
    }
})
