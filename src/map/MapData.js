/**
 * Created by Rock on 8/28/14.
 */


var MapData = cc.Class.extend({
    rawMapData: null,
    rawObjsData: null,
    owner: "",
    width: 0,
    height: 0,
    grids: null,
    loadMapCallBack: null,
    saveMapCallBack: null,
    mapid: 2001,
    uid: 2001,
    saveMapid: 2001,
    saveUserid: 2001,

    ctor: function (uid) {
        this.uid = uid;
    },

    createNewID: function() {
        var id = parseInt( this.uid );
        id = id + Math.floor( Math.random() * 100 ) + 1;
        this.saveUserid = id;
    },

    serializeMap: function() {
        var data = new Object();
        data.width = this.width;
        data.height = this.height;
        data.thiefPos = {};
        //data.moneyPos = [];
        data.guardPos = [];
        data.gridsData = [];
        for( var i=0; i<this.width; i++ ) {
            for (var j = 0; j < this.height; j++) {
                var grid = this.grids[i][j];
                if( grid.thief ) {
                    data.thiefPos = { x: i, y: j };
                }
//                if( grid.money ) {
//                    data.moneyPos.push(
//                        { x: i, y: j }
//                    );
//                }
                if( grid.guard ) {
                    data.guardPos.push(
                        { x: i, y: j }
                    );
                }
                data.gridsData.push(
                    { x: i, y: j, tile: grid.tile }
                );
            }
        }
        return data;
    },

    unserializeMap: function() {
        var rawData = this.rawMapData;
        if( !rawData ) return;
        var grids = {}
        for( var i=0; i<rawData.width; i++) {
            for( var j=0; j<rawData.height; j++ ) {
                grids[i] = grids[i] || [];
                grids[i][j] = { x:i, y:j };
            }
        }
        if( rawData["thiefPos"] ) {
            var d = rawData["thiefPos"];
            grids[d.x][d.y].thief = true;
        }
        if( rawData["guardPos"] ) {
            for( var i in rawData["guardPos"] ){
                var d = rawData["guardPos"][i];
                grids[d.x][d.y].guard = true;
            }
        }
        for( var i in rawData["gridsData"] ){
            var d = rawData["gridsData"][i];
            grids[d.x][d.y].tile = d["tile"];
        }
        this.width = rawData.width;
        this.height = rawData.height;
        this.grids = grids;
    },

    serializeObjs: function() {
        var data = new Object();
        data.trapPos = [];
        //data.guardPos = [];
        data.moneyPos = [];
        for( var i=0; i<this.width; i++ ) {
            for (var j = 0; j < this.height; j++) {
                var grid = this.grids[i][j];
                if( grid.trap ) {
                    data.trapPos.push(
                        { x: i, y: j }
                    );
                }
//                if( grid.guard ) {
//                    data.guardPos.push(
//                        { x: i, y: j }
//                    );
//                }
                if( grid.money ) {
                    data.moneyPos.push(
                        { x: i, y: j }
                    );
                }
            }
        }
        return data;
    },

    unserializeObjs: function() {
        var rawData = this.rawObjsData;
        if( !rawData ) return;
        var grids = this.grids;
        if( rawData["trapPos"] ) {
            for( var i in rawData["trapPos"] ){
                var d = rawData["trapPos"][i];
                grids[d.x][d.y].trap = true;
            }
        }
        if( rawData["moneyPos"] ) {
            for (var i in rawData["moneyPos"]) {
                var d = rawData["moneyPos"][i];
                grids[d.x][d.y].money = true;
            }
        }
    }

})

