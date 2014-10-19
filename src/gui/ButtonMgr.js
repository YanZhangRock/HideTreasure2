/**
 * Created by Rock on 9/21/14.
 */

var ButtonMgr = cc.Layer.extend({
    btns: [],
    touchedBtn: null,

    ctor: function(  ) {
        this._super();
        this._init();
        this._registerInput();
    },

    _init: function() {
        this.btns = [];
        this.touchedBtn = null;
    },

    onDelete: function() {
        cc.eventManager.removeAllListeners();
        this._init();
    },

    addButton: function( btn ) {
        this.btns.push( btn );
        this.addChild( btn );
    },

    _registerInput: function() {
        var self = this;
        // touch
        cc.eventManager.addListener({
            prevTouchId: -1,
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan:function (touches, event) {
                self.onTouchBegan( touches[0], event );
            },
            onTouchesEnded:function (touches, event) {
                self.onTouchEnded( touches[0], event );
            }
        }, this);
    },

    onTouchBegan: function( touch, event ) {
        var loc = touch.getLocation();
        for( var i in this.btns ) {
            var btn = this.btns[i];
            var btnLoc = btn.getPosition();
            if( loc.x <= btnLoc.x+btn.myWidth/2 && loc.x >= btnLoc.x-btn.myWidth/2
                && loc.y <= btnLoc.y+btn.myHeight/2 && loc.y >= btnLoc.y-btn.myHeight/2
                && btn.isVisible() ) {
                this.touchedBtn = btn;
                btn.onTouchBegan( touch );
                break;
            }
        }
    },

    onTouchEnded: function( touch, event ) {
        var btn = this.touchedBtn;
        if ( !btn ) return;
        var loc = touch.getLocation();
        var btnLoc = btn.getPosition();
        var isOut = true;
        if( loc.x <= btnLoc.x+btn.myWidth/2 && loc.x >= btnLoc.x-btn.myWidth/2
            && loc.y <= btnLoc.y+btn.myHeight/2 && loc.y >= btnLoc.y-btn.myHeight/2 ) {
            isOut = false;
        }
        if( btn.isVisible() ) {
            btn.onTouchEnded( touch, isOut );
        }
        this.touchedBtn = null;
    }
});