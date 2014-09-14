/**
 * Created by Rock on 9/5/14.
 */

var MenuLayer = cc.Layer.extend({
    scene: null,
    titleLabel: null,
    startMenu: null,
    shareMenu: null,
    uid: 2001,
    owner: "Alien",
    challenger: "SB",
    textField: null,
    hasName: false,
    txtCfg: null,

    ctor: function ( scene ) {
        this._super();
        this.scene = scene;
        document.title = MenuLayer.TITLE;
        //this._initTitleLabel();
        this._loadUserID();
        this._chooseLanguage();
        this._loadOwner();
    },

    onLoadOwner: function( txt ) {
        this._parseOwner( txt )
        this._initTitleLabel();
        this._initStartMenu();
        this._initShareMenu();
        if( Def.ASK_NAME ) {
            this._askChallengerName();
        }
        //this._askChallengerName();
        // test
        if( !Def.USE_MENU ) {
            this.startGame();
        }
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
        this._initStartMenu();
        if(name.length <= 0) {
            return;
        }
        this.challenger = name;
        this.hasName = true;
        //this.startGame();
    },

    _initTitleLabel: function() {
        var label = new cc.LabelTTF(this.owner+this.txtCfg.title1, "Arial", 80);
        label.x = g_size.width * 0.5;
        label.y = g_size.height * 0.8;
        this.titleLabel = label;
        this.addChild( label, MenuLayer.Z.UI );
    },

    _initStartMenu: function() {
        if( this.startMenu ) {
            this.removeChild( this.startMenu );
        }
        var label = new cc.LabelTTF(this.txtCfg.title2, "Arial", 70);
        var self = this;
        var save = new cc.MenuItemLabel( label,
            function(){
//                if( MenuLayer.MOBILE ) {
//                    if( self.hasName ) {
//                        self.startGame();
//                    } else {
//                        self._askChallengerName();
//                    }
//                } else {
//                    self.startGame();
//                }
                self.startGame();
            }
        );
        var menu = new cc.Menu( save );
        menu.x = g_size.width * 0.5;
        menu.y = g_size.height * 0.6;
        this.startMenu = menu;
        this.addChild( menu, MenuLayer.Z.UI );
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
        this.addChild( menu, MenuLayer.Z.UI );
    },

    shareResult: function() {
        this.addCoverBtn();
        this.shareSprite = new cc.Sprite( res.Share );
        this.shareSprite.attr({
            x: g_size.width * 0.7,
            y: g_size.height * 0.9,
            scale: 1.0
        });
        this.addChild( this.shareSprite, MenuLayer.Z.SHARE );
        document.title = this.getShareResultStr();
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
        document.title = MenuLayer.TITLE;
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
    UI: 200,
    FIELD: 300
};

MenuLayer.TITLE = "Fortune Whisper";
MenuLayer.ENG = {
    title1: "'s secret",
    title2: "find out",
    title3: "share to WeChat",
    name: "May I have your name:",
    share1: "I ",
    share2: " hide my secret in the mysterious forest. Can you find it?"
};
MenuLayer.CHN = {
    title1: "的秘密",
    title2: "一探究竟",
    title3: "分享到微信",
    name: "来者报上大名：",
    share1: "我",
    share2: "在神秘森林埋下了一个秘密，你们有本事抢过来看看吗？！"
};