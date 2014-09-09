/**
 * Created by Rock on 8/20/14.
 */

var Guard = Mover.extend({
    aiState: null,
    thief: null,
    speedType: null,
    lv: 0,

    ctor: function( layer ) {
        this._super( "#guard.png", layer );
        this.aiState = Guard.AI_STATE.IDLE;
        this.arriveCallBack = this.onArriveGrid;
        this.updateCallBack = this.onUpdate;
    },

    init: function() {
        this.aiState = Guard.AI_STATE.IDLE;
        this.changeSpeed( Guard.PATROL_SPEED );
        this.startPatrol();
    },

    stopAI: function() {
        this.aiState = Guard.AI_STATE.IDLE;
        this.stopMove();
    },

    onUpdate: function( dt ) {
        switch ( this.aiState ) {
            case Guard.AI_STATE.PATROL:
                this.processPatrol();
                break;
            case Guard.AI_STATE.CHASE:
                this.processChase();
                break;
            case Guard.AI_STATE.RETURN:
                this.processReturn();
                break;
        }
    },

    onArriveGrid: function() {
        switch ( this.aiState ) {
            case Guard.AI_STATE.PATROL:
                this.onArriveGridPatrol();
                break;
            case Guard.AI_STATE.CHASE:
                this.onArriveGridChase();
                break;
            case Guard.AI_STATE.RETURN:
                this.onArriveGridReturn();
                break;
        }
    },

    onThiefArriveGrid: function() {
    },

    startPatrol: function() {
        this.changeSpeed( Guard.PATROL_SPEED );
        this.aiState = Guard.AI_STATE.PATROL;
        var dir = this.getRandMovableDir( this.getRealGrid() );
        if( dir == null ) return;
        this.curDir = dir;
        this.nextDir = dir;
        this.updateNextGrid();
        this.updateSpeed();
        this.startMove();
    },

    processPatrol: function() {
        var guardGrid = this.getRealGrid();
        var thiefGrid = this.thief.getRealGrid();
        if( this.layer.isGridVisible( guardGrid, thiefGrid ) ) {
            this.changeDir( this.layer.getRelativeDir( guardGrid, thiefGrid ) );
            this.startChase();
        }
        if( this.state == Mover.STATE.IDLE ) {
            this.startReturn();
        }
    },

    onArriveGridPatrol: function() {
        if( Util.getManDist( this.getRealGrid(), this.oriGrid ) >= Guard.PATROL_DIST
            || this.state == Mover.STATE.IDLE ) {
            this.curDir = this.getOppositeDir( this.curDir );
            this.nextDir = this.curDir;
            this.updateSpeed();
            this.startMove();
        } else if( this.getRealGrid() == this.oriGrid ) {
            this.startPatrol();
        }
    },

    startChase: function() {
        this.changeSpeed( Guard.CHASE_FAST );
        this.aiState = Guard.AI_STATE.CHASE;
        this.startMove();
    },

    processChase: function() {
        if( this.state == Mover.STATE.IDLE ) {
            this.startReturn();
        }
    },

    onArriveGridChase: function() {
        // keep fast chasing
        if( this.layer.isGridVisible( this.getRealGrid(), this.thief.getRealGrid() ) ) {
            this.changeSpeed( Guard.CHASE_FAST );
        }
        // when arrive crossroad
        if( this.isCrossRoad( this.getRealGrid(), this.curDir ) ) {
            if( !this.layer.isGridVisible( this.getRealGrid(), this.thief.getRealGrid() ) ) {
                // slow down when out of vision
                this.changeSpeed( Guard.CHASE_SLOW );
                if( Util.getManDist( this.getRealGrid(), this.thief.getRealGrid() ) >= Guard.CHASE_DIST ) {
                    // to return mode when out of dist
                    this.startReturn();
                } else {
                    var dirs = this.layer.getRelativeDirs( this.getRealGrid(), this.thief.getRealGrid() );
                    if( !this.changeDirInstant( dirs[0] ) ){
                        if( !this.changeDirInstant( dirs[1] ) ) {
                            this.startReturn();
                        }
                    }
                }
            } else {
                var dirs = this.layer.getRelativeDirs( this.getRealGrid(), this.thief.getRealGrid() );
                if( !this.changeDirInstant( dirs[0] ) ){
                    if( !this.changeDirInstant( dirs[1] ) ) {
                        this.startReturn();
                    }
                }
            }
        }
    },

    startReturn: function() {
        this.changeSpeed( Guard.PATROL_SPEED );
        this.aiState = Guard.AI_STATE.RETURN;
        this.changeDirInstant( this.layer.getRelativeDir( this.getRealGrid(), this.oriGrid ) );
        this.startMove();
    },

    processReturn: function() {
        var guardGrid = this.getRealGrid();
        var thiefGrid = this.thief.getRealGrid();
        if( this.layer.isGridVisible( guardGrid, thiefGrid ) ) {
            this.changeDir( this.layer.getRelativeDir( guardGrid, thiefGrid ) );
            this.startChase();
        }
        if( this.state == Mover.STATE.IDLE ) {
            this.startReturn();
        }
    },

    onArriveGridReturn: function() {
        if( this.getRealGrid() == this.oriGrid ) {
            this.startPatrol();
            return;
        }
        if( this.isCrossRoad( this.getRealGrid(), this.curDir ) ) {
            var dirs = this.layer.getRelativeDirs( this.getRealGrid(), this.oriGrid );
            if( !this.changeDirInstant( dirs[0] ) ) {
                this.changeDirInstant( dirs[1] );
            }
        }
    },

    getRandMovableDir: function( grid ) {
        var dirs = [ Def.UP, Def.DOWN, Def.LEFT, Def.RIGHT ];
        var movableDirs = [];
        for( var i in dirs ) {
            if( this.canChangeDir( grid, dirs[i] ) ) {
                movableDirs.push( dirs[i] );
            }
        }
        if( movableDirs.length <= 0 ) return null;
        var idx = Math.floor( Math.random() * movableDirs.length );
        return movableDirs[idx];
    },

    isCrossRoad: function( grid, dir ) {
        var newDirs = this.getCrossDirs( dir );
        if( this.canChangeDir( grid, newDirs[0] ) ||
            this.canChangeDir( grid, newDirs[1] ) ) {
            return true;
        }
        return false;
    },

    changeSpeed: function( type ) {
        this.speedType = type;
        this.speed = type[this.lv];
    },

    changeLv: function( lv ) {
        this.lv = lv;
        this.changeSpeed( this.speedType );
    }

});

Guard.PATROL_SPEED = [ 120, 80, 120, 150 ];
Guard.CHASE_SLOW = [ 150, 120, 150, 180 ];
Guard.CHASE_FAST = [ 180, 150, 180, 210 ];
Guard.PATROL_DIST = 3;
Guard.CHASE_DIST = 5;
Guard.AI_STATE = {
    IDLE: 0, PATROL: 1, CHASE: 2, RETURN: 3
};