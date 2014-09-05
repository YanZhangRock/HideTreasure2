/**
 * Created by Rock on 8/29/14.
 */

var ObjIO = cc.Class.extend({
    map: null,
    loadObjCallBack: null,
    saveObjCallBack: null,
    uid: 1,

    ctor: function ( map ) {
        this.map = map;
    },

    getLoadURL: function() {
        return ObjIO.URL+this.map.uid;
    },

    getSaveURL: function() {
        return ObjIO.URL+this.map.saveUserid+"&name="+this.map.owner+"&mid="+this.map.saveMapid;
    },

    loadObjs: function( callBack ) {
        this.loadObjCallBack = callBack;
        var self = this;
        Util.getHTML( this.getLoadURL(), function(txt){self.onLoadObjs(txt)} );
    },

    onLoadObjs: function( txt ) {
        if( txt == "null" ) return;
        var idx = txt.indexOf("{");
        var pre = txt.substr( 0, idx );
        var content = txt.substr( idx );
        var strs = pre.split( "," );
        //this.map.uid = strs[0];
        this.map.owner = strs[1];
        this.map.mapid = strs[2];
        this.map.rawObjsData = JSON.parse( content );
        if( this.loadObjCallBack ) {
            this.loadObjCallBack();
        }
    },

    saveObjs: function( callBack ) {
        this.saveObjCallBack = callBack;
        var saveData = this.map.serializeObjs();
        var self = this;
        Util.postHTML( this.getSaveURL(), JSON.stringify( saveData ),
            function(){
                if( self.saveObjCallBack ) {
                    self.saveObjCallBack();
                }
            }
        );
    }

});

ObjIO.URL = "http://minihugscorecenter.appspot.com/user?uid=";