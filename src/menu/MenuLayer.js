/**
 * Created by Rock on 9/5/14.
 */
//
//var dataForWeixin={
//    appId:"",
//    MsgImg:"192.168.0.101/HideTreasure2/res/title.png",
//    TLImg:"192.168.0.101/HideTreasure2/res/title.png",
//    url: "192.168.0.101/HideTreasure2",
//    title:"怒放纹身社移动版",
//    desc:"欢迎大家点击"
//};
//
//var imgUrl = '192.168.0.101/HideTreasure2/res/objs.png';
//var lineLink = '192.168.0.101/HideTreasure2';
//var descContent = "万达狂欢节, 夺宝幸运星大抽奖活动开始啦！";
//var shareTitle = '万达狂欢节';
//var appid = '1234';
//
//function shareFriend() {
//    WeixinJSBridge.invoke('sendAppMessage',{
//        "appid": "123",
//        "img_url": "192.168.0.101/HideTreasure2/res/objs.png",
//        "img_width": "126",
//        "img_height": "126",
//        "url": "192.168.0.101/HideTreasure2",
//        "link": "192.168.0.101/HideTreasure2",
//        "desc": "lalala",
//        "title": "bababa"
//    }, function(res) {
//        _report('send_msg', res.err_msg);
//    })
//}
//function shareTimeline() {
//    WeixinJSBridge.invoke('shareTimeline',{
//        "img_url": imgUrl,
//        "img_width": "640",
//        "img_height": "640",
//        "link": lineLink,
//        "desc": descContent,
//        "title": shareTitle
//    }, function(res) {
//        _report('timeline', res.err_msg);
//    });
//}
//function shareWeibo() {
//    WeixinJSBridge.invoke('shareWeibo',{
//        "content": descContent,
//        "url": lineLink,
//    }, function(res) {
//        _report('weibo', res.err_msg);
//    });
//}
//// 当微信内置浏览器完成内部初始化后会触发WeixinJSBridgeReady事件。
//document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
//    // 发送给好友
//    WeixinJSBridge.on('menu:share:appmessage', function(argv){
//        shareFriend();
//    });
//    // 分享到朋友圈
//    WeixinJSBridge.on('menu:share:timeline', function(argv){
//        shareTimeline();
//    });
//    // 分享到微博
//    WeixinJSBridge.on('menu:share:weibo', function(argv){
//        shareWeibo();
//    });
//}, false);

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
        //this._initTitleLabel();
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
        document.title = this.getShareResultStr();
    },

    getShareResultStr: function() {
        var str = "我" + this.owner + "在神秘森林埋下了一个秘密，你们有本事抢过来看看吗？！";
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
            //this.titleLabel.setString("~~"+strs);
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