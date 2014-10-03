/**
 * Created by Rock on 10/3/14.
 */

var DiceLayer = cc.Layer.extend({
    scene: null,
    titleLabel: null,
    secretLabel: null,
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
        this._loadMsgs();
    },

    onLoadMsgs: function( txt ) {
        this._pargeMsgs( txt );
        this._initLabels();
        this._initMenus();
        this.msgHandler = new StrHandler( this.msgArray );
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

    _initMenus: function() {
        // input menu
        var label = new cc.LabelTTF("leave msg", "Arial", 60);
        var self = this;
        var menuLabel = new cc.MenuItemLabel( label,
            function(){
                self.onClickLeaveMsg();
            }
        );
        var menu = new cc.Menu( menuLabel );
        menu.x = g_size.width * 0.5;
        menu.y = g_size.height * 0.3;
        this.inputMenu = menu;
        this.addChild( menu, 0 );
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
        this.addChild( menu, 0 );
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
    },

    getSaveURL: function() {
        return ObjIO.URL+this.uid+"&name="+"Rock"+"&mid=0";
    }
})