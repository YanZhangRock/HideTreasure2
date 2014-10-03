/**
 * Created by Rock on 8/29/14.
 */

var ObjIO = cc.Class.extend({
    map: null,
    loadObjCallBack: null,
    saveObjCallBack: null,
    isIgnoreData: false,
    uid: 1,

    ctor: function ( map ) {
        this.map = map;
    },

    getLoadURL: function( uid ) {
        return ObjIO.URL+uid;
    },

    getSaveURL: function() {
        return ObjIO.URL+this.map.uidNew+"&name="+"?"+"&mid="+this.map.midNew;
    },

    loadObjs: function( uid, callBack, isIgnoreData ) {
        this.loadObjCallBack = callBack;
        if( isIgnoreData ) {
            this.isIgnoreData = true;
        } else {
            this.isIgnoreData = false;
        }
        var self = this;
        Util.getHTML( this.getLoadURL( uid ), function(txt){self.onLoadObjs(txt)} );
    },

    onLoadObjs: function( txt ) {
        if( txt == "null" ) return;
        var idx = txt.indexOf("{");
        var pre = txt.substr( 0, idx );
        var content = txt.substr( idx );
        var strs = pre.split( "," );
        this.map.mapid = strs[2];
        if( !this.isIgnoreData ) {
            this.map.rawObjsData = JSON.parse( content );
        } else {
            this.map.rawObjsData = null;
        }
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