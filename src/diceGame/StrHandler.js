/**
 * Created by Rock on 10/3/14.
 */

var StrHandler = cc.Class.extend({
    msgArray: [],
    msgFragArrays: [],

    ctor: function ( msgArray ) {
        this.setMsgArray( msgArray );
    },

    setMsgArray: function( msgArray ) {
        this.msgArray = msgArray;
        this._parseMsg();
    },

    _parseMsg: function() {
        this.msgFragArrays = [];
        for( var i=0; i<StrHandler.FRAG_NUM; i++ ) {
            this.msgFragArrays.push( [] );
        }
        for( var i in this.msgArray ) {
            var msg = this.msgArray[i];
            var hasComma = true;
            var idx = msg.indexOf(",");
            if( idx <= 0 ) {
                idx = msg.indexOf("，");
            }
            if( idx <= 0 ) {
                idx = Math.floor( msg.length / 2 )
                hasComma = false;
            }
            var frag = msg.substr( 0, idx );
            this.msgFragArrays[0].push( frag );
            if( hasComma ) {
                idx++;
            }
            frag = msg.substr( idx );
            this.msgFragArrays[1].push( frag );
        }
    },

    getRealMsg: function() {
        return "宇宙的奥秘就是：~~~~  42 ！";
    },

    getMixedMsg: function() {
        var str = "";
        var lastIdx = -1;
        var idx = -1;
        for( var i=0; i<StrHandler.FRAG_NUM; i++ ) {
            while( idx == lastIdx ) {
                idx = Math.floor( Math.random() * this.msgFragArrays[i].length );
            }
            lastIdx = idx;
            str += this.msgFragArrays[i][idx];
        }
        return str;
    }
})

StrHandler.FRAG_NUM = 2;
