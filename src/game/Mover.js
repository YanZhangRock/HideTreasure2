/**
 * Created by Rock on 8/20/14.
 */

var Mover = cc.Sprite.extend({
    map: null,
    layer: null,
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
    _isArrived: false,

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
        this.state = Mover.STATE.IDLE;
        this._isArrived = false;
        this.scheduleUpdate();
    },

    startMove: function() {
        if( this.state == Mover.STATE.MOVE ) return;
        this.realGrid = Util.world2Grid( this.getPosition() );
        if( !this.canChangeDir( this.curGrid, this.curDir ) ) return;
        this.state = Mover.STATE.MOVE;
        this.updateNextGrid();
        this.updateSpeed();
    },

    stopMove: function() {
        this.state = Mover.STATE.IDLE;
        this.lastState = Mover.STATE.IDLE;
    },

    pauseMove: function() {
        this.lastState = this.state;
        this.state = Mover.STATE.PAUSE;
    },

    continueMove: function() {
        if( this.lastState == Mover.STATE.IDLE ) return;
        this.state = Mover.STATE.IDLE;
        this.changeDir( this.nextDir );
    },

    update: function( dt ) {
        if( this.updateCallBack != null ) {
            this.updateCallBack( dt );
        }
        this.processMove( dt );
    },

    collideRect: function( x, y ) {
        return cc.rect(x - 10, y - 10, 20, 20);
    },

    processMove: function( dt ) {
        if( this.state != Mover.STATE.MOVE ) return;
        var p = this.getPosition();
        var grid = this.nextGrid;
        if( this._isArrived ) {
            grid = this.curGrid;
        }
        var dist = Util.getManDist( p, Util.grid2World(grid) );
        if( dist >= Mover.ARRIVE_DIST && this._isArrived ) {
            this._isArrived = false;
        }
        if( dist < Mover.ARRIVE_DIST && !this._isArrived ) {
            this._isArrived = true;
            this.onArriveNextGrid();
            this.setPosition( Util.grid2World( this.curGrid ) );
            if( !this.layer.canPass( this.nextGrid ) ) {
                this.stopMove();
            }
            if( this.arriveCallBack ) {
                this.arriveCallBack();
            }
            return;
        }
        p.x += this.xSpeed * dt;
        p.y += this.ySpeed * dt;
        // jump map
        var curP = Util.grid2World(this.curGrid);
        if( Math.abs( p.x - curP.x ) > Def.GRID_SIZE ||
            Math.abs( p.y - curP.y ) > Def.GRID_SIZE ) {
            this.updateNextGrid();
            var nextP = Util.grid2World( this.nextGrid );
            p.x = nextP.x;
            p.y = nextP.y;
        }
        this.setPosition( p );
    },

    onArriveNextGrid: function() {
        this.setCurGrid( this.nextGrid );
        if( this.canChangeDir( this.curGrid, this.nextDir ) ) {
            this.curDir = this.nextDir;
        }
        this.updateNextGrid();
        this.updateSpeed();
    },

    setCurGrid: function( grid ) {
        if( this.curGrid == null ) {
            this.oriGrid = grid;
        }
        this.curGrid = grid;
        this.setPosition( Util.grid2World( grid ) );
    },

    isJustPass: function() {
        var g = Util.grid2World( this.getRealGrid() );
        var p = this.getPosition();
        var ret = false;
        var isHoriz = false;
        if( Math.abs(p.y- g.y) > Math.abs(p.x- g.x) ) {
            isHoriz = true;
        }
        if( isHoriz ) {
            if( this.curDir == Def.UP && p.y - g.y > 0 ) {
                ret = true;
            } else if( this.curDir == Def.DOWN && p.y - g.y < 0 ) {
                ret = true;
            }
        } else {
            if( this.curDir == Def.RIGHT && p.x - g.x > 0 ) {
                ret = true;
            } else if( this.curDir == Def.LEFT && p.x - g.x < 0 ) {
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

    updateNextGrid: function() {
        var offset = this.getNextGridOffset( this.curDir );
        var nextGrid = this.layer.getOffsetGrid( this.curGrid, offset );
        this.nextGrid = nextGrid;
    },

    changeDir: function( dir ) {
        if( this.state == Mover.STATE.PAUSE ) {
            this.storeNextDir( dir );
            return;
        }
        if( this.isTurnBack( dir ) ) {
            this.turnBack();
        } else {
            if( this.isJustPass() && this.canChangeDir( this.getRealGrid(), dir ) ) {
                this.turnBack();
            }
            this.storeNextDir( dir );
            if( this.state == Mover.STATE.IDLE && this.canChangeDir( this.curGrid, dir ) ) {
                this.curDir = this.nextDir;
                this.startMove();
            }
        }
    },

    changeDirInstant: function( dir ) {
        if( !this.canChangeDir( this.getRealGrid(), dir ) ) {
               return false;
            }
        this.curDir = dir;
        this.storeNextDir( dir );
        this.nextGrid = this.curGrid;
        this.updateSpeed();
        this.startMove();
        return true;
    },

    storeNextDir: function( dir ) {
        this.nextDir = dir;
    },

    isTurnBack: function( dir ) {
        if( this.curDir == this.getOppositeDir( dir ) ) {
            return true;
        }
        return false;
    },

    turnBack: function() {
        var dir = this.getOppositeDir( this.curDir );
        this.curDir = dir;
        this.storeNextDir( dir );
        this.nextGrid = this.curGrid;
        this.updateSpeed();
        this.startMove();
    },

    canChangeDir: function( grid, dir ) {
        var offset = this.getNextGridOffset( dir );
        var nextGrid = this.layer.getOffsetGrid( grid, offset );
        if( !this.layer.canPass( nextGrid ) ) {
            return false;
        }
        return true;
    },

    getOppositeDir: function( dir ) {
        var newDir;
        switch ( dir ) {
            case Def.UP:
                newDir = Def.DOWN;
                break;
            case Def.DOWN:
                newDir = Def.UP;
                break;
            case Def.LEFT:
                newDir = Def.RIGHT;
                break;
            case Def.RIGHT:
                newDir = Def.LEFT;
                break;
        }
        return newDir;
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

    updateSpeed: function() {
        switch ( this.curDir ) {
            case Def.UP:
                this.xSpeed = 0;
                this.ySpeed = this.speed;
                break;
            case Def.LEFT:
                this.xSpeed = -this.speed;
                this.ySpeed = 0;
                break;
            case Def.RIGHT:
                this.xSpeed = this.speed;
                this.ySpeed = 0;
                break;
            case Def.DOWN:
                this.xSpeed = 0;
                this.ySpeed = -this.speed;
                break;
        }
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

Mover.ARRIVE_DIST = 0.5;
Mover.STATE = {
    IDLE: 0,
    MOVE: 1,
    PAUSE: 2
};
Mover.PASS_THRESH = 5;