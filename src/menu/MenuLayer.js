/**
 * Created by Rock on 9/5/14.
 */

var g_shareMsg = "";

var MenuLayer = cc.Layer.extend({
    scene: null,
    titleLabel: null,
    shareMenu: null,
    startBtn: null,
    shareBtn: null,
    uid: 2001,
    owner: "Alien",
    challenger: "SB",
    textField: null,
    hasName: false,
    txtCfg: null,
    btnMgr: null,

    ctor: function ( scene ) {
        this._super();
        this.scene = scene;
        this._initBackground();
        //this._initTitleLabel();
        this._loadUserID();
        this._chooseLanguage();
        this._loadOwner();
        document.title = this.txtCfg.title;
        g_shareMsg = this.getShareResultStr();
        this._addWeChatFunc();
    },

    onLoadOwner: function( txt ) {
        this._parseOwner( txt )
        this._initTitleLabel();
        this._initButtons();
        this._initShareMenu();
//        if( Def.ASK_NAME ) {
//            this._askChallengerName();
//        }
        if( !Def.USE_MENU ) {
            this.startGame();
        }
    },

    _addWeChatFunc: function() {
        document.addEventListener('WeixinJSBridgeReady', function() {
            // 隐藏按钮，对应的展示参数是：showOptionMenu
            //WeixinJSBridge.call('hideOptionMenu');

            WeixinJSBridge.on('menu:share:appmessage', function (argv) {
                WeixinJSBridge.invoke('sendAppMessage', {
                    "img_url": location.origin+"/HideTreasure2/res/money.png",
                    "img_width": "120",
                    "img_height": "120",
                    "link": location.href,
                    "desc": g_shareMsg,
                    "title": document.title
                }, function () {});
            });
        });
    },

    _chooseLanguage: function() {
        this.txtCfg = g_language == Def.CHN ? MenuLayer.CHN : MenuLayer.ENG;
    },

    _askChallengerName: function() {
        var self = this;
        var msg = Util.createTextField(
            this.txtCfg.name,
            function(){ self._onGetChallengerName(this); }
        );
        this.addChild( msg, MenuLayer.Z.FIELD );
    },

    _onGetChallengerName: function( msg ) {
        var name = msg.getString();
        this.removeChild( msg );
        if(name.length <= 0) {
            return;
        }
        this.challenger = name;
        this.hasName = true;
        this.startGame();
    },

    _initBackground: function() {
        var sprite = new cc.Sprite( "#menuback.png" );
        sprite.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * 0.5,
            y: g_size.height * 0.5,
            scale: Def.IMG_SCALE
        });
        this.addChild( sprite, MenuLayer.Z.BACK );
    },

    _initTitleLabel: function() {
        var w = 0.5, h = 0.8
        var label = new cc.LabelTTF(this.owner+this.txtCfg.title1, "Arial", 80);
        label.x = g_size.width * w;
        label.y = g_size.height * h;
        this.titleLabel = label;
        this.addChild( label, MenuLayer.Z.UI );
        label.color = Def.COLOR.GREEN;
        var sprite = new cc.Sprite( "#msgbox1.png" );
        sprite.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: g_size.width * w,
            y: g_size.height * h,
            scale: Def.IMG_SCALE
        });
        this.addChild( sprite, MenuLayer.Z.UI_IMG );
    },

    _initButtons: function() {
        var self = this;
        // button manager
        this.btnMgr = new ButtonMgr();
        this.addChild( this.btnMgr, MenuLayer.Z.UI );
        // start button
        var btn = new MyButton( this.txtCfg.title2 );
        btn.x = g_size.width * 0.5;
        btn.y = g_size.height * 0.6;
        btn.setCallBack( function() { self.onClickStart(); } );
        this.startBtn = btn;
        this.btnMgr.addButton( btn );
        // share button
        var btn = new MyButton( this.txtCfg.title3 );
        btn.x = g_size.width * 0.5;
        btn.y = g_size.height * 0.4;
        btn.setCallBack( function() { self.onClickShare(); } );
        this.shareBtn = btn;
        this.btnMgr.addButton( btn );
    },

    onClickStart: function() {
        if( Def.ASK_NAME ) {
            if( this.hasName ) {
                this.startGame();
            } else {
                var self = this;
                this.schedule( function() { self._askChallengerName(); }, 0.1, 0 );
            }
        } else {
            this.startGame();
        }
    },

    onClickShare: function() {
        this.addCoverBtn();
        this.shareSprite = new cc.Sprite( res.Share );
        this.shareSprite.attr({
            x: g_size.width * 0.7,
            y: g_size.height * 0.9,
            scale: 1.0
        });
        this.addChild( this.shareSprite, MenuLayer.Z.SHARE );
    },

    _initShareMenu: function() {
        var label = new cc.LabelTTF(this.txtCfg.title3, "Arial", 60);
        var self = this;
        var save = new cc.MenuItemLabel( label,
            function(){
                self.shareResult();
            }
        );
        var menu = new cc.Menu( save );
        menu.x = g_size.width * 0.5;
        menu.y = g_size.height * 0.4;
        this.shareMenu = menu;
        //this.addChild( menu, MenuLayer.Z.UI );
    },

    getShareResultStr: function() {
        var str = this.txtCfg.share1 + this.owner + this.txtCfg.share2;
        return str;
    },

    addCoverBtn: function() {
        var self = this;
        var btn = new cc.MenuItemImage(
            res.Grey,
            res.Grey,
            function () {
                self.cancelShare();
            }, this);
        btn.attr({
            x: g_size.width * 0.5,
            y: g_size.height * 0.5,
            anchorX: 0.5,
            anchorY: 0.5
        });
        this.shareMenu = new cc.Menu(btn);
        this.shareMenu.x = 0;
        this.shareMenu.y = 0;
        this.shareMenu.setOpacity(180);
        this.shareMenu.setScale(100);
        this.addChild(this.shareMenu, MenuLayer.Z.UI);
    },

    cancelShare: function() {
        this.removeChild( this.shareMenu );
        if( this.shareSprite == null ) return;
        this.removeChild( this.shareSprite );
        this.shareSprite = null;
    },

    _loadUserID: function() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for(var i = 0; i < strs.length; i ++) {
                theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);
            }
            this.uid = theRequest["uid"];
            if( theRequest["lan"] ) {
                g_language = theRequest["lan"] == "e" ? Def.ENG : Def.CHN;
            }
        }
    },

    _loadOwner: function() {
        var self = this;
        Util.getHTML( ObjIO.URL+this.uid, function(txt){self.onLoadOwner(txt)} );
    },

    _parseOwner: function( txt ) {
        if( txt == "null" ) return;
        var idx = txt.indexOf("{");
        var content = txt.substr( idx );
        var rawObjsData = JSON.parse( content );
        if( rawObjsData["owner"] ) {
            this.owner = rawObjsData["owner"];
        }
    },

    startGame: function() {
        var scene = this.scene;
        cc.eventManager.removeAllListeners();
        scene.removeChild( scene.layer );
        scene.layer = new GameLayer( scene, this.uid, this.challenger );
        //scene.layer = new EditorLayer( scene, this.uid, this.challenger );
        scene.addChild( scene.layer );
    }
});

MenuLayer.Z = {
    BACK: 100,
    UI_IMG: 200,
    UI: 201,
    SHARE: 202,
    FIELD: 300

};

MenuLayer.ENG = {
    title: "Talkable Fortune",
    title1: "'s secret",
    title2: "find out",
    title3: "share to WeChat",
    name: "May I have your name:",
    share1: "I ",
    share2: " hide my secret in the mysterious forest. Can you find it?"
};
MenuLayer.CHN = {
    title: "会说话的宝藏",
    title1: "的秘密",
    title2: "一探究竟",
    title3: "分享到微信",
    name: "来者报上大名：",
    share1: "我",
    share2: "在神秘森林埋下了一个秘密，你们有本事抢过来看看吗？！"
};