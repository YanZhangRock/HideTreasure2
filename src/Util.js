/**
 * Created by Rock on 9/4/14.
 */

var Util = new Object();

Util.grid2World = function( grid ) {
    var x = ( grid.x + 0.5 ) * Def.GRID_SIZE + Def.ORI_GRID.x;
    var y = ( grid.y + 0.5 ) * Def.GRID_SIZE + Def.ORI_GRID.y;
    return { x: x, y: y };
};

Util.world2Grid = function( world ) {
    var x = Math.floor( (world.x - Def.ORI_GRID.x) / Def.GRID_SIZE );
    var y = Math.floor( (world.y - Def.ORI_GRID.y) / Def.GRID_SIZE );
    return { x: x, y: y };
};

Util.loadJsonFile = function( file ) {
    var txt = cc.loader._loadTxtSync( file );
    return JSON.parse( txt );
};

Util.getManDist = function ( from, to ) {
    return Math.abs( from.x - to.x ) + Math.abs( from.y - to.y );
};

Util.arrayRemove = function( array, obj ) {
    var idx = -1;
    for( var i in array ) {
        if( array[i] == obj ) {
            idx = i;
            break;
        }
    }
    if( idx < 0 ) return;
    array.splice( idx, 1 );
};

Util.getPercent = function( score, callBack ) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open( "GET", "http://minihugscorecenter.appspot.com/scorecenter?Score="+score
        +"&Game=HideTreasureTest" );
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var percent = parseFloat( xhr.responseText );
            var percent = Math.round( percent*10000 ) / 100;
            callBack( percent );
        }
    };
    xhr.send();
};


Util.getHTML = function( url, callBack ) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open( "GET", url );
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if( callBack ) {
                callBack( decodeURI(xhr.responseText) );
            }
        }
    };
    xhr.send();
};

Util.postHTML = function( url, param, callBack ) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open( "POST", url, true );
    xhr.setRequestHeader("Content-type", "text/plain");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if( callBack ) {
                callBack( decodeURI(xhr.responseText) );
            }
        }
    };
    xhr.send( encodeURI(param) );
};

Util.createTextField = function( subtitle, callBack ) {
    var msg = new cc.TextFieldTTF( "", "Arial", 40 );
    msg.x = 0;
    msg.y = 0;
    msg.subtitle_ = subtitle;
    msg.didDetachWithIME = callBack;
    msg.attachWithIME();
    return msg;
};

Util.getOppositeDir = function( dir ) {
    var newDir;
    switch ( dir ) {
        case Def.UP:
            newDir = Def.DOWN;
            break;
        case Def.DOWN:
            newDir = Def.UP;
            break;
        case Def.LEFT:
            newDir = Def.RIGHT;
            break;
        case Def.RIGHT:
            newDir = Def.LEFT;
            break;
    }
    return newDir;
};

Util.isNearPos = function( from, to ) {
    if( Math.abs( from.x - to.x ) > Def.GRID_SIZE ||
        Math.abs( from.y - to.y ) > Def.GRID_SIZE ) {
        return false;
    }
    return true;
};