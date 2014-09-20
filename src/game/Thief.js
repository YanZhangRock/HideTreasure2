/**
 * Created by Rock on 8/20/14.
 */
var g_test = 0;

var Thief = Mover.extend({
    guards: [],
    moneys: [],
    traps: [],
    keys: [],
    moneyNum: 0,
    score: 0,
    life: 0,
    keyNum: 0,

    ctor: function( layer ) {
        this._super("#thief.png", layer);
        this.speed = Thief.SPEED[0];
        this.arriveCallBack = this.onArriveGrid;
        this.updateCallBack = this.onUpdate;
        this.keyNum = 0;
        this.addScore( -this.score );
        this.setType( Mover.TYPE.THIEF );
    },

    onUpdate: function( dt ) {
        this.processCollide();
    },

    onArriveGrid: function() {
        for( var i in this.guards ) {
            this.guards[i].onThiefArriveGrid();
        }
        if( this.curGrid.trap ) {
            this.curGrid.trap.onCatch( this );
        }
        if( this.curGrid.money ) {
            this.onGetMoney( this.curGrid.money );
        }
    },

    processCollide: function() {
//        for( var i in this.moneys ) {
//            var money = this.moneys[i];
//            if( this.isCollide( money ) ) {
//                this.onGetMoney( money );
//            }
//        }
        for( var i in this.keys ) {
            var key = this.keys[i];
            if( this.isCollide( key ) ) {
                key.onCatch( this );
            }
        }
        for( var i in this.guards ) {
            var guard = this.guards[i];
            if( this.isCollide( guard ) ) {
                this.onCaught( guard );
            }
        }
        if( this.nextGrid && this.nextGrid.gold ) {
            if( this.isCollide(this.nextGrid.gold) ) {
                this.nextGrid.gold.onPicked( this );
            }
        }
    },

    isCollide: function( obj ) {
        var pos = this.getPosition();
        var ax = pos.x, ay = pos.y, bx = obj.x, by = obj.y;
        if (Math.abs(ax - bx) > Def.GRID_SIZE || Math.abs(ay - by) > Def.GRID_SIZE) {
            return false;
        }
        var aRect = this.collideRect(ax, ay);
        var bRect = obj.collideRect(bx, by);
        return cc.rectIntersectsRect(aRect, bRect);
    },

    onCaught: function( guard ) {
        if( this.layer.state == GameLayer.STATE.END || this.layer.state == GameLayer.STATE.PAUSE ) return;
        if( guard.isHide ) return;
        this.setLife( --this.life )
        if( this.life <=0 ) {
            this.layer.endGame( false );
        } else {
            this.layer.pauseGame();
            this.layer.showReborn( true );
        }
    },

    onGetMoney: function( money ) {
        if( !money.isVisible() ) return;
        if( this.keyNum <= 0 ) {
            this.layer.showNeedKey( true );
            return;
        }
        money.onSteal( this );
        //this.keyNum--;
        Util.arrayRemove( this.moneys, money );
        if( money.isFake ) {
            this.layer.onGetFakeMoney( money );
        } else {
            this.moneyNum++;
            if( this.moneyNum >= this.layer.maxMoney ) {
                this.layer.endGame( true );
            } else {
                this.layer.onGetFragMoney( money );
            }
        }
    },

    setLife: function( life ) {
        this.life = life;
        this.layer.lifeLabel.setString( this.layer.txtCfg.life+this.life );
    },

    addScore: function( score ) {
//        this.score += score;
//        this.layer.scoreLabel.setString( "得分：" + this.score );
    },

    changeLv: function( lv ) {
        this.speed = Thief.SPEED[lv];
    }
});

Thief.SPEED = [ 100, 150 ];
Thief.LIFE = 3;
