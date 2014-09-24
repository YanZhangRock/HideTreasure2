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
    moneys: [],
    titleLabel: null,
    remindLabel: null,
    remindString: "",
    touchBaganLoc: null,
    curTile: {sprite: null, name: "", img: ""},
    gridMoved: null,
    btnMgr: null,
    saveBtn: null,
    submitBtn: null,
    arrangeBtn: null,
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
        this.moneys = [];
        this._chooseLanguage();
        this._initBackground();
        this._initTitles();
        this._createNewMapID();
        this._initMapData();
        this._initObjIO();
        this._initMapIO();
    },

    onLoadMapdata: function() {
        this.map.unserializeObjs();
        this._initButtons();
        this._initMapPainter();
        //this._initObjTile();
        this._initMapEditor();
        this._createCurTile();
        this._createListener();
        this.startLevel();
    },

    startLevel: function() {
        this.mapPainter.drawMap();
        this.titleLabel.label.setString(this.map.owner + this.txtCfg.title);
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

    _playFakeRemindAnim: function() {
        var t1 = 0.4, t2 = 0.8;
        new HighlightEffect( this.remindLabel, null, 1.2, t1, t2 );
        this.schedule( function() {
            var t1 = 0.4, t2 = 0.8;
            for( var i in this.moneys ) {
                new HighlightEffect( this.moneys[i], null, 2.0, t1, t2 );
            }
        }, t1+t2, 0 );
    },

    _playKeyRemindAnim: function() {
        var t1 = 0.4, t2 = 0.8;
        new HighlightEffect( this.remindLabel, null, 1.2, t1, t2 );
    },

    setPhase: function( phase ) {
        switch ( phase ) {
            case EditorLayer.PHASE.MSG:
                this.remindLabel.setVisible( false );
                this.remindLabel.label.setString("");
                this.saveBtn.setVisible( false );
                this.saveBtn.label.setString("");
                this._askSecret();
                break;
            case EditorLayer.PHASE.FAKE:
                this.remindLabel.setVisible( true );
                this.remindLabel.label.setString( this.txtCfg.fake );
                this.saveBtn.setVisible( true );
                this.saveBtn.label.setString(this.txtCfg.next);
                this.setCurTile( "GUARD", "guard.png" );
                this._clearObjs();
                this._playFakeRemindAnim();
                break;
            case EditorLayer.PHASE.KEY:
                this.setCurTile( "KEY", "key.png" );
                this.remindLabel.setVisible( true );
                this.remindLabel.label.setString( this.txtCfg.key );
                this.saveBtn.setVisible( true );
                this.saveBtn.label.setString(this.txtCfg.submit2);
                this._playKeyRemindAnim();
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
        if( g_language == Def.ENG ) {
            param = param + "&lan=e";
        }
        return url + "?" + param;
    },

    _initTitles: function() {
        // title label
        var label = new MyLabel( "12345", 60, {x:1.2, y:1.4} );
        label.x = g_size.width * 0.50;
        label.y = g_size.height * 0.94;
        this.titleLabel = label;
        this.addChild( label, EditorLayer.Z.UI );
        // remind label
        var label = new MyLabel( "123", 40, {x:1.4, y:1.0} );
        label.x = g_size.width * 0.28;
        label.y = g_size.height * 0.11;
        this.remindLabel = label;
        label.setVisible( false );
        this.addChild( label, EditorLayer.Z.UI );
    },

    _initButtons: function() {
        var self = this;
        // button manager
        this.btnMgr = new ButtonMgr();
        this.addChild( this.btnMgr, EditorLayer.Z.UI );
        // save button
        var btn = new MyButton( "12", {x:1.0, y:0.5} );
        btn.x = g_size.width * 0.88;
        btn.y = g_size.height * 0.11;
        btn.label.setFontSize( 32 );
        btn.setCallBack( function() { self.onObjsSaved(); } );
        btn.label.setString( "" );
        this.saveBtn = btn;
        btn.setVisible( false );
        this.btnMgr.addButton( btn );
        // arrange
        var width = 0.50;
        var size = 50;
        var btn = new MyButton( "123456", {x:0.8, y:0.8} );
        btn.label.setString( this.txtCfg.arrange );
        btn.x = g_size.width * width;
        btn.y = g_size.height * 0.62;
        btn.label.setFontSize( size );
        btn.setCallBack( function() { self.onClickArrange(); } );
        this.arrangeBtn = btn;
        this.btnMgr.addButton( btn );
        // submit
        var btn = new MyButton( "1234567", {x:0.8, y:0.8} );
        btn.label.setString( this.txtCfg.submit );
        btn.x = g_size.width * width;
        btn.y = g_size.height * 0.48;
        btn.label.setFontSize( size );
        btn.setCallBack( function() { self.onClickSubmit(); } );
        this.submitBtn = btn;
        this.btnMgr.addButton( btn );
        // hide buttons
        this._showOption( false );
    },

    onClickSubmit: function() {
        var self = this;
        this.submitBtn.setVisible( false );
        this.arrangeBtn.setVisible( false );
        this.objIO.saveObjs( function(){self.onObjsSaved();} );
    },

    onClickArrange: function() {
        this.submitBtn.setVisible( false );
        this.arrangeBtn.setVisible( false );
        this.setPhase( EditorLayer.PHASE.FAKE );
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

    _chooseLanguage: function() {
        this.txtCfg = g_language == Def.CHN ? EditorLayer.CHN : EditorLayer.ENG;
    },

    _createCurTile: function() {
        var sprite = new cc.Sprite( "#" + Def.OBJ2IMG["MONEY"] );
        sprite.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * 0.64,
            y: g_size.height * 0.11,
            scale: Def.GRID_SCALE
        });
        sprite.setVisible( false );
        this.curTile.sprite = sprite;
        this.curTile.name = "MONEY";
        this.curTile.img = Def.OBJ2IMG["MONEY"];
        this.addChild( sprite, EditorLayer.Z.UI );
    },

    _initBackground: function() {
        var sprite = new cc.Sprite( "#menuback.png" );
        sprite.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * 0.5,
            y: g_size.height * 0.5,
            scale: Def.IMG_SCALE
        });
        this.addChild( sprite, EditorLayer.Z.BACK );
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
        this.curTile.sprite.setVisible( true );
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
        this.submitBtn.setVisible( isShow );
        this.arrangeBtn.setVisible( isShow );
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
    BACK: 0,
    MAP: 1,
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
    submit2: "发布秘密",
    arrange: "先排兵布阵",
    fake: "请选择两个假宝藏",
    key: "请放置一把钥匙",
    next: "下一步"
};

EditorLayer.ENG = {
    title: "'s secret",
    msg: "Leave your message: ",
    submit: "Publish immediately",
    submit2: "Publish",
    arrange: "Set layout first",
    fake: "pick two fake chests",
    key: "please place a key",
    next: "next"
};