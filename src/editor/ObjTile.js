/**
 * Created by Rock on 8/24/14.
 */

var ObjTile = cc.Class.extend({
    layer: null,
    zOrder: 0,
    listener: null,
    tile2Img: {},
    tile2Btn: {},

    ctor: function (layer, zOrder) {
        this.layer = layer;
        this.zOrder = zOrder;
    },

    createTiles: function() {
        this._createListener();
        this._createObjs();
    },

    _createListener: function() {
        var self = this;
        var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            //onTouchBegan event callback function
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    self.onTouchBegan( touch, event );
                    return true;
                }
                return false;
            }
        });
        this.listener = listener;
    },

    _createObjs: function() {
        var names = ["MONEY", "TRAP"]
        for( var i in names ) {
            var name = names[i];
            var imgName = Def.OBJ2IMG[name];
            var img = "#" + Def.OBJ2IMG[name];
            var tileBtn = new cc.Sprite( img );
            tileBtn.attr({
                x: g_size.width * ObjTile.ORI_GRID.x + ( Def.GRID_SIZE + ObjTile.EDGE ) * i,
                y: g_size.height * ObjTile.ORI_GRID.y - ObjTile.EDGE - Def.GRID_SIZE,
                anchorX: 0.5,
                anchorY: 0.5
            });
            this.tile2Img[name] = imgName;
            this.tile2Btn[name] = tileBtn;
            this.layer.addChild( tileBtn );
            cc.eventManager.addListener(this.listener.clone(), tileBtn);
        }
    },

    onTouchBegan: function( touch, event ) {
        var btn = event.getCurrentTarget();
        for( var k in this.tile2Btn ) {
            if( this.tile2Btn[k] == btn ) {
                this.layer.setCurTile( k, this.tile2Img[k] );
                return;
            }
        }
    }
});

ObjTile.EDGE = 16;
ObjTile.ORI_GRID = {
    x: 0.25, y: 0.15
};