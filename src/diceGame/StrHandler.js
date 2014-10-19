/**
 * Created by Rock on 10/3/14.
 */

var StrHandler = cc.Class.extend({
    realMsg: "",
    msgArray: [],
    msgFragArrays: [],

    ctor: function ( msgArray, realMsg ) {
        this.setMsgArray( msgArray );
        this.getMysteriousMsg();
        this.realMsg = realMsg || this.realMsg;
        var frags = this._parseSingleMsg( this.realMsg );
        this.realMsg = frags[0] + frags[1];
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
            var frags = this._parseSingleMsg( msg );
            this.msgFragArrays[0].push( frags[0] );
            this.msgFragArrays[1].push( frags[1] );
        }
    },

    _parseSingleMsg: function( msg ) {
        var frags = [];
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
        frags.push( frag );
        if( hasComma ) {
            idx++;
        }
        frag = msg.substr( idx );
        frags.push( frag );
        return frags;
    },

    getRealMsg: function() {
        return this.realMsg;
    },

    getMysteriousMsg: function() {
        var msg = this.realMsg;
        msg = msg.replace( / /g, "" );
        var num = Math.floor( msg.length / 4 );
        num = num < 1 ? 1 : num;
        var str = "";
        str = this._insertUnknownStr( str, Util.randomInt(0,2) );
        var idx = 0;
        for( var i=0; i<num; i++ ) {
            var rest = num - i;
            idx = Util.randomInt( idx, msg.length-rest );
            str += msg.charAt( idx );
            str = this._insertUnknownStr( str, Util.randomInt(1,3) );
            idx++;
        }
        return str;
    },

    _insertUnknownStr: function( str, num ) {
        for( var i=0; i<num; i++ ) {
            str += "x";
        }
        return str;
    },

    getMixedMsg: function() {
        var str = "";
        var lastIdx = -1;
        var idx = -1;
        for( var i=0; i<StrHandler.FRAG_NUM; i++ ) {
            while( idx == lastIdx ) {
                idx = Util.randomInt( 0, this.msgFragArrays[i].length-1 );
            }
            lastIdx = idx;
            str += this.msgFragArrays[i][idx];
        }
        return this.filterStr(str);
    },

    filterStr: function( str ) {
        var ret = str
        if( str.length > StrHandler.LINE_STRLEN ) {
            ret = str.substr( 0, StrHandler.LINE_STRLEN ) + "\n" +
                str.substr( StrHandler.LINE_STRLEN );
        }
        return ret;
    }
})

StrHandler.FRAG_NUM = 2;
StrHandler.LINE_STRLEN = 15;
