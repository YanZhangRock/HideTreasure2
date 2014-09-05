/**
 * Created by Rock on 9/5/14.
 */

var MenuLayer = cc.Layer.extend({
    scene: null,
    titleLabel: null,
    startMenu: null,
    uid: 2001,
    owner: "Alien",

    ctor: function ( scene ) {
        this._super();
        this.scene = scene;
        this._loadUserID();
        this._loadOwner();
    },

    onLoadOwner: function( txt ) {
        this._parseOwner( txt )
        this._initTitleLabel();
        this._initStartMenu();
    },

    _initTitleLabel: function() {
        var label = new cc.LabelTTF(this.owner+"的秘密", "Arial", 80);
        label.x = g_size.width * 0.5;
        label.y = g_size.height * 0.8;
        this.titleLabel = label;
        this.addChild( label, EditorLayer.Z.UI );
    },

    _initStartMenu: function() {
        var label = new cc.LabelTTF("偷取秘密", "Arial", 60);
        var self = this;
        var save = new cc.MenuItemLabel( label,
            function(){
                self.startGame();
            }
        );
        var menu = new cc.Menu( save );
        menu.x = g_size.width * 0.5;
        menu.y = g_size.height * 0.6;
        this.startMenu = menu;
        this.addChild( menu, EditorLayer.Z.UI );
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
        var pre = txt.substr( 0, idx );
        var strs = pre.split( "," );
        this.owner = strs[1];
    },

    startGame: function() {
        var scene = this.scene;
        scene.removeChild( scene.layer );
        scene.layer = new GameLayer( scene, this.uid );
        scene.addChild( scene.layer );
    }
});

MenuLayer.Z = {
    UI: 200
}