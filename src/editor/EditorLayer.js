/**
 * Created by Rock on 9/4/14.
 */

var EditorLayer = cc.Layer.extend({
    mapFileIO: null,
    mapPainter: null,
    objTile: null,
    mapEditor: null,
    mapIO: null,
    objIO: null,
    map: null,
    remindLabel: null,
    remindString: "",
    touchBaganLoc: null,
    curTile: {sprite: null, name: "", img: ""},
    gridMoved: null,
    saveObjsMenu: null,
    shareMenu: null,
    challenger: "",
    uid: 2001,
    midNew: 2002,

    ctor: function ( uid, challenger ) {
        this._super();
        this.uid = uid;
        this.challenger = challenger;
        // score label
        var label = new cc.LabelTTF("随便写写", "Arial", 40);
        label.x = g_size.width * 0.2;
        label.y = g_size.height * 0.94;
        this.remindLabel = label;
        this.addChild( label, EditorLayer.Z.UI );
        this._createNewMapID();
        this._initMapData();
        this._initObjIO();
        this._initMapIO();
    },

    onLoadMapdata: function() {
        this.map.unserializeObjs();
        this._initSaveUI();
        this._initMapPainter();
        this._initObjTile();
        this._initMapEditor();
        this._createCurTile();
        this._createListener();
        this.startLevel();
    },

    startLevel: function() {
        this.mapPainter.drawMap();
        this.remindLabel.setString(this.map.owner);
    },

    onObjsSaved: function() {
        this.remindLabel.setString("地图提交成功");
        this.schedule( function(){
            this.remindLabel.setString("");
        }, 1.5, 0 );
        document.location.replace( this._getNewUrl() );
    },

    _getNewUrl: function() {
        var url = location.href.split("?")[0];
        var param = "uid="+this.map.uidNew;
        return url + "?" + param;
    },

    _initSaveUI: function() {
        // save objs label
        var label = new cc.LabelTTF("提交地图", "Arial", 40);
        var self = this;
        var save = new cc.MenuItemLabel( label,
            function(){
                self.objIO.saveObjs( function(){self.onObjsSaved();} );
            }
        );
        var menu = new cc.Menu( save );
        menu.x = g_size.width * 0.8;
        menu.y = g_size.height * 0.07;
        this.saveObjsMenu = menu;
        this.addChild( menu, EditorLayer.Z.UI );
    },

    _initMapData: function() {
        this.map = new MapData( this.uid );
        this.map.createNewUserID();
        this.map.createNewMapID();
        this.map.owner = this.challenger;
    },

    _initMapIO: function() {
        var self = this;
        this.mapIO = new MapIO( this.map );
        this.mapIO.loadMap( this.map.midNew, function(){self.onLoadMapdata()} );
    },

    _initObjIO: function() {
        var self = this;
        this.objIO = new ObjIO( this.map );
        //this.objIO.loadObjs( this.map.uidNew, function(){self.onLoadObjsData()}, true );
    },

    _initMapPainter: function() {
        this.mapPainter = new MapPainter( this );
        this.mapPainter.setParam({
            zOrder: EditorLayer.Z.MAP,
            oriGrid: Def.ORI_GRID,
            gridScale: Def.GRID_SCALE
        });
    },

    _initObjTile: function() {
        this.objTile = new ObjTile( this, EditorLayer.Z.UI );
        this.objTile.createTiles();
    },

    _initMapEditor: function() {
        this.mapEditor = new MapEditor( this );
    },

    _createCurTile: function() {
        var sprite = new cc.Sprite( "#" + Def.OBJ2IMG["MONEY"] );
        sprite.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * 0.55,
            y: g_size.height * 0.07,
            scale: Def.GRID_SCALE
        });
        this.curTile.sprite = sprite;
        this.curTile.name = "MONEY";
        this.curTile.img = Def.OBJ2IMG["MONEY"];
        this.addChild( sprite, EditorLayer.Z.UI );
    },

    _createNewMapID: function() {
        this.midNew = 2002;
    },

    _createListener: function() {
        cc.eventManager.addListener({
            prevTouchId: -1,
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan:function (touches, event) {
                var touch = touches[0];
                this.prevTouchId = touch.getId();
                event.getCurrentTarget().onTouchBegan( touch );
            },
            onTouchesMoved:function (touches, event) {
                var touch = touches[0];
                if (this.prevTouchId != touch.getId()){
                    this.prevTouchId = touch.getId();
                } else {
                    event.getCurrentTarget().onTouchMoved( touch );
                }
            }
        }, this);
    },

    setCurTile: function( tile, img ) {
        this.curTile.name = tile;
        this.curTile.img = img;
        var frame = cc.spriteFrameCache.getSpriteFrame(img);
        this.curTile.sprite.setSpriteFrame( frame );
    },

    onAddMoney: function() {
        this._askSecret();
    },

    _askSecret: function() {
        var self = this;
        var msg = Util.createTextField(
            "俺老孙要在此留尿一坨：",
            function(){ self._onGetSecret(this); }
        );
        this.addChild( msg, EditorLayer.Z.FIELD );
    },

    _onGetSecret: function( msg ) {
        this.map.secret = msg.getString();
        //this.map.secret = "lala";
    },

    onTouchBegan: function( touch ) {
        var l = touch.getLocation();
        var p = Util.world2Grid( l );
        var map = this.map;
        if( p.x < 0 || p.x > map.width ||
            p.y < 0 || p.y > map.height ) return;
        var grid = map.grids[p.x][p.y];
        this.gridMoved = grid;
        this.mapEditor.editMap( grid, this.curTile.name, this.curTile.img );
    },

    onTouchMoved: function( touch ) {
        var l = touch.getLocation();
        var p = Util.world2Grid( l );
        var map = this.map;
        if( p.x < 0 || p.x > map.width ||
            p.y < 0 || p.y > map.height ) return;
        var grid = map.grids[p.x][p.y];
        if( this.gridMoved && this.gridMoved == grid ) return;
        this.gridMoved = grid;
        this.mapEditor.editMap( grid, this.curTile.name, this.curTile.img );
    }

});

EditorLayer.Z = {
    MAP: 0,
    OBJ: 100,
    UI: 200,
    SHARE: 201,
    FIELD: 202
};