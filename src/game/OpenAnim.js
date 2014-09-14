/**
 * Created by Rock on 9/13/14.
 */

var OpenAnim = cc.Layer.extend({
    layer: null,
    endCallBack: null,
    thief: null,
    money: null,
    marks: [],
    hand: null,

    ctor: function( layer ) {
        this._super();
        this.layer = layer;
        layer.addChild( this, GameLayer.Z.ANIM );
        this._initObjs();
    },

    _initObjs: function() {
        for( var i in this.layer.moneys ) {
            this.layer.moneys[i].setVisible( false );
        }
        this.layer.thief.setVisible( false );
        var h = 0.6, scale = 2.0;
        // money
        this.money = new cc.Sprite( "#money.png" );
        this.money.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * (0.4),
            y: g_size.height * h,
            scale: Def.GRID_SCALE * scale
        });
        this.money.setVisible( false );
        this.addChild( this.money, 0 );
        // thief
        this.thief = new cc.Sprite( "#thief.png" );
        this.thief.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * (0.2),
            y: g_size.height * h,
            scale: Def.GRID_SCALE * scale
        });
        this.thief.setVisible( false );
        this.addChild( this.thief, 0 );
        // question mark
        this.marks = [];
        for( var i in this.layer.moneys ) {
            var p = this.layer.moneys[i].getPosition();
            var mark = new cc.Sprite( "#question.png" );
            mark.attr({
                anchorX: 0.5,
                anchorY: 0.5,
                x: p.x,
                y: p.y,
                scale: Def.GRID_SCALE
            });
            mark.setVisible( false );
            mark.runAction( cc.fadeOut(0.1) );
            this.marks.push( mark );
            this.addChild( mark, 0 );
        }
    },

    playAnim: function( endCallBack ) {
        this.endCallBack = endCallBack;
        this._moneyRun();
    },

    _moneyRun: function() {
        var time = 0.8;
        var dist = g_size.width * 0.35;
        this.money.setVisible( true );
        var self = this;
        this.money.runAction(cc.sequence(
            cc.moveBy( time, cc.p(dist,0) ),
            cc.callFunc(function () {
                self._onMoneyRunEnd();
            } )
        ));
    },

    _onMoneyRunEnd: function() {
        this._thiefRun();
    },

    _thiefRun: function() {
        var time = 0.8;
        var dist = g_size.width * 0.35;
        this.thief.setVisible( true );
        var self = this;
        this.thief.runAction(cc.sequence(
            cc.moveBy( time, cc.p(dist,0) ),
            cc.callFunc(function () {
                self._onThiefRunEnd();
            } )
        ));
    },

    _onThiefRunEnd: function() {
        this.schedule( this._moneyLeave, 0.5, 0 );
    },

    _moneyLeave: function() {
        this.money.setVisible( true );
        var self = this;
        var time = 0.55;
        var dist = g_size.width * 0.3;
        this.money.runAction(cc.sequence(
            cc.moveBy( time, cc.p(dist,0) ),
            cc.callFunc(function () {
                self._onMoneyLeaveEnd();
            } )
        ));
    },

    _onMoneyLeaveEnd: function() {
        this.money.setVisible( false );
        this._thiefLeave();
    },

    _thiefLeave: function() {
        this.thief.setVisible( true );
        var self = this;
        var time = 0.55;
        var dist = g_size.width * 0.35;
        this.thief.runAction(cc.sequence(
            cc.moveBy( time, cc.p(dist,0) ),
            cc.callFunc(function () {
                self._onThiefLeaveEnd();
            } )
        ));
    },

    _onThiefLeaveEnd: function() {
        this.thief.setVisible( false );
        this.schedule( this._highLightObjs, 0.3, 0 );
    },

    _highLightObjs: function() {
        var t1 = 0.5, t2 = 1.0;
        for( var i in this.layer.moneys ) {
            this.layer.moneys[i].setVisible( true );
            this.layer.moneys[i].highLight( t1, t2 );
        }
        this.layer.thief.setVisible( true );
        this.layer.thief.highLight( t1, t2 );
        this.schedule( function(){
            this._onHightObjsEnd();
        }, t1+t2, 0 );
    },

    _onHightObjsEnd: function() {
        this._showQuestionMark();
    },

    _showQuestionMark: function() {
        var self = this
        var time = 0.8, idx = 0
        var totalTime = 0;
        for( var i in this.marks ) {
            this.schedule(function () {
                var mark = self.marks[idx++];
                mark.setVisible( true );
                mark.runAction( cc. fadeIn( 0.4 ) );
            }, totalTime, 0 );
            totalTime += time;
        }
        this.schedule( function() {
            self._onShowQuestionMarkEnd();
        }, totalTime, 0 );
    },

    _onShowQuestionMarkEnd: function() {
        this.endCallBack();
        this.layer.removeChild( this );
    }
});
