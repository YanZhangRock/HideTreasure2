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

    ctor: function ( scene ) {
        this._super();
        this.scene = scene;
        document.title = MenuLayer.TITLE;
        this._loadUserID();
        this._loadOwner();
    },

    onLoadOwner: function( txt ) {
        this._parseOwner( txt )
        this._initTitleLabel();
        this._initStartMenu();
        this._initShareMenu();
    },

    _askChallengerName: function() {
        var self = this;
        var msg = Util.createTextField(
            "敢报上你的大名么：",
            function(){ self._onGetChallengerName(this); }
        );
        this.addChild( msg, MenuLayer.Z.FIELD );
    },

    _onGetChallengerName: function( msg ) {
        this.challenger = msg.getString();
        this.startGame();
    },

    _initTitleLabel: function() {
        var label = new cc.LabelTTF(this.owner+"的秘密", "Arial", 80);
        label.x = g_size.width * 0.5;
        label.y = g_size.height * 0.8;
        this.titleLabel = label;
        this.addChild( label, MenuLayer.Z.UI );
    },

    _initStartMenu: function() {
        var label = new cc.LabelTTF("一探究竟", "Arial", 70);
        var self = this;
        var save = new cc.MenuItemLabel( label,
            function(){
                if( MenuLayer.MOBILE ) {
                    self._askChallengerName();
                } else {
                    self.startGame();
                }
            }
        );
        var menu = new cc.Menu( save );
        menu.x = g_size.width * 0.5;
        menu.y = g_size.height * 0.6;
        this.startMenu = menu;
        this.addChild( menu, MenuLayer.Z.UI );
    },

    _initShareMenu: function() {
        var label = new cc.LabelTTF("分享到微信", "Arial", 60);
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
        document.title = this.getShareResultStr( this.percent );
    },

    getShareResultStr: function() {
        return "lalala";
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
        scene.removeChild( scene.layer );
        scene.layer = new GameLayer( scene, this.uid, this.challenger );
        scene.addChild( scene.layer );
    }
});

MenuLayer.Z = {
    UI: 200,
    FIELD: 300
};

MenuLayer.TITLE = "Fortune Whisper";
MenuLayer.MOBILE = false;