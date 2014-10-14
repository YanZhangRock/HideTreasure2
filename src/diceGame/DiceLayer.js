/**
 * Created by Rock on 10/3/14.
 */

document.addEventListener('WeixinJSBridgeReady', function() {
    //WeixinJSBridge.call('hideOptionMenu');
});

var DiceLayer = cc.Layer.extend({
    scene: null,
    titleLabel: null,
    secretLabel: null,
    numLabel: null,
    btnMgr: null,
    msgBtn: null,
    rollBtn: null,
    msgArray: ["老岩哥的人马，用的特别吊！"],
    myMsg: "",
    msgHandler: null,
    owner: "岩哥",
    uid: 10001,

    ctor: function ( scene ) {
        this._super();
        this.scene = scene;
        this._chooseLanguage();
        document.title = this.txtCfg.title;
        this._loadMsgs();
    },

    onLoadMsgs: function( txt ) {
        this._pargeMsgs( txt );
        this._initLabels();
        this._initButtons();
        this.msgHandler = new StrHandler( this.msgArray );
        this._addWeChatFunc();
    },

    _chooseLanguage: function() {
        this.txtCfg = g_language == Def.CHN ? DiceLayer.CHN : DiceLayer.ENG;
    },

    _addWeChatFunc: function() {
        if( cc.sys.browserType != cc.sys.BROWSER_TYPE_WECHAT ) return;
        var self = this;
        //document.addEventListener('WeixinJSBridgeReady', function() {
            // 隐藏按钮，对应的展示参数是：showOptionMenu
            //WeixinJSBridge.call('hideOptionMenu');
            self.titleLabel.setString("WeixinJSBridgeReady");
            WeixinJSBridge.on('menu:share:appmessage', function (argv) {
                self.onShareToFriends( argv );
                WeixinJSBridge.invoke('sendAppMessage', {
                    "img_url": location.origin+"/HideTreasure2/res/money.png",
                    "img_width": "120",
                    "img_height": "120",
                    "link": location.href,
                    "desc": "这是一段废话",
                    "title": "破碎的秘密"
                }, function () {});
            });
        //});
    },

    onShareToFriends: function(argv) {
        this.titleLabel.setString( typeof(argv) );
    },

    _initLabels: function() {
        // title label
        var label = new cc.LabelTTF( "title", "Arial", 50 );
        label.x = g_size.width * 0.5;
        label.y = g_size.height * 0.8;
        this.titleLabel = label;
        label.setString( this.txtCfg.instr );
        this.addChild( label, DiceLayer.Z.UI );
        // number label
        var label = new cc.LabelTTF( "", "Arial", 80 );
        label.x = g_size.width * 0.5;
        label.y = g_size.height * 0.5;
        this.numLabel = label;
        this.addChild( label, DiceLayer.Z.UI );
        // secret label
        var label = new MyLabel( "123", 50, {x:2.8, y:2.0} );
        label.label.setString( "lalala\nlalala" );
        label.x = g_size.width * 0.50;
        label.y = g_size.height * 0.76;
        this.secretLabel = label;
        this.addChild( label, DiceLayer.Z.UI );
        this.secretLabel.setVisible( false );
    },

    _initButtons: function() {
        var self = this;
        this.btnMgr = new ButtonMgr();
        this.addChild( this.btnMgr, DiceLayer.Z.UI );
        // leave msg btn
        var param = {
            scale: { x: 1.1, y: 0.7 },
            pos: { x: 0.5, y: 0.25 },
            txt: this.txtCfg.leaveMsg,
            fontSize: 36
        }
        var btn = new MyButton( "123", param );
        btn.setCallBack( function() { self.onClickLeaveMsg(); } );
        this.msgBtn = btn;
        //btn.setVisible( false );
        this.btnMgr.addButton( btn );
        // roll dice btn
        var param = {
            scale: { x: 1.4, y: 1.0 },
            pos: { x: 0.5, y: 0.4 },
            txt: this.txtCfg.roll,
            fontSize: 50
        }
        var btn = new MyButton( "123", param );
        btn.setCallBack( function() { self.rollDice(); } );
        this.rollBtn = btn;
        this.btnMgr.addButton( btn );
    },

    _loadMsgs: function() {
        var self = this;
        Util.getHTML( ObjIO.URL+this.uid, function(txt){self.onLoadMsgs(txt)} );
    },

    _pargeMsgs: function( txt ) {
        if( txt == "null" ) return;
        var idx = txt.indexOf("[");
        var content = txt.substr( idx );
        this.msgArray = JSON.parse( content );
    },

    onClickLeaveMsg: function() {
        var self = this;
        this.schedule( function() { self.askMsg(); }, 0.1, 0 );
    },

    askMsg: function() {
        var self = this;
        var msg = Util.createTextField(
            "what's your message?",
            function(){ self.onGetMsg(this); }
        );
        this.addChild( msg, 1 );
    },

    onGetMsg: function( msg ) {
        var msg = msg.getString();
        this.removeChild( msg );
        if(msg.length <= 0) {
            return;
        }
        this.myMsg = msg;
        this.saveMsg();
    },

    rollDice: function() {
        this.secretLabel.setVisible( true );
        this.titleLabel.setString("");
        this.secretLabel.label.setString("");
        var self = this;
        var diceNum = 1;
        var time = 20;
        this.schedule( function() {
            diceNum = diceNum % 6 + 1;
            time--;
            self.numLabel.setString( diceNum );
            if( time < 0 ) {
                self.onRollDiceResult();
            }
        }, 0.015, time );
    },

    onRollDiceResult: function() {
        var num = Math.floor( Math.random() * 6 ) + 1;
        this.numLabel.setString( num );
        var self = this;
        new HighlightEffect( this.numLabel, null, -1, 0.3, 0.5 );
        this.onRollDiceEnd(num);
    },

    onRollDiceEnd: function( num ) {
        var isOK = num == 6 ? true : false;
        if( isOK ) {
            this.secretLabel.label.setString( this.msgHandler.getRealMsg() );
            this.titleLabel.setString( this.owner + this.txtCfg.result );
        } else {
            this.secretLabel.label.setString( this.msgHandler.getMixedMsg() );
            this.titleLabel.setString("");
        }
    },

    saveMsg: function() {
        if( this.myMsg.length <= 0 ) return;
        this.msgArray.push( this.myMsg );
        var self = this;
        Util.postHTML( this.getSaveURL(), JSON.stringify( this.msgArray ),
            function(){
                if( self.onSaveMsg ) {
                    self.onSaveMsg();
                }
            }
        );
    },

    onSaveMsg: function() {
        this.titleLabel.setString("message saved!");
        this.msgHandler.setMsgArray( this.msgArray );
    },

    getSaveURL: function() {
        return ObjIO.URL+this.uid+"&name="+"Rock"+"&mid=0";
    }
})

DiceLayer.Z = {
    UI: 9
};

DiceLayer.CHN = {
    title: "破碎的秘密",
    roll: " 丢你一骰子！",
    leaveMsg: "我也要留秘密",
    instr: "玩法说明：\n\n        骰子丢到6可以看到真正的秘密，\n否则会看到别人的秘密碎了一地...",
    result: "说:\n\n\n"
}