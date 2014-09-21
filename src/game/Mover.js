/**
 * Created by Rock on 8/20/14.
 */

var Mover = cc.Sprite.extend({
    map: null,
    layer: null,
    type: null,
    nextDir: Def.LEFT,
    curDir: Def.LEFT,
    realGrid: null,
    curGrid: null,
    nextGrid: null,
    oriGrid: null,
    xSpeed: 0,
    ySpeed: 0,
    state: null,
    lastState: null,
    speed: 0,
    arriveCallBack: null,
    updateCallBack: null,
    moveAction: null,
    _isArrived: false,
    _isLockJustPass: false,

    ctor: function( img, layer ) {
        this._super( img );
        this.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: 0,
            y: 0,
            scale: 1.25
        });
        this.map = layer.map;
        this.layer = layer;
        this.setState( Mover.STATE.IDLE );
        this._isArrived = false;
        this.scheduleUpdate();
    },

    setType: function( type ) {
        this.type = type;
    },

    highLight: function( t1, t2 ) {
        var oriScale = this.getScale();
        this.runAction(cc.sequence(
            cc.scaleTo( t1, 3*oriScale ),
            cc.scaleTo( t2, oriScale )
        ));
    },

    startMove: function() {
        if( this.state == Mover.STATE.MOVE ) return;
        this.realGrid = Util.world2Grid(this.getPosition());
        if (!this.canChangeDir(this.curGrid, this.curDir)) return;
        this.setState(Mover.STATE.MOVE);
        this._updateNextGrid();
        this._toNextGrid();
    },

    stopMove: function() {
        this.setState( Mover.STATE.IDLE );
        this.lastState = Mover.STATE.IDLE;
        this._stopMoveAction();
    },

    pauseMove: function() {
        this.lastState = this.state;
        this.setState( Mover.STATE.PAUSE );
        this._stopMoveAction();
    },

    continueMove: function() {
        this.setState( Mover.STATE.IDLE );
        //if( this.lastState == Mover.STATE.IDLE ) return;
        this.changeDir( this.nextDir );
    },

    setState: function( state ) {
        this.state = state;
    },

    update: function( dt ) {
        if( this.updateCallBack != null ) {
            this.updateCallBack( dt );
        }
    },

    collideRect: function( x, y ) {
        return cc.rect(x - 10, y - 10, 20, 20);
    },

    onArriveNextGrid: function() {
        this.setCurGrid( this.nextGrid );
        if( this.canChangeDir( this.curGrid, this.nextDir ) ) {
            this._setCurDir( this.nextDir );
            if( this.type == Mover.TYPE.THIEF ) {
                this.layer.onThiefTurn();
            }
        }
        this._updateNextGrid();
        if( !this.layer.canPass( this.nextGrid ) ) {
            this.stopMove();
        } else {
            //this._storeNextDir( this.curDir );
            this._toNextGrid( this.curDir );
        }
        if( this.arriveCallBack ) {
            this.arriveCallBack();
        }
    },

    setCurGrid: function( grid ) {
        if( this.curGrid == null ) {
            this.oriGrid = grid;
        }
        this.curGrid = grid;
        this.setPosition( Util.grid2World( grid ) );
    },

    lockJustPass: function( time ) {
        this._isLockJustPass = true;
        this.schedule( function(){
            this._isLockJustPass = false;
        }, time, 0 );
    },

    isAlmostArrive: function() {
        var g = Util.grid2World( this.nextGrid );
        var p = this.getPosition();
        if( Util.getManDist( g, p ) < Def.GRID_SIZE * 0.6  ) {
            return true;
        }
        return false;
    },

    isJustPass: function( param ) {
        if( this._isLockJustPass ) return false;
        var g = Util.grid2World( this.getRealGrid() );
        var p = this.getPosition();
        var ret = false;
        var isHoriz = false;
        if( Math.abs(p.y- g.y) > Math.abs(p.x- g.x) ) {
            isHoriz = true;
        }
        if( isHoriz ) {
            if( this.curDir == Def.UP && p.y - g.y > 0 ) {
                if( param ) {
                    param.dist = p.y - g.y;
                }
                ret = true;
            } else if( this.curDir == Def.DOWN && p.y - g.y < 0 ) {
                if( param ) {
                    param.dist = g.y - p.y;
                }
                ret = true;
            }
        } else {
            if( this.curDir == Def.RIGHT && p.x - g.x > 0 ) {
                if( param ) {
                    param.dist = p.x - g.x;
                }
                ret = true;
            } else if( this.curDir == Def.LEFT && p.x - g.x < 0 ) {
                if( param ) {
                    param.dist = g.x - p.x;
                }
                ret = true;
            }
        }
        return ret;
    },

    getRealGrid: function() {
        var p = Util.world2Grid( this.getPosition() );
        p.x = p.x > this.map.width-1 ? p.x - this.map.width : p.x;
        p.x = p.x < 0 ? 0 : p.x;
        p.y = p.y > this.map.height-1 ? p.y - this.map.height : p.y;
        p.y = p.y < 0 ? 0 : p.y;
        return this.map.grids[p.x][p.y];
    },

    _updateNextGrid: function() {
        var offset = this.getNextGridOffset( this.curDir );
        var nextGrid = this.layer.getOffsetGrid( this.curGrid, offset );
        this.nextGrid = nextGrid;
    },

    _setCurDir: function( dir ) {
        this.curDir = dir;
    },

    _stopMoveAction: function() {
        if( this.moveAction ) {
            this.stopAction( this.moveAction );
            this.moveAction = null;
        }
    },

    _toNextGrid: function() {
        this._stopMoveAction();
        var self = this;
        var nextPos = Util.grid2World( this.nextGrid )
        var pos = this.getPosition();
        // jump map
        if( !Util.isNearPos( pos, nextPos ) ) {
            var dir = this.layer.getRelativeDir( Util.world2Grid(pos), this.nextGrid );
            dir = Util.getOppositeDir( dir );
            var tmpPos = {x: 0, y: 0};
            switch (dir) {
                case Def.UP:
                    tmpPos.x = pos.x;
                    tmpPos.y = pos.y + Def.GRID_SIZE / 2;
                    nextPos.x = pos.x;
                    nextPos.y = nextPos.y - Def.GRID_SIZE / 2;
                    break;
                case Def.DOWN:
                    tmpPos.x = pos.x;
                    tmpPos.y = pos.y - Def.GRID_SIZE / 2;
                    nextPos.x = pos.x;
                    nextPos.y = nextPos.y + Def.GRID_SIZE / 2;
                    break;
                case Def.LEFT:
                    tmpPos.x = pos.x - Def.GRID_SIZE / 2;
                    tmpPos.y = pos.y;
                    nextPos.x = pos.x + Def.GRID_SIZE / 2;
                    nextPos.y = nextPos.y;
                    break;
                case Def.RIGHT:
                    tmpPos.x = pos.x + Def.GRID_SIZE / 2;
                    tmpPos.y = pos.y;
                    nextPos.x = pos.x - Def.GRID_SIZE / 2;
                    nextPos.y = nextPos.y;
                    break;
            }
            var time = Util.getManDist( tmpPos, pos ) / this.speed;
            var moveAction = this.runAction(cc.sequence(
                cc.moveTo( time, tmpPos ),
                cc.callFunc( function(){
                    self.onJumpMap( nextPos );
                } )
            ));
            this.moveAction = moveAction;
            return;
        }
        // normal
        var time = Util.getManDist( nextPos, pos ) / this.speed;
        var moveAction = this.runAction(cc.sequence(
            cc.moveTo( time, nextPos ),
            cc.callFunc( function(){
                self.onArriveNextGrid();
            } )
        ));
        this.moveAction = moveAction;
    },

    onJumpMap: function( nextPos ) {
        this.setPosition( nextPos );
        this._toNextGrid();
    },

    changeDir: function( dir ) {
        // if idle
        if( this.state == Mover.STATE.IDLE && this.canChangeDir( this.curGrid, dir ) ) {
            this._storeNextDir( dir );
            this.curDir = this.nextDir;
            this.startMove();
            return;
        }
        if( this.state == Mover.STATE.PAUSE ) {
            this._storeNextDir( dir );
            return;
        }
        if( this.isTurnBack( dir ) ) {
            this.turnBack();
        }else {
            var param = {};
            if (this.isJustPass(param) &&
                this.canChangeDir(this.getRealGrid(), dir) &&
                this.curDir != dir) {
                //this.lockJustPass( 0.1 );
                if (param.dist > 10 || true) {
                    this.turnBack();
                    this._storeNextDir(dir);
                    this._isArrived = false;
                } else {
                    this.setPosition(Util.grid2World(this.getRealGrid()));
                    this.curDir = dir;
                    this._storeNextDir(dir);
                    this.nextGrid = this.curGrid;
                    this.startMove();
                }
                return;
            }
            this._storeNextDir( dir );
        }
    },

    changeDirInstant: function( dir ) {
        var curGrid = this.getRealGrid();
        if( !this.canChangeDir( curGrid, dir ) ) {
            return false;
        }
        this.curDir = dir;
        this._storeNextDir( dir );
        this.setCurGrid( curGrid );
        //this.curGrid = curGrid;
        this._updateNextGrid();
        this._toNextGrid();
        return true;
    },

    _storeNextDir: function( dir ) {
        this.nextDir = dir;
    },

    isTurnBack: function( dir ) {
        if( this.curDir == Util.getOppositeDir( dir ) ) {
            return true;
        }
        return false;
    },

    turnBack: function() {
        var dir = Util.getOppositeDir( this.curDir );
        this.curDir = dir;
        this._storeNextDir( dir );
        this.nextGrid = this.curGrid;
        this._toNextGrid();
    },

    canChangeDir: function( grid, dir ) {
        var offset = this.getNextGridOffset( dir );
        var nextGrid = this.layer.getOffsetGrid( grid, offset );
        if( !this.layer.canPass( nextGrid ) ) {
            return false;
        }
        return true;
    },

    getCrossDirs: function( dir ) {
        var newDirs = [];
        switch ( dir ) {
            case Def.UP:
                newDirs.push( Def.LEFT );
                newDirs.push( Def.RIGHT );
                break;
            case Def.DOWN:
                newDirs.push( Def.LEFT );
                newDirs.push( Def.RIGHT );
                break;
            case Def.LEFT:
                newDirs.push( Def.UP );
                newDirs.push( Def.DOWN );
                break;
            case Def.RIGHT:
                newDirs.push( Def.UP );
                newDirs.push( Def.DOWN );
                break;
        }
        return newDirs;
    },

    getNextGridOffset: function( dir ) {
        switch ( dir ) {
            case Def.UP:
                return { x: 0, y: 1 };
            case Def.LEFT:
                return { x: -1, y: 0 };
            case Def.RIGHT:
                return { x: 1, y: 0 };
            case Def.DOWN:
                return { x: 0, y: -1 };
        }
        return { x: 0, y: 0 };
    }
});

Mover.ARRIVE_DIST = 1;
Mover.STATE = {
    IDLE: 0,
    MOVE: 1,
    PAUSE: 2
};
Mover.PASS_THRESH = 5;
Mover.TYPE = {
    THIEF: 1, GUARD: 2
};