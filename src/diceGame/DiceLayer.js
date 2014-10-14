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
    btnMgr: null,
    msgBtn: null,
    inputMenu: null,
    rollMenu: null,
    saveMenu: null,
    msgArray: ["老岩哥的人马，用的特别吊！"],
    myMsg: "",
    msgHandler: null,
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
        this._initMenus();
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
        var label = new cc.LabelTTF( "title", "Arial", 60 );
        label.x = g_size.width * 0.5;
        label.y = g_size.height * 0.8;
        this.titleLabel = label;
        this.addChild( label, 0 );
        // secret label
        var label = new cc.LabelTTF( "lalala", "Arial", 60 );
        label.x = g_size.width * 0.5;
        label.y = g_size.height * 0.7;
        this.secretLabel = label;
        this.addChild( label, 0 );
    },

    _initButtons: function() {
        var self = this;
        this.btnMgr = new ButtonMgr();
        this.addChild( this.btnMgr, DiceLayer.Z.UI );
        // leave msg btn
        var btn = new MyButton( "123", {x:1.2, y:0.8} );
        btn.label.setString( this.txtCfg.leaveMsg );
        btn.x = g_size.width * 0.50;
        btn.y = g_size.height * 0.30;
        btn.label.setFontSize( 40 );
        btn.setCallBack( function() { self.onClickLeaveMsg(); } );
        this.msgBtn = btn;
        //btn.setVisible( false );
        this.btnMgr.addButton( btn );
    },

    _initMenus: function() {
        // input menu
//        var label = new cc.LabelTTF("leave msg", "Arial", 60);
//        var self = this;
//        var menuLabel = new cc.MenuItemLabel( label,
//            function(){
//                self.onClickLeaveMsg();
//            }
//        );
//        var menu = new cc.Menu( menuLabel );
//        menu.x = g_size.width * 0.5;
//        menu.y = g_size.height * 0.3;
//        this.inputMenu = menu;
//        this.addChild( menu, 0 );
        // roll menu
        var label = new cc.LabelTTF("roll dice", "Arial", 60);
        var self = this;
        var menuLabel = new cc.MenuItemLabel( label,
            function(){
                self.rollDice();
            }
        );
        var menu = new cc.Menu( menuLabel );
        menu.x = g_size.width * 0.5;
        menu.y = g_size.height * 0.4;
        this.rollMenu = menu;
        this.addChild( menu, 0 );
        // save menu
        var label = new cc.LabelTTF("save msg", "Arial", 60);
        var self = this;
        var menuLabel = new cc.MenuItemLabel( label,
            function(){
                self.saveMsg();
            }
        );
        var menu = new cc.Menu( menuLabel );
        menu.x = g_size.width * 0.5;
        menu.y = g_size.height * 0.2;
        this.saveMenu = menu;
        //this.addChild( menu, 0 );
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
        this.secretLabel.setString( this.msgHandler.getMixedMsg() );
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
    leaveMsg: "我也要留秘密",
    instr: "玩法说明"
}