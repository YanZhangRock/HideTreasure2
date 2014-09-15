/**
 * Created by Rock on 9/4/14.
 */

var GameLayer = cc.Layer.extend({
    scene: null,
    uid: 2001,
    challenger: "",
    map: null,
    mapIO: null,
    objIO: null,
    thief: null,
    guards: [],
    moneys: [],
    traps: [],
    golds: [],
    keys: [],
    state: null,
    restartMenu: null,
    rebornMenu: null,
    editorMenu: null,
    resultLabel: null,
    scoreLabel: null,
    timerLabel: null,
    lifeLabel: null,
    touchBaganLoc: null,
    mapBatch: null,
    objBatch: null,
    maxMoney: 0,
    restTime: 0,
    goldNum: 0,
    arrowOutlines: null,
    lv: 0,
    lvTime: 0,
    secretFrag: "",
    isFirstNeedKey: true,
    openAnim: null,
    txtCfg: null,

    ctor: function( scene, uid, challenger ) {
        this._super();
        this.scene = scene;
        this.uid = uid;
        this.challenger = challenger;
        this.state = GameLayer.STATE.END;
        this._chooseLanguage();
        this._initMapData();
        this._initObjIO();
    },

    onLoadObjsData: function() {
        this._initMapIO();
    },

    onLoadMapdata: function() {
        this.map.unserializeObjs();
        this._initLabels();
        //this._initCtrlPad();
        this._registerInputs();
        this._splitSecret( this.map.secret );
        this.startGame();
    },

    _chooseLanguage: function() {
        this.txtCfg = g_language == Def.CHN ? GameLayer.CHN : GameLayer.ENG;
    },

    _initMapData: function() {
        this.map = new MapData( this.uid );
    },

    _initMapIO: function() {
        var self = this;
        this.mapIO = new MapIO( this.map );
        this.mapIO.loadMap( this.map.mapid, function(){self.onLoadMapdata()} );
    },

    _initObjIO: function() {
        var self = this;
        this.objIO = new ObjIO( this.map );
        this.objIO.loadObjs( this.map.uid, function(){self.onLoadObjsData()} );
    },

    _registerInputs: function() {
        var self = this;
        // keyboard
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(key,event){self.onKeyPressed(key,event);},
            //onKeyReleased: function (key,event){self.onKeyReleased(key,event);}
        }, this);
        // touch
        cc.eventManager.addListener({
            prevTouchId: -1,
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan:function (touches, event) {
                var touch = touches[0];
                self.touchBeganLoc = touch.getLocation();
            },
            onTouchesEnded:function (touches, event) {
                var touch = touches[0];
                var l1 = self.touchBeganLoc;
                var l2 = touch.getLocation();
                var dx = l2.x - l1.x;
                var dy = l2.y - l1.y;
                if( Math.abs(dy) < GameLayer.SWIPE_DIST &&
                    Math.abs(dx) < GameLayer.SWIPE_DIST ) return;
                var dir = Def.UP;
                if( Math.abs(dy) > Math.abs(dx) ) {
                    if( dy > 0 ) {
                        dir = Def.UP;
                    } else {
                        dir = Def.DOWN;
                    }
                } else {
                    if( dx > 0 ) {
                        dir = Def.RIGHT;
                    } else {
                        dir = Def.LEFT;
                    }
                }
                self.onSwipe( dir );
            }
        }, this);
    },

    _initLabels: function() {
        // timer label
        var label = new cc.LabelTTF(this.txtCfg.timer, "Arial", 40);
        this.timerLabel = label;
        label.x = g_size.width * 0.85;
        label.y = g_size.height * 0.12;
        this.addChild( label, GameLayer.Z.UI );
        // life label
        var label = new cc.LabelTTF(this.txtCfg.life, "Arial", 40);
        this.lifeLabel = label;
        label.x = g_size.width * 0.50;
        label.y = g_size.height * 0.12;
        this.addChild( label, GameLayer.Z.UI );
        // restart label
        var label = new cc.LabelTTF(this.txtCfg.replay, "Arial", 80);
        var self = this;
        var restart = new cc.MenuItemLabel( label, function(){ self.restartGame(); } );
        var menu = new cc.Menu(restart);
        this.restartMenu = menu;
        this.addChild( menu, GameLayer.Z.UI );
        // reborn label
        var label = new cc.LabelTTF(this.txtCfg.reborn, "Arial", 80);
        var self = this;
        var reborn = new cc.MenuItemLabel( label, function(){ self.reborn(); } );
        var menu = new cc.Menu(reborn);
        this.rebornMenu = menu;
        this.addChild( menu, GameLayer.Z.UI );
        // editor label
        var label = new cc.LabelTTF(this.txtCfg.share, "Arial", 80);
        var self = this;
        var editor = new cc.MenuItemLabel( label, function(){ self.toEditorLevel(); } );
        var menu = new cc.Menu(editor);
        this.editorMenu = menu;
        this.addChild( menu, GameLayer.Z.UI );
        // result label
        var label = new cc.LabelTTF(this.txtCfg.win1, "Arial", 58,
            cc.size(1200,800), cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.resultLabel = label;
        this.addChild( label, GameLayer.Z.UI );
    },

    _initCtrlPad: function() {
        var outlines = [];
        var cfg = [
            { x: 0.5, y: 0.23, r: 90 },
            { x: 0.495, y: 0.07, r: 270 },
            { x: 0.34, y: 0.15, r: 0 },
            { x: 0.66, y: 0.15, r: 180 }
        ];
        var offset = 0.1;
        for( var i=0; i<4; i++) {
            var outline = new cc.Sprite( res.Arrow3 );
            outline.attr({
                x: g_size.width * ( cfg[i].x - offset ),
                y: g_size.height * cfg[i].y,
                anchorX: 0.5,
                anchorY: 0.5,
                rotation: cfg[i].r
            });
            outline.setVisible( false );
            outlines.push(outline);
            this.addChild(outline, GameLayer.Z.UI);
        }
        var self = this;
        for( var i=0; i<4; i++) {
            var btn = new cc.MenuItemImage(
                res.Arrow1,
                res.Arrow2,
                function () {
                    var idx = this-1;
                    for(var j=0; j<4; j++) {
                        if( j==idx ) {
                            outlines[j].setVisible( true );
                        } else {
                            outlines[j].setVisible( false );
                        }
                    }
                    self.onClickArrowBtn( idx );
                }, i+1);
            btn.attr({
                x: g_size.width * ( cfg[i].x - offset ),
                y: g_size.height * cfg[i].y,
                anchorX: 0.5,
                anchorY: 0.5,
                rotation: cfg[i].r
            });
            var menu = new cc.Menu(btn);
            menu.x = 0;
            menu.y = 0;
            this.addChild(menu, GameLayer.Z.UI);
        }
    },

    _splitSecret: function( str ) {
        var len = Math.floor( str.length * 0.5 );
        this.secretFrag = str.substring( 0, len );
    },

    showSecretFrag: function( isShow ) {
        if( isShow ) {
            var showTime = 3;
            var str = this.txtCfg.frag1+this.map.owner+this.txtCfg.frag2+"\n\n\""+this.secretFrag+"\"";
            this.resultLabel.setString( str );
            this.resultLabel.x = g_size.width * 0.72;
            this.resultLabel.y = g_size.height * 0.60;
            this.pauseGame();
            this.schedule( function() { this.showSecretFrag( false ) }, showTime, 0 );
        } else {
            this.resultLabel.x = g_size.width * 100;
            this.resultLabel.y = g_size.height * 100;
            this.resumeGame();
        }
    },

    showNeedKey: function( isShow ) {
        if( isShow ) {
            var showTime = 0.6;
            if( this.isFirstNeedKey ) {
                showTime = 2;
                this.isFirstNeedKey = false;
            }
            var str = this.txtCfg.key;
            this.resultLabel.setString( str );
            this.resultLabel.x = g_size.width * 0.72;
            this.resultLabel.y = g_size.height * 0.60;
            this.pauseGame();
            this.schedule( function() { this.showNeedKey( false ) }, showTime, 0 );
        } else {
            this.resultLabel.x = g_size.width * 100;
            this.resultLabel.y = g_size.height * 100;
            this.resumeGame();
        }
    },

    onGetFakeMoney: function( money ) {
        var pauseTime = 1.6;
        var guard = money.guard;
        this.pauseGame();
        this.showFakeTreasureMsg( true );
        this.schedule(
            function() {
                this.showFakeTreasureMsg( false );
                guard.setVisible( true );
                var t1 = 0.6, t2 = 1.2
                var animTime = t1+t2;
                var waitTime = 1.6;
                guard.highLight( t1, t2 );
                this.schedule(
                    function(){
                        this.resumeGame();
                        guard.init();
                    }, animTime, 0 );
                this.schedule(
                    function(){
                        guard.isHide = false;
                    },
                    animTime+waitTime, 0 );
            },
            pauseTime, 0 );
    },

    showFakeTreasureMsg: function( isShow ) {
        if( isShow ) {
            var str = this.txtCfg.trap1+this.map.owner+this.txtCfg.trap2;
            this.resultLabel.setString( str );
            this.resultLabel.x = g_size.width * 0.72;
            this.resultLabel.y = g_size.height * 0.60;
        } else {
            this.resultLabel.x = g_size.width * 100;
            this.resultLabel.y = g_size.height * 100;
        }
    },

    showResult: function( isShow, isWin ) {
        if( isShow ) {
            this.restartMenu.x = g_size.width * 0.52;
            this.restartMenu.y = g_size.height * 0.60;
            if( isWin ) {
                this.editorMenu.x = g_size.width * 0.52;
                this.editorMenu.y = g_size.height * 0.5;
                this.resultLabel.x = g_size.width * 0.72;
                this.resultLabel.y = g_size.height * 0.82;
            } else {
                this.resultLabel.x = g_size.width * 0.8;
                this.resultLabel.y = g_size.height * 0.72;
            }
        } else {
            this.restartMenu.x = g_size.width * 100;
            this.restartMenu.y = g_size.height * 100;
            this.editorMenu.x = g_size.width * 100;
            this.editorMenu.y = g_size.height * 100;
            this.resultLabel.x = g_size.width * 100;
            this.resultLabel.y = g_size.height * 100;
        }
    },

    showReborn: function( isShow ) {
        if( isShow ) {
            this.rebornMenu.x = g_size.width * 0.52;
            this.rebornMenu.y = g_size.height * 0.60;
        } else {
            this.rebornMenu.x = g_size.width * 100;
            this.rebornMenu.y = g_size.height * 100;
        }
    },

    clearObjs: function() {
        var batch = this.objBatch;
        batch.removeAllChildren();
        this.guards = [];
        this.moneys = [];
        this.traps = [];
        this.thief = null;
    },

    prepareRunGame: function() {
        if( Def.SHOW_ANIM ) {
            var anim = new OpenAnim( this );
            this.openAnim = anim;
            var self = this;
            anim.playAnim( function(){
                self.openAnim = null;
                self.state = GameLayer.STATE.PREPARE;
            } );
        } else {
            this.state = GameLayer.STATE.PREPARE;
        }

    },

    runGame: function() {
        this.schedule( this.checkTimeup, GameLayer.TIMEUP_INTERVAL );
        this.state = GameLayer.STATE.GAME;
        for( var i in this.guards ) {
            var guard = this.guards[i];
            if( guard.isHide ) {
                //guard.setVisible( false );
            } else {
                guard.init();
            }
        }
        this.thief.startMove();
        // test
        //this.endGame( true );
    },

    startGame: function() {
        //this.loadMap();
        //this.initMap();
        this.drawMap();
        //this.createGolds();
        this.createObjs();
        this.initParams();
        this.prepareRunGame();
    },

    restartGame: function() {
        this.clearObjs();
        this.map.unserializeMap();
        this.map.unserializeObjs();
        //this.createGolds();
        this.createObjs();
        this.initParams();
        this.prepareRunGame();
    },

    reborn: function() {
        this.showReborn( false );
        var idx = 0;
        var map = this.map;
        for( var i=0; i<map.width; i++ ) {
            for (var j = 0; j < map.height; j++) {
                var grid = map.grids[i][j];
                if( grid.thief ) {
                    this.thief.setCurGrid( grid );
                }
                if( grid.guard ) {
                    this.guards[idx].setCurGrid( grid );
                    idx++;
                }
            }
        }
        this.runGame();
    },

    initParams: function() {
        this.lv = 0;
        this.lvTime = 0;
        this.thief.setLife( Thief.LIFE );
        this.showResult( false );
        this.showReborn( false );
        this.setRestTime( GameLayer.TIMEUP );
    },

    pauseGame: function() {
        this.state = GameLayer.STATE.PAUSE;
        this.thief.pauseMove();
        for( var i in this.guards ) {
            this.guards[i].pauseAI();
        }
        this.unschedule( this.checkTimeup );
    },

    resumeGame: function() {
        this.schedule( this.checkTimeup, GameLayer.TIMEUP_INTERVAL );
        this.state = GameLayer.STATE.GAME;
        for( var i in this.guards ) {
            var guard = this.guards[i];
            if( !guard.isHide ) {
                guard.resumeAI();
            }
        }
        this.thief.continueMove();
    },

    endGame: function( isWin ) {
        this.state = GameLayer.STATE.END;
        this.thief.stopMove();
        this.thief.unscheduleUpdate();
        this.unschedule( this.checkTimeup );
        for( var i in this.guards ) {
            this.guards[i].stopMove();
            this.guards[i].unscheduleUpdate();
        }
        if( isWin ) {
            var str = this.txtCfg.win1+this.map.owner+this.txtCfg.win2+"\n\n\""+this.map.secret+"\"";
            this.resultLabel.setString( str );
        } else {
            this.resultLabel.setString( this.txtCfg.lose1+this.map.owner+this.txtCfg.lose2 );
        }
        var self = this;
        //Util.getPercent( this.thief.score, function(percent){self.onGetPercent(percent)} );
        this.showResult( true, isWin );
    },

    toEditorLevel: function() {
        var scene = this.scene;
        cc.eventManager.removeAllListeners();
        scene.removeChild( scene.layer );
        scene.layer = new EditorLayer( scene, this.uid, this.challenger );
        //scene.layer = new GameLayer( scene, this.uid, this.challenger );
        scene.addChild( scene.layer );
    },

    setRestTime: function( time ) {
        this.restTime = time;
        this.timerLabel.setString( this.txtCfg.timer+this.restTime );
    },

    checkTimeup: function() {
        this.restTime -= GameLayer.TIMEUP_INTERVAL;
        this.setRestTime( this.restTime );
        if( this.restTime <= 0 ) {
            this.endGame( false );
        }
        this.lvTime += GameLayer.TIMEUP_INTERVAL;
        if( this.lvTime >= GameLayer.LV_TIME[this.lv] ) {
            this.nextLv();
        }
    },

    nextLv: function() {
        if( this.lv >= GameLayer.MAX_LV-1 ) return;
        this.lvTime = 0;
        this.lv++;
        this.thief.changeLv( this.lv );
        for( var i in this.guards ) {
            this.guards[i].changeLv( this.lv );
        }
    },

    getTileImg: function( tile ) {
        var ret = "Grass0.png";
        switch ( tile ) {
            case "TREES":
                ret = "Tree0.png";
                break;
        }
        return ret;
    },

    drawMap: function() {
        var mapImg = cc.textureCache.addImage(res.Tile_png);
        var batchNode = new cc.SpriteBatchNode(mapImg, 200);
        this.mapBatch = batchNode;
        this.addChild( batchNode, GameLayer.Z.TILE );
        for( var i=0; i<this.map.width; i++ ) {
            for( var j=0; j<this.map.height; j++) {
                var grid = this.map.grids[i][j];
                var sprite = new cc.Sprite( "#"+this.getTileImg( grid.tile ) );
                grid.sprite = sprite;
                var pos = Util.grid2World( grid );
                sprite.attr({
                    anchorX: 0.5,
                    anchorY: 0.5,
                    x: pos.x,
                    y: pos.y,
                    scale: Def.GRID_SCALE
                });
                batchNode.addChild( sprite );
            }
        }
    },

    createGolds: function() {
        for( var i in this.golds ) {
            this.mapBatch.removeChild( this.golds[i] );
        }
        this.golds = [];
        this.goldNum = 0;
        var batch = this.mapBatch;
        for( var i=0; i<this.map.width; i++ ) {
            for( var j=0; j<this.map.height; j++) {
                var grid = this.map.grids[i][j];
                var pos = Util.grid2World( grid );
                if( grid.tile == "GRASS" && !grid.thief ) {
                    var gold = new Gold( this );
                    gold.setPosition(pos);
                    gold.grid = grid;
                    grid.gold = gold;
                    this.golds.push( gold );
                    batch.addChild( gold );
                    this.goldNum++;
                }
            }
        }
    },

    createObjs: function() {
        var objImg = cc.textureCache.addImage( res.Objs_png );
        var batch = new cc.SpriteBatchNode( objImg );
        this.objBatch = batch;
        this.addChild( batch, GameLayer.Z.OBJ );
        this.maxMoney = 0;
        var map = this.map;
        for( var i=0; i<map.width; i++ ) {
            for (var j = 0; j < map.height; j++) {
                var grid = map.grids[i][j];
                // thief
                if (grid.thief) {
                    this.thief = new Thief(this);
                    this.thief.setCurGrid(grid);
                    grid.thief = this.thief;
                    batch.addChild(this.thief);
                }
                // guards
                if (grid.guard) {
                    var guard = new Guard(this);
                    if( grid.money ) {
                        guard.isHide = true;
                        guard.setVisible( false );
                    }
                    guard.setCurGrid(grid);
                    this.guards.push(guard);
                    grid.guard = guard;
                    batch.addChild(guard);
                }
                // money
                if (grid.money) {
                    var money = new Money(this);
                    if( grid.guard ) {
                        money.isFake = true;
                        money.guard = grid.guard;
                    } else {
                        this.maxMoney++;
                    }
                    grid.money = money;
                    money.setGrid(grid);
                    this.moneys.push(money);
                    //money.setVisible( false );
                    batch.addChild(money);
                }
                // trap
//                if (grid.trap) {
//                    var trap = new Trap( this );
//                    grid.trap = trap;
//                    trap.setGrid( grid );
//                    this.traps.push( trap );
//                    batch.addChild( trap );
//                }
                // key
                if (grid.key) {
                    var key = new Key( this );
                    grid.key = key;
                    key.setGrid( grid );
                    this.keys.push( key );
                    batch.addChild( key );
                }
            }
        }
        for( var i in this.guards ) {
            this.guards[i].thief = this.thief;
        }
        this.thief.moneys = this.moneys;
        this.thief.guards = this.guards;
        this.thief.traps = this.traps;
        this.thief.keys = this.keys;
    },

    getOffsetGrid: function( grid, offset ) {
        var x = grid.x;
        var y = grid.y;
        x = x + offset.x;
        y = y + offset.y;
        if( x > this.map.width-1 ) {
            x = x - this.map.width;
        } else if( x < 0 ) {
            x = x + this.map.width;
        }
        if( y > this.map.height-1 ) {
            y = y - this.map.height;
        } else if ( y < 0 ) {
            y = y + this.map.height;
        }
        return this.map.grids[x][y]
    },

    canPass: function( grid ) {
        if( GameLayer.TILE2TYPE[grid.tile] == GameLayer.TILE_TYPE.BLOCK ) {
            return false;
        } else {
            return true;
        }
    },

    isGridVisible: function( g1, g2 ) {
        if( g1.x == g2.x) {
            for( var y = Math.min( g1.y, g2.y ); y <= Math.max( g1.y, g2.y ); y++ ) {
                if( !this.canPass( this.map.grids[g1.x][y] ) ) {
                    return false;
                }
            }
            return true;
        } else if( g1.y == g2.y ) {
            for( var x = Math.min( g1.x, g2.x ); x <= Math.max( g1.x, g2.x ); x++ ) {
                if( !this.canPass( this.map.grids[x][g1.y] ) ) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    },

    getRelativeDir: function( oriGrid, tarGrid ) {
        var dir = null;
        var dx = Math.abs( oriGrid.x - tarGrid.x );
        var dy = Math.abs( oriGrid.y - tarGrid.y );
        if( dx > dy ) {
            if( oriGrid.x > tarGrid.x ) {
                dir = Def.LEFT;
            } else {
                dir = Def.RIGHT;
            }
        } else {
            if( oriGrid.y > tarGrid.y ) {
                dir = Def.DOWN;
            } else {
                dir = Def.UP;
            }
        }
        return dir;
    },

    getRelativeDirs: function( oriGrid, tarGrid ) {
        var dirs = [];
        var dx = Math.abs( oriGrid.x - tarGrid.x );
        var dy = Math.abs( oriGrid.y - tarGrid.y );
        if( dx > dy ) {
            if( oriGrid.x > tarGrid.x ) {
                dirs.push( Def.LEFT );
            } else {
                dirs.push( Def.RIGHT );
            }
            if( oriGrid.y > tarGrid.y ) {
                dirs.push( Def.DOWN );
            } else {
                dirs.push( Def.UP );
            }
        } else {
            if( oriGrid.y > tarGrid.y ) {
                dirs.push( Def.DOWN );
            } else {
                dirs.push( Def.UP );
            }
            if( oriGrid.x > tarGrid.x ) {
                dirs.push( Def.LEFT );
            } else {
                dirs.push( Def.RIGHT );
            }
        }
        dirs.push( Util.getOppositeDir(dirs[1]) );
        dirs.push( Util.getOppositeDir(dirs[0]) );
        return dirs;
    },

    onKeyPressed: function( key, event ) {
        if( this.openAnim ) {
            this.openAnim.onSwipe();
        }
        var dir;
        if( key == cc.KEY.w || key == cc.KEY.up ) {
            dir = Def.UP;
        } else if( key == cc.KEY.a || key == cc.KEY.left ) {
            dir = Def.LEFT;
        } else if( key == cc.KEY.d || key == cc.KEY.right ) {
            dir = Def.RIGHT;
        } else if( key == cc.KEY.s || key == cc.KEY.down ) {
            dir = Def.DOWN;
        }
        if( this.state == GameLayer.STATE.GAME || this.state == GameLayer.STATE.PAUSE ) {
            this.thief.changeDir( dir );
        } else if ( this.state == GameLayer.STATE.PREPARE ) {
            this.thief.changeDir( dir );
            this.runGame();
        }
    },

    onSwipe: function( dir ) {
        if( this.openAnim ) {
            this.openAnim.onSwipe();
        }
        if( this.state == GameLayer.STATE.GAME || this.state == GameLayer.STATE.PAUSE ) {
            this.thief.changeDir( dir );
        } else if ( this.state == GameLayer.STATE.PREPARE ) {
            this.thief.changeDir( dir );
            this.runGame();
        }
    },

    onClickArrowBtn: function( dir ) {
        if( this.state == GameLayer.STATE.GAME || this.state == GameLayer.STATE.PAUSE ) {
            this.thief.changeDir( dir );
        } else if ( this.state == GameLayer.STATE.PREPARE ) {
            this.thief.changeDir( dir );
            this.runGame();
        }
    }
});

GameLayer.Z = {
    TILE: 0,
    ITEM: 1,
    OBJ: 2,
    ANIM: 3,
    UI: 4
};

GameLayer.TILE_TYPE = {
    BLOCK: 1, ROAD: 2
};

GameLayer.TILE2TYPE = {
    "TREES": GameLayer.TILE_TYPE.BLOCK,
    "GRASS": GameLayer.TILE_TYPE.ROAD
};

GameLayer.STATE = {
    GAME: 0, END: 1, PREPARE: 2, PAUSE: 3
};

GameLayer.TIMEUP = 600;
GameLayer.TIMEUP_INTERVAL = 1;
GameLayer.SWIPE_DIST = 5;
GameLayer.LV_TIME = [ 8, 10 ];
GameLayer.MAX_LV = 1;
GameLayer.CHN = {
    timer: "剩余时间：",
    life: "生命：",
    replay: "再玩一次",
    reborn: "继续挑战",
    key: "你需要钥匙才能打开宝箱",
    frag1: "发现了",
    frag2: "秘密的残卷：",
    trap1: "糟糕！中了",
    trap2: "设下的圈套！",
    win1: "原来",
    win2: "的秘密是：",
    lose1: "你被",
    lose2: "无情的踩死了T_T",
    share: "我也要留一个秘密！"
};
GameLayer.ENG = {
    timer: "rest time: ",
    life: "life: ",
    replay: "Play Again",
    reborn: "Continue",
    key: "You need a key to open it",
    frag1: "You found a fragment \nof ",
    frag2: "'s secret: ",
    trap1: "OMG! It's ",
    trap2: "'s Trap!",
    win1: "Finally, ",
    win2: "'s secret is: ",
    lose1: "You've got killed by ",
    lose2: " T_T",
    share: "I wanna leave a secret too!"
};