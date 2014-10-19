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
    msgArray: ["老岩哥的人马，用的特别吊！"],
    myMsg: "",
    myName: "",
    hasMsg: false,
    msgHandler: null,
    state: null,
    owner: "火星人",
    uid: 10001,
    msgid: 10001,
    myid: 10001,

    ctor: function ( scene ) {
        this._super();
        this.scene = scene;
        this._loadUrlParam();
        this._chooseLanguage();
        document.title = this.txtCfg.title;
        this.myName = this.txtCfg.unknownName;
        this.state = DiceLayer.STATE.INSTR;
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
        this.msgArray = JSON.parse( content );
//        for(var i in this.msgArray) {
//            cc.log(this.msgArray[i]);
//        }
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
        var self = this;
        this.schedule( function() { self.askName(); }, 0.1, 0 );
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
        this.hasMsg = true;
        this.saveMsg();
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
        this.state = DiceLayer.STATE.INIT;
        this.secretLabel.setVisible( true );
        this.titleLabel.setString("");
        this.secretLabel.label.setString( this.msgHandler.getMysteriousMsg() );
        this.titleLabel.setString( this.owner + this.txtCfg.result );
    },

    rollDice: function() {
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
        } else if( this.state = DiceLayer.STATE.UNKNOWN ) {
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
        var num = this._getDiceNum();
        this.numLabel.setString( num );
        if( this.state == DiceLayer.STATE.INIT ) {
            this.state = DiceLayer.STATE.UNKNOWN;
        }
        this.onRollDiceEnd(num);
    },

    onRollDiceEnd: function( num ) {
        var isOK = num == 6 ? true : false;
        if( isOK ) {
            this.state = DiceLayer.STATE.SHOW_ANSWER;
            // highlight
            var self = this;
            if( !this.numLabelHighlightEffect ) {
                this.numLabelHighlightEffect = new HighlightEffect( this.numLabel, function(){
                    self.numLabelHighlightEffect = null;
                    self.onRollAnswer();
                }, -1, 0.3, 0.5 );
            }
        } else {
            this.secretLabel.label.setString( this.msgHandler.getMixedMsg() );
            this.titleLabel.setString("");
        }
    },

    onRollAnswer: function() {
        // show msg
        var self = this;
        this.secretLabel.label.setString( this.msgHandler.getRealMsg() );
        this.titleLabel.setString( this.owner + this.txtCfg.result );
        this.secretLabel.label.setOpacity(0);
        this.secretLabel.label.runAction( cc.sequence(
            cc.fadeTo( 0.4, 80 ),
            cc.callFunc( function() {
                    new HighlightEffect( self.secretLabel.label,
                        function () {
                            self.state = DiceLayer.STATE.KNOWN;
                        }, 1.3, 0.5, 0.6 )
                } ),
            cc.fadeTo( 0.8, 255 )
        ) );
    },

    saveMsg: function() {
        var self = this;
        var content = {
            owner: this.myName,
            msg: this.myMsg
        }
        this.myid = Util.randomInt( 10001, 19999 );
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
        //this.msgArray.push( this.myMsg );
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
        if( this.hasMsg ) {
            desc = this.myName + this.txtCfg.shareDesc1 + this.owner + this.txtCfg.shareDesc2;
        } else {
            desc = this.owner + this.txtCfg.shareDesc3;
        }
        return desc;
    },

    _getUrlParam: function() {
        var url = location.origin + location.pathname;
        var index = "index.html"
        if( location.pathname.search(index) < 0 ) {
            url += index
        }
        var msgid = this.hasMsg ? this.myid : this.msgid;
        return url + "?uid="+this.uid+"&mid="+msgid;
    },

    onShareToFriends: function(argv) {
        WeixinJSBridge.invoke('sendAppMessage', {
            "img_url": location.origin+"/HideTreasure2/res/money.png",
            "img_width": "120",
            "img_height": "120",
            "link": this._getUrlParam(),
            "desc": this._getShareDesc(),
            "title": this.txtCfg.title
        }, function () {});
    }
})

DiceLayer.Z = {
    UI: 9
};

DiceLayer.STATE = {
    INSTR: 0, INIT: 1, UNKNOWN: 2, SHOW_ANSWER:3, KNOWN: 4
};

DiceLayer.CHN = {
    title: "留言碎一地",
    start: "开始",
    roll: " 丢你一骰子！",
    leaveMsg: "我也要留言",
    askMsg: "用逗号把留言切成两半",
    askName: "请问施主如何称呼？",
    unknownName: "火星人",
    instr: "玩法说明：\n\n        骰子丢到6可以拼出楼主的留言，\n否则会看到别人的留言碎了一地...",
    result: "说:\n\n\n",
    shareDesc1: "捡起了",
    shareDesc2: "碎了一地的留言，并丢下了自己的",
    shareDesc3: "不小心把要说的话掉了一地...哪位能帮个忙给拼起来 囧"
};

DiceLayer.UID_URL = "http://minihugscorecenter.appspot.com/user?uid=";
DiceLayer.MID_URL = "http://minihugscorecenter.appspot.com/map?mid=";

document.addEventListener('WeixinJSBridgeReady', function() {
    //WeixinJSBridge.call('hideOptionMenu');
    WeixinJSBridge.on('menu:share:appmessage', function (argv) {
        g_layer.onShareToFriends( argv );
    });
});