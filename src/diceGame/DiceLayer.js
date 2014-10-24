/**
 * Created by Rock on 10/3/14.
 */

var DiceLayer = cc.Layer.extend({
    scene: null,
    titleLabel: null,
    secretLabel: null,
    numLabel: null,
    btnMgr: null,
    msgBtn: null,
    rollBtn: null,
    shareBtn: null,
    msgArray: ["老岩哥的人马，用的特别吊！"],
    curMsg: "",
    myMsg: "",
    myName: "",
    hasName: false,
    msgHandler: null,
    shareMenu: null,
    state: null,
    oriState: null,
    shareState: null,
    owner: "",
    uid: 10004, // eng ver see 10011
    msgid: 10001,
    myid: 10001,

    ctor: function ( scene ) {
        this._super();
        this.scene = scene;
        this._loadUrlParam();
        this._chooseLanguage();
        document.title = this.txtCfg.title;
        this.myName = this.txtCfg.unknownName;
        this.owner = this.owner.length <= 0 ? this.txtCfg.unknownName: this.owner;
        this.setState( DiceLayer.STATE.INSTR );
        this.setShareState( DiceLayer.SHARE_STATE.EMPTY );
        this.updateShareParam();
        this._loadRealMsg();

    },

    onLoadRealMsg: function( txt ) {
        this._parseRealMsg( txt );
        this._loadMsgs();
    },

    onLoadMsgs: function( txt ) {
        this._pargeMsgs( txt );
        this._initLabels();
        this._initButtons();
        this.msgHandler = new StrHandler( this.msgArray, this.realMsg );
        this.shareMenu = new ShareMenu( this, DiceLayer.Z.SHARE );
        //this.msgHandler.setMyMsg("爸爸爸爸，妈妈妈妈")
    },

    _chooseLanguage: function() {
        this.txtCfg = g_language == Def.CHN ? DiceLayer.CHN : DiceLayer.ENG;
    },

    _loadUrlParam: function() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for(var i = 0; i < strs.length; i ++) {
                theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);
            }
            this.uid = theRequest["uid"] || this.uid;
            this.msgid = theRequest["mid"] || this.msgid;
            if( theRequest["lan"] ) {
                g_language = theRequest["lan"] == "e" ? Def.ENG : Def.CHN;
            }
        }
    },

    _initLabels: function() {
        // title label
        var label = new cc.LabelTTF( "title", "Arial", 50 );
        label.x = g_size.width * 0.5;
        label.y = g_size.height * 0.7;
        this.titleLabel = label;
        label.setString( this.txtCfg.instr );
        this.addChild( label, DiceLayer.Z.UI );
        // number label
        var label = new cc.LabelTTF( "", "Arial", 80 );
        label.x = g_size.width * 0.5;
        label.y = g_size.height * 0.66;
        label.setColor( Def.COLOR.GREEN );
        this.numLabel = label;
        this.addChild( label, DiceLayer.Z.NUM );
        // secret label
        var label = new MyLabel( "123", 50, {x:2.8, y:2.0} );
        label.label.setString( "lalala\nlalala" );
        label.x = g_size.width * 0.50;
        label.y = g_size.height * 0.66;
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
            scale: { x: 1.4, y: 1.0 },
            pos: { x: 0.5, y: 0.16 },
            txt: this.txtCfg.leaveMsg,
            fontSize: 46
        }
        var btn = new MyButton( "123", param );
        btn.setCallBack( function() { self.onClickLeaveMsg(); } );
        this.msgBtn = btn;
        btn.setVisible( false );
        //btn.setVisible( false );
        this.btnMgr.addButton( btn );
        // roll dice btn
        var param = {
            scale: { x: 1.6, y: 1.2 },
            pos: { x: 0.5, y: 0.36 },
            txt: this.txtCfg.start,
            fontSize: 58
        }
        var btn = new MyButton( "123", param );
        btn.setCallBack( function() { self.onClickRollBtn(); } );
        this.rollBtn = btn;
        this.btnMgr.addButton( btn );
        // share btn
        var param = {
            scale: { x: 0.9, y: 0.6 },
            pos: { x: 0.51, y: 0.56 },
            txt: this.txtCfg.shareMsg,
            fontSize: 36
        }
        var btn = new MyButton( "123", param );
        btn.setCallBack( function() { self.onClickShareBtn(); } );
        this.shareBtn = btn;
        btn.setVisible( false );
        this.btnMgr.addButton( btn );
    },

    _loadMsgs: function() {
        var self = this;
        Util.getHTML( DiceLayer.UID_URL+this.uid, function(txt){self.onLoadMsgs(txt)} );
    },

    _loadRealMsg: function() {
        var self = this;
        Util.getHTML( this.getRealMsgURL(), function(txt){self.onLoadRealMsg(txt)} );
    },

    _parseRealMsg: function( txt ) {
        var content = JSON.parse( txt)
        this.realMsg = content.msg || this.realMsg;
        this.owner = content.owner || this.owner;
    },

    _pargeMsgs: function( txt ) {
        if( txt == "null" ) return;
        var idx = txt.indexOf("[");
        var content = txt.substr( idx );
        if( content.length < 3 ) {
            return;
        }
        this.msgArray = JSON.parse( content );
//        for(var i in this.msgArray) {
//            cc.log(this.msgArray[i]);
//        }
    },

    setState: function( state ) {
        this.oriState = this.state;
        this.state = state;
    },

    setShareState: function( state ) {
        this.shareState = state;
    },

    onClickLeaveMsg: function() {
        var self = this;
        this.schedule( function() { self.askMsg(); }, 0.1, 0 );
    },

    askMsg: function() {
        var self = this;
        var msg = Util.createTextField(
            this.txtCfg.askMsg,
            function(){ self.onGetMsg(this); }
        );
        this.addChild( msg, DiceLayer.Z.UI );
    },

    onGetMsg: function( msg ) {
        var msg = msg.getString();
        this.removeChild( msg );
        if(msg.length <= 0) {
            return;
        }
        this.myMsg = msg;
        this.msgHandler.setMyMsg( msg );
        var self = this;
        if( !this.hasName ) {
            this.schedule( function() { self.askName(); }, 0.1, 0 );
        } else {
            this.saveMsg();
            this.shareMenu.activate();
            this.updateShareParam();
        }
    },

    askName: function() {
        var self = this;
        var msg = Util.createTextField(
            this.txtCfg.askName,
            function(){ self.onGetName(this); }
        );
        this.addChild( msg, DiceLayer.Z.UI );
    },

    onGetName: function( msg ) {
        var msg = msg.getString();
        this.removeChild( msg );
        if(msg.length <= 0) {
            msg = this.txtCfg.unknownName;
        }
        this.myName = msg;
        this.hasName = true;
        this.setShareState( DiceLayer.SHARE_STATE.MYMSG );
        this.saveMsg();
        this.shareMenu.activate();
        this.updateShareParam();
    },

    onClickShareBtn: function() {
        this.myid = Util.randomInt( 10001, 19999 );
        this.setShareState( DiceLayer.SHARE_STATE.OTHERMSG );
        var content = {
            owner: this.myName,
            msg: this.curMsg
        }
        Util.postHTML( this.getMyMsgURL(), JSON.stringify( content ) );
        this.shareMenu.activate();
        this.updateShareParam();
//        cc.log(this._getShareDesc());
//        cc.log(this._getUrlParam());
    },

    onClickRollBtn: function() {
        if( this.state == DiceLayer.STATE.SHOW_ANSWER ) return;
        if( this.state == DiceLayer.STATE.INSTR ) {
            this.closeInstruction();
        } else {
            this.rollDice();
        }
    },

    closeInstruction: function() {
        this.msgBtn.setVisible( true );
        this.rollBtn.label.setString( this.txtCfg.roll );
        this.setState( DiceLayer.STATE.INIT );
        this.secretLabel.setVisible( true );
        this.titleLabel.setString("");
        this.secretLabel.label.setString( this.msgHandler.getMysteriousMsg() );
        var owner = this.owner == this.txtCfg.unknownName ? this.txtCfg.defaultOwner : this.owner;
        this.titleLabel.setString( owner + this.txtCfg.result );
        // remind
        var self = this;
        this.schedule( function(){
            if( self.state != DiceLayer.STATE.INIT ) return;
            new HighlightEffect( self.rollBtn.label, null, 1.2, 0.25, 0.25, 2 );
        }, 1.5, 0 );
    },

    rollDice: function() {
//        this.onShareToFriends();
//        return;
        if( this.state == DiceLayer.STATE.ROLLING ) return;
        this.setState( DiceLayer.STATE.ROLLING );
        this.numLabel.runAction(cc.fadeIn(0.1));
        this.shareBtn.setDisable( true );
        this.secretLabel.label.setString("");
        var self = this;
        var diceNum = 1;
        var times = 15;
        this.schedule( function() {
            diceNum = diceNum % 6 + 1;
            times--;
            self.numLabel.setString( diceNum );
            if( times < 0 ) {
                self.onRollDiceResult();
            }
        }, 0.015, times );
    },

    _getDiceNum: function() {
        var num = 1;
        if( this.state == DiceLayer.STATE.INIT ) {
            num = Util.randomInt( 1, 5 );
        } else if( this.state == DiceLayer.STATE.UNKNOWN ) {
            if( Util.randomInt(1,100) < 14 ) {
                num = 6;
            } else {
                num = Util.randomInt( 1, 5 );
            }
        } else {
            if( Util.randomInt(1,100) < 0 ) {
                num = 6;
            } else {
                num = Util.randomInt( 1, 5 );
            }
        }
        return num;
    },

    onRollDiceResult: function() {
        this.setState( this.oriState );
        this.shareBtn.setDisable( false );
        var num = this._getDiceNum();
        this.numLabel.setString( num );
        this.onRollDiceEnd(num);
    },

    onRollDiceEnd: function( num ) {
        var isOK = num == 6 ? true : false;
        this.setState( DiceLayer.STATE.SHOW_ANSWER );
        var self = this;
        if( isOK ) {
            // highlight
            if( !this.numLabelHighlightEffect ) {
                this.numLabelHighlightEffect = new HighlightEffect( this.numLabel, function(){
                    self.numLabelHighlightEffect = null;
                    self.onRollAnswer();
                }, -1, 0.3, 0.5 );
            }
            this.shareBtn.setVisible( false );
        } else {
            this.numLabel.runAction( cc.sequence(
                    cc.fadeTo( 0.4, 255 ),
                    cc.fadeOut( 0.2 ),
                    cc.callFunc( function() {
                       self.onRollMixedMsg();
                    })
                )
            );
        }
    },

    onRollMixedMsg: function() {
        if( this.oriState == DiceLayer.STATE.INIT ) {
            this.setState( DiceLayer.STATE.UNKNOWN );
        } else {
            this.setState( this.oriState );
        }
        this.curMsg = this.msgHandler.getMixedMsg();
        this.secretLabel.label.setString( this.curMsg );
        this.titleLabel.setString("");
        this.shareBtn.setVisible( true );
    },

    onRollAnswer: function() {
        // show msg
        var self = this;
        this.curMsg = this.msgHandler.getRealMsg();
        this.secretLabel.label.setString( this.curMsg );
        var owner = this.owner == this.txtCfg.unknownName ? this.txtCfg.defaultOwner : this.owner;
        this.titleLabel.setString( owner + this.txtCfg.result );
        this.numLabel.runAction( cc.sequence(
            cc.fadeTo( 0.3, 255 ),
            cc.fadeOut( 0.3 )
        ) );
        this.secretLabel.label.setOpacity(0);
        this.secretLabel.label.runAction( cc.sequence(
            cc.fadeTo( 0.6, 0 ),
            cc.fadeTo( 0.4, 80 ),
            cc.callFunc( function() {
                    new HighlightEffect( self.secretLabel.label,
                        function () {
                            self.setState( DiceLayer.STATE.KNOWN );
                        }, 1.3, 0.5, 0.6 )
                } ),
            cc.fadeTo( 0.8, 255 )
        ) );
        this.schedule( function(){
            new HighlightEffect( self.msgBtn.label, null, 1.4, 0.3, 0.3, 2 );
        }, 2, 0 );
    },

    saveMsg: function() {
        var self = this;
        var content = {
            owner: this.myName,
            msg: this.myMsg
        }
        this.myid = Util.randomInt( 12001, 19999 );
        Util.postHTML( this.getMyMsgURL(), JSON.stringify( content ),
            function(){
                if( self.onSaveRealMsg ) {
                    self.onSaveRealMsg();
                }
            }
        );
    },

    onSaveRealMsg: function() {
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
        //this.titleLabel.setString("message saved!");
        this.msgHandler.setMsgArray( this.msgArray );
    },

    getRealMsgURL: function() {
        return DiceLayer.MID_URL + this.msgid;
    },

    getMyMsgURL: function() {
        return DiceLayer.MID_URL + this.myid;
    },

    getSaveURL: function() {
        return DiceLayer.UID_URL+this.uid+"&name="+"Rock"+"&mid=0";
    },

    _getShareDesc: function() {
        var desc = "";
        switch ( this.shareState ) {
            case DiceLayer.SHARE_STATE.EMPTY:
                desc = this.txtCfg.defaultMyName + this.txtCfg.shareDesc3
                    + this.owner + this.txtCfg.shareDesc4;
                break;
            case DiceLayer.SHARE_STATE.MYMSG:
                desc = this.myName + this.txtCfg.shareDesc1 + this.owner + this.txtCfg.shareDesc2;
                break;
            case DiceLayer.SHARE_STATE.OTHERMSG:
                var myName = this.hasName ? this.myName : this.txtCfg.defaultMyName;
                desc = myName + this.txtCfg.shareDesc5;
                break;
        }
        return desc;
    },

    _getUrlParam: function() {
        var url = location.origin + location.pathname;
        var index = "index.html"
        if( location.pathname.search(index) < 0 ) {
            url += index
        }
        var msgid = this.myid
        if( this.shareState == DiceLayer.SHARE_STATE.EMPTY ) {
            msgid = this.msgid;
        }
        var ret = url + "?uid="+this.uid+"&mid="+msgid;
        if( g_language == Def.ENG ) {
            ret += "&lan=e";
        }
        return ret;
    },

    getUrlPath: function() {
        var path = location.pathname.replace( "index.html", "" );
        return location.origin + path;
    },

    onShareToFriends: function(argv) {
        //this.secretLabel.label.setString(this._getUrlParam());
        WeixinJSBridge.invoke('sendAppMessage', {
            //"img_url": this.getUrlPath() + "res/money.png",
            //"img_width": "120",
            //"img_height": "120",
            "link": this._getUrlParam(),
            "desc": this._getShareDesc(),
            "title": this.txtCfg.title
        }, function () {});
    },

    updateShareParam: function() {
        g_weixinData["imgUrl"] = this.getUrlPath() + "res/money.png";
        g_weixinData["link"] = this._getUrlParam();
        g_weixinData["desc"] = this._getShareDesc();
        g_weixinData["title"] = this.txtCfg.title
    }
})

DiceLayer.Z = {
    UI: 1, NUM:2, SHARE: 900
};

DiceLayer.STATE = {
    INSTR: 0, INIT: 1, UNKNOWN: 2, SHOW_ANSWER:3, KNOWN: 4, ROLLING: 5
};

DiceLayer.SHARE_STATE = {
    EMPTY: 1, MYMSG: 2, OTHERMSG: 3
};

DiceLayer.CHN = {
    title: "失落的留言",
    start: "开始",
    roll: " 丢你一骰子！",
    shareMsg: "分享这一句",
    leaveMsg: "我也要留言",
    askMsg: "用逗号把留言切成两半",
    askName: "请问楼主如何称呼？",
    unknownName: "某人",
    defaultOwner: "楼主",
    defaultMyName: "我",
    instr: "玩法说明：\n\n        骰子丢到6可以拼出楼主的留言，\n否则会看到别人的留言碎了一地...",
    result: "说:\n\n\n",
    shareDesc1: "捡起了",
    shareDesc2: "碎了一地的留言，并丢下了自己的",
    shareDesc3: "发现",
    shareDesc4: "的留言很赞，推荐一下",
    shareDesc5: "拼出了一句碉堡了的留言，大伙儿有没有兴趣捡起来看看"
};

DiceLayer.ENG = {
    title: "lost message",
    start: "Start",
    roll: "Roll",
    shareMsg: "share it",
    leaveMsg: "leave mine",
    askMsg: "use comma to split the message",
    askName: "May I know your name?",
    unknownName: "some one",
    defaultOwner: "the host",
    defaultMyName: "I",
    instr: "Instruction:\n\n" +
        "You can see the host's message when \n" +
        "you roll six.\n\n" +
        "Otherwise you will see other people's\n" +
        "scattered messages.",
    result: " said:\n\n\n",
    shareDesc1: "pick up",
    shareDesc2: "'s lost message, and then left a new one",
    shareDesc3: " found ",
    shareDesc4: "'s message is funny, I recommend you to take a look.",
    shareDesc5: " met an awesome sentence. I guess you may want to take a look."
};

DiceLayer.UID_URL = "http://minihugscorecenter.appspot.com/user?uid=";
DiceLayer.MID_URL = "http://minihugscorecenter.appspot.com/map?mid=";

//var onWeixinReady = function() {
//    WeixinJSBridge.call('hideOptionMenu');
//    WeixinJSBridge.on('menu:share:appmessage', function (argv) {
//        g_layer.onShareToFriends( argv );
//    });
//};

//if( document.addEventListener ) {
//    document.addEventListener('WeixinJSBridgeReady', onWeixinReady );
//} else if( document.attachEvent ) {
//    document.attachEvent('WeixinJSBridgeReady', onWeixinReady);
//    document.attachEvent('onWeixinJSBridgeReady', onWeixinReady);
//}
//
//function wxJsBridgeReady(readyCallback) {
//    if (readyCallback && typeof readyCallback == 'function') {
//        var Api = this;
//        var wxReadyFunc = function () {
//            readyCallback(Api);
//        };
//        if (typeof window.WeixinJSBridge == "undefined"){
//            if (document.addEventListener) {
//                document.addEventListener('WeixinJSBridgeReady', wxReadyFunc, false);
//            } else if (document.attachEvent) {
//                document.attachEvent('WeixinJSBridgeReady', wxReadyFunc);
//                document.attachEvent('onWeixinJSBridgeReady', wxReadyFunc);
//            }
//        }else{
//            wxReadyFunc();
//        }
//    }
//}

g_weixinData = {
    "link" : 'http://www.baidufe.com',
    "desc" : '大家好，我是Alien，Web前端&Android客户端码农，喜欢技术上的瞎倒腾！欢迎多交流',
    "title" : "大家好，我是岩哥"
};
// 需要分享的内容，请放到ready里
WeixinApi.ready(function(Api) {
    // 微信分享的数据
    var wxData = {
//		            "appId": "", // 服务号可以填写appId
//		            "imgUrl" : 'http://www.baidufe.com/fe/blog/static/img/weixin-qrcode-2.jpg',
        "link" : 'http://www.baidufe.com',
        "desc" : '大家好，我是Alien，Web前端&Android客户端码农，喜欢技术上的瞎倒腾！欢迎多交流',
        "title" : "大家好，我是赵先烈"
    };

    // 分享的回调
    var wxCallbacks = {
        // 分享操作开始之前
//		            ready : function() {
//		                // 你可以在这里对分享的数据进行重组
//		                alert("准备分享");
//		            },
//		            // 分享被用户自动取消
//		            cancel : function(resp) {
//		                // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
//		                alert("分享被取消，msg=" + resp.err_msg);
//		            },
//		            // 分享失败了
//		            fail : function(resp) {
//		                // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
//		                alert("分享失败，msg=" + resp.err_msg);
//		            },
//		            // 分享成功
//		            confirm : function(resp) {
//		                // 分享成功了，我们是不是可以做一些分享统计呢？
//		                alert("分享成功，msg=" + resp.err_msg);
//		            },
//		            // 整个分享过程结束
//		            all : function(resp,shareTo) {
//		                // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
//		                alert("分享" + (shareTo ? "到" + shareTo : "") + "结束，msg=" + resp.err_msg);
//		            }
    };

    // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
    Api.shareToFriend(g_weixinData, wxCallbacks);

    // 点击分享到朋友圈，会执行下面这个代码
    Api.shareToTimeline(g_weixinData, wxCallbacks);

    // 点击分享到腾讯微博，会执行下面这个代码
    Api.shareToWeibo(g_weixinData, wxCallbacks);

    // iOS上，可以直接调用这个API进行分享，一句话搞定
    Api.generalShare(g_weixinData,wxCallbacks);
});

