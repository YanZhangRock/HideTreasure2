/**
 * Created by Rock on 9/4/14.
 */

var EditorLayer = cc.Layer.extend({
    scene: null,
    mapFileIO: null,
    mapPainter: null,
    objTile: null,
    mapEditor: null,
    mapIO: null,
    objIO: null,
    map: null,
    titleLabel: null,
    remindLabel: null,
    remindString: "",
    touchBaganLoc: null,
    curTile: {sprite: null, name: "", img: ""},
    gridMoved: null,
    saveObjsLabel: null,
    saveObjsMenu: null,
    shareMenu: null,
    submitMenu: null,
    arrangeMenu: null,
    challenger: "",
    txtCfg: null,
    phase: null,
    uid: 2001,
    midNew: 2002,

    ctor: function ( scene, uid, challenger ) {
        this._super();
        this.scene = scene;
        this.uid = uid;
        this.challenger = challenger;
        this.phase = EditorLayer.PHASE.MSG;
        this._chooseLanguage();
        this._initTitles();
        this._createNewMapID();
        this._initMapData();
        this._initObjIO();
        this._initMapIO();
    },

    onLoadMapdata: function() {
        this.map.unserializeObjs();
        this._initSaveUI();
        this._initOption();
        this._initMapPainter();
        //this._initObjTile();
        this._initMapEditor();
        this._createCurTile();
        this._createListener();
        this.startLevel();
    },

    startLevel: function() {
        this.mapPainter.drawMap();
        this.titleLabel.setString(this.map.owner + this.txtCfg.title);
        this._randomizeFakeTreasures();
        this._randomizeKey();
        if( Def.ASK_SECRET ) {
            this.setPhase( EditorLayer.PHASE.MSG );
        } else {
            this._showOption( true );
        }
    },

    _randomizeFakeTreasures: function() {
        var grids = []
        for( var w=0; w<this.map.width; w++ ) {
            for( var h=0; h<this.map.height; h++ ) {
                var grid = this.map.grids[w][h];
                if( grid.money ) {
                    grids.push( grid );
                }
            }
        }
        for( var i=0; i<2; i++) {
            var idx = Math.floor( Math.random() * grids.length );
            this.mapEditor.addGuard( grids[idx] );
            grids.splice( idx, 1 );
        }
    },

    _randomizeKey: function() {
        var grids = [];
        for( var w=0; w<this.map.width; w++ ) {
            for( var h=0; h<this.map.height; h++ ) {
                var grid = this.map.grids[w][h];
                if( grid.tile != "TREES" ) {
                    grids.push( grid );
                }
            }
        }
        var idx = Math.floor( Math.random() * grids.length );
        this.mapEditor.addTrap( grids[idx] );
    },

    _clearObjs: function() {
        for( var w=0; w<this.map.width; w++ ) {
            for( var h=0; h<this.map.height; h++ ) {
                var grid = this.map.grids[w][h];
                if( grid.trap ) {
                    this.mapEditor.addTrap( grid );
                }
                if( grid.guard && grid.money ) {
                    this.mapEditor.addGuard( grid );
                }
            }
        }
    },

    setPhase: function( phase ) {
        switch ( phase ) {
            case EditorLayer.PHASE.MSG:
                this.remindLabel.setString("");
                this.saveObjsLabel.setString("");
                this._askSecret();
                break;
            case EditorLayer.PHASE.FAKE:
                this.remindLabel.setString( this.txtCfg.fake );
                this.saveObjsLabel.setString( this.txtCfg.next );
                this.setCurTile( "GUARD", "guard.png" );
                this._clearObjs();
                break;
            case EditorLayer.PHASE.KEY:
                this.setCurTile( "KEY", "key.png" );
                this.remindLabel.setString( this.txtCfg.key );
                this.saveObjsLabel.setString( this.txtCfg.submit );
                break;
        }
        this.phase = phase;
    },

    onObjsSaved: function() {
        switch ( this.phase ) {
            case EditorLayer.PHASE.FAKE:
                this.setPhase( EditorLayer.PHASE.KEY );
                break;
            case EditorLayer.PHASE.KEY:
                document.location.replace( this._getNewUrl() );
                break;
            case EditorLayer.PHASE.MSG:
                document.location.replace( this._getNewUrl() );
                break;
        }
    },

    _getNewUrl: function() {
        var url = location.href.split("?")[0];
        var param = "uid="+this.map.uidNew;
        return url + "?" + param;
    },

    _initTitles: function() {
        // title label
        var label = new cc.LabelTTF("", "Arial", 40, cc.size(400,80), cc.TEXT_ALIGNMENT_LEFT);
        label.x = g_size.width * 0.25;
        label.y = g_size.height * 0.94;
        this.titleLabel = label;
        this.addChild( label, EditorLayer.Z.UI );
        // remind label
        var label = new cc.LabelTTF("", "Arial", 40, cc.size(800,80), cc.TEXT_ALIGNMENT_LEFT);
        label.x = g_size.width * 0.75;
        label.y = g_size.height * 0.94;
        this.remindLabel = label;
        this.addChild( label, EditorLayer.Z.UI );
    },

    _initSaveUI: function() {
        // save objs label
        var label = new cc.LabelTTF("lalalala", "Arial", 40);
        var self = this;
        var save = new cc.MenuItemLabel( label,
            function(){
                self.objIO.saveObjs( function(){self.onObjsSaved();} );
            }
        );
        var menu = new cc.Menu( save );
        menu.x = g_size.width * 0.8;
        menu.y = g_size.height * 0.08;
        this.saveObjsMenu = menu;
        this.saveObjsLabel = label;
        label.setString("");
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

    _initOption: function() {
        var width = 0.50
        var size = 80
        // submit
        var label = new cc.LabelTTF(this.txtCfg.submit, "Arial", size);
        var self = this;
        var submit = new cc.MenuItemLabel( label,
            function(){
                self.submitMenu.setPosition( g_size.width * width, g_size.height * 100 );
                self.arrangeMenu.setPosition( g_size.width * width, g_size.height * 100 );
                self.objIO.saveObjs( function(){self.onObjsSaved();} );
            }
        );
        var menu = new cc.Menu( submit );
        menu.x = g_size.width * width;
        menu.y = g_size.height * 0.60;
        this.submitMenu = menu;
        this.addChild( menu, EditorLayer.Z.UI );
        // arrange
        var label = new cc.LabelTTF(this.txtCfg.arrange, "Arial", size);
        var self = this;
        var arrange = new cc.MenuItemLabel( label,
            function(){
                self.submitMenu.setPosition( g_size.width * width, g_size.height * 100 );
                self.arrangeMenu.setPosition( g_size.width * width, g_size.height * 100 );
                self.setPhase( EditorLayer.PHASE.FAKE );
            }
        );
        var menu = new cc.Menu( arrange );
        menu.x = g_size.width * width;
        menu.y = g_size.height * 0.50;
        this.arrangeMenu = menu;
        this.addChild( menu, EditorLayer.Z.UI );
        this._showOption( false );
    },

    _chooseLanguage: function() {
        this.txtCfg = g_language == Def.CHN ? EditorLayer.CHN : EditorLayer.ENG;
    },

    _createCurTile: function() {
        var sprite = new cc.Sprite( "#" + Def.OBJ2IMG["MONEY"] );
        sprite.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * 0.55,
            y: g_size.height * 0.08,
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
        var self = this;
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
        //this._askSecret();
    },

    _askSecret: function() {
        var self = this;
        var msg = Util.createTextField(
            this.txtCfg.msg,
            function(){ self._onGetSecret(this); }
        );
        this.addChild( msg, EditorLayer.Z.FIELD );
    },

    _onGetSecret: function( msg ) {
        this.map.secret = msg.getString();
        this._showOption( true );
    },

    _showOption: function( isShow ) {
        var width = 0.5;
        if( isShow ) {
            this.submitMenu.setPosition( g_size.width * width, g_size.height * 0.6 );
            this.arrangeMenu.setPosition( g_size.width * width, g_size.height * 0.5 );
        } else {
            this.submitMenu.setPosition( g_size.width * width, g_size.height * 100 );
            this.arrangeMenu.setPosition( g_size.width * width, g_size.height * 100 );
        }
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

EditorLayer.PHASE = {
    MSG: 0, FAKE: 1, KEY: 2
};

EditorLayer.CHN = {
    title: "的秘密",
    msg: "俺老孙要在此留尿一坨：",
    submit: "马上发布秘密",
    arrange: "先排兵布阵",
    fake: "请选择两个假宝藏",
    key: "请放置一把钥匙",
    next: "下一步"
};

EditorLayer.ENG = {
    title: "'s secret",
    msg: "Leave your message: ",
    submit: "Publish immediately",
    arrange: "Set layout first",
    fake: "pick two fake fortunes",
    key: "please place a key",
    next: "next"
};