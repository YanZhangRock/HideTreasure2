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
    state: null,
    restartMenu: null,
    editorMenu: null,
    resultLabel: null,
    scoreLabel: null,
    timerLabel: null,
    touchBaganLoc: null,
    mapBatch: null,
    objBatch: null,
    maxMoney: 0,
    restTime: 0,
    goldNum: 0,

    ctor: function( scene, uid, challenger ) {
        this._super();
        this.scene = scene;
        this.uid = uid;
        this.challenger = challenger;
        this.state = GameLayer.STATE.END;
        this._initMapData();
        this._initObjIO();
    },

    onLoadObjsData: function() {
        this._initMapIO();
    },

    onLoadMapdata: function() {
        this.map.unserializeObjs();
        this._initLabels();
        this._registerInputs();
        this.startGame();
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
                //event.getCurrentTarget().onSwipe( dir );
                self.onSwipe( dir );
            }
        }, this);
    },

    _initLabels: function() {
        // score label
//        var label = new cc.LabelTTF("得分：", "Arial", 40);
//        this.scoreLabel = label;
//        label.x = g_size.width * 0.2;
//        label.y = g_size.height * 0.94;
//        this.addChild( label, GameLayer.Z.UI );
        // timer label
        var label = new cc.LabelTTF("剩余时间：", "Arial", 40);
        this.timerLabel = label;
        label.x = g_size.width * 0.85;
        label.y = g_size.height * 0.05;
        this.addChild( label, GameLayer.Z.UI );
        // restart label
        var label = new cc.LabelTTF("再玩一次", "Arial", 80);
        var self = this;
        var restart = new cc.MenuItemLabel( label, function(){ self.restartGame(); } );
        var menu = new cc.Menu(restart);
        this.restartMenu = menu;
        this.addChild( menu, GameLayer.Z.UI );
        // editor label
        var label = new cc.LabelTTF("我也要留一个秘密！", "Arial", 80);
        var self = this;
        var editor = new cc.MenuItemLabel( label, function(){ self.toEditorLevel(); } );
        var menu = new cc.Menu(editor);
        this.editorMenu = menu;
        this.addChild( menu, GameLayer.Z.UI );
        // result label
        var label = new cc.LabelTTF("你赢了！", "Arial", 58);
        this.resultLabel = label;
        this.addChild( label, GameLayer.Z.UI );
        this.showResult( false );
    },

    showResult: function( isShow, isWin ) {
        if( isShow ) {
            this.restartMenu.x = g_size.width * 0.52;
            this.restartMenu.y = g_size.height * 0.46;
            if( isWin ) {
                this.editorMenu.x = g_size.width * 0.52;
                this.editorMenu.y = g_size.height * 0.3;
                this.resultLabel.x = g_size.width * 0.35;
                this.resultLabel.y = g_size.height * 0.8;
            } else {
                this.resultLabel.x = g_size.width * 0.52;
                this.resultLabel.y = g_size.height * 0.8;
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

    clearObjs: function() {
        var batch = this.objBatch;
        batch.removeAllChildren();
        this.guards = [];
        this.moneys = [];
        this.traps = [];
        this.thief = null;
    },

    prepareRunGame: function() {
        var t1 = 0.5, t2 = 1.0, t3 = 1.2;
        for( var i in this.traps ) {
            this.traps[i].highLight( t1, t2, t3 );
        }
        this.schedule( this.runGame, t1+t2+t3, 0 );
    },

    runGame: function() {
        this.schedule( this.checkTimeup, GameLayer.TIMEUP_INTERVAL );
        this.state = GameLayer.STATE.GAME;
        for( var i in this.guards ) {
            this.guards[i].startPatrol();
        }
        // test
        this.endGame( false );
    },

    startGame: function() {
        //this.loadMap();
        //this.initMap();
        this.drawMap();
        this.createGolds();
        this.createObjs();
        this.setRestTime( GameLayer.TIMEUP );
        this.prepareRunGame();
    },

    restartGame: function() {
        this.clearObjs();
        this.map.unserializeMap();
        this.map.unserializeObjs();
        this.createGolds();
        this.createObjs();
        this.showResult( false );
        this.setRestTime( GameLayer.TIMEUP );
        this.prepareRunGame();
    },

    endGame: function( isWin ) {
        this.state = GameLayer.STATE.END;
        this.thief.unscheduleUpdate();
        this.unschedule( this.checkTimeup );
        for( var i in this.guards ) {
            this.guards[i].unscheduleUpdate();
        }
        if( isWin ) {
            var str = this.map.owner+"想对你说：\n"+this.map.secret;
            this.resultLabel.setString( str );
        } else {
            this.resultLabel.setString( "你被"+this.map.owner+"无情的踩死了T_T" );
        }
        var self = this;
        //Util.getPercent( this.thief.score, function(percent){self.onGetPercent(percent)} );
        this.showResult( true, isWin );
    },

    toEditorLevel: function() {
        var scene = this.scene;
        scene.removeChild( scene.layer );
        scene.layer = new EditorLayer( this.uid, this.challenger );
        scene.addChild( scene.layer );
    },

    setRestTime: function( time ) {
        this.restTime = time;
        this.timerLabel.setString( "剩余时间："+this.restTime );
    },

    checkTimeup: function() {
        this.restTime -= GameLayer.TIMEUP_INTERVAL;
        this.setRestTime( this.restTime );
        if( this.restTime <= 0 ) {
            this.endGame( false );
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
                    guard.setCurGrid(grid);
                    this.guards.push(guard);
                    grid.guard = guard;
                    batch.addChild(guard);
                }
                // money
                if (grid.money) {
                    var money = new Money(this);
                    grid.money = money;
                    money.setGrid(grid);
                    this.moneys.push(money);
                    money.setVisible( false );
                    batch.addChild(money);
                    this.maxMoney++;
                }
                // trap
                if (grid.trap) {
                    var trap = new Trap( this );
                    grid.trap = trap;
                    trap.setGrid( grid );
                    this.traps.push( trap );
                    batch.addChild( trap );
                }
            }
        }
        for( var i in this.guards ) {
            this.guards[i].thief = this.thief;
            //this.guards[i].startPatrol();
        }
        this.thief.moneys = this.moneys;
        this.thief.guards = this.guards;
        this.thief.traps = this.traps;
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
        return dirs;
    },

    onKeyPressed: function( key, event ) {
        if( this.state != GameLayer.STATE.GAME ) return;
        if( key == cc.KEY.w || key == cc.KEY.up ) {
            this.thief.changeDir( Def.UP );
        } else if( key == cc.KEY.a || key == cc.KEY.left ) {
            this.thief.changeDir( Def.LEFT );
        } else if( key == cc.KEY.d || key == cc.KEY.right ) {
            this.thief.changeDir( Def.RIGHT );
        } else if( key == cc.KEY.s || key == cc.KEY.down ) {
            this.thief.changeDir( Def.DOWN );
        }
    },

    onSwipe: function( dir ) {
        if( this.state == GameLayer.STATE.END ) return;
        this.thief.changeDir( dir );
    }
});

GameLayer.Z = {
    TILE: 0,
    ITEM: 1,
    OBJ: 2,
    UI: 3
};

GameLayer.TILE_TYPE = {
    BLOCK: 1, ROAD: 2
};

GameLayer.TILE2TYPE = {
    "TREES": GameLayer.TILE_TYPE.BLOCK,
    "GRASS": GameLayer.TILE_TYPE.ROAD
};

GameLayer.STATE = {
    GAME: 0, END: 1
};

GameLayer.TIMEUP = 600;
GameLayer.TIMEUP_INTERVAL = 1;
GameLayer.SWIPE_DIST = 10;