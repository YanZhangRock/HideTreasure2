/**
 * Created by Rock on 9/4/14.
 */

var MapPainter = cc.Class.extend({
    layer: null,
    oriGrid: {x:0,y:0},
    gridScale: 1.0,
    zOrder: 0,
    mapName: "",
    rawData: null,
    map: null,
    mapBatch: null,

    ctor: function ( layer ) {
        this.layer = layer;
        this.map = layer.map;
    },

    setParam: function( param ) {
        this.zOrder = param.zOrder || this.zOrder;
        this.oriGrid = param.oriGrid || this.oriGrid;
        this.gridScale = param.gridScale || this.gridScale;
    },

    drawMap: function() {
        var mapImg = cc.textureCache.addImage(res.Tile_png);
        var batchNode = new cc.SpriteBatchNode(mapImg, 200);
        this.mapBatch = batchNode;
        this.layer.addChild( batchNode, this.zOrder+MapPainter.Z.TILE );
        var grids = this.map.grids;
        for( var i=0; i<this.map.width; i++ ) {
            for( var j=0; j<this.map.height; j++) {
                var grid = grids[i][j];
                // draw tile
                var sprite = new cc.Sprite( "#"+this.getTileImg( grid.tile ) );
                grid.sprite = sprite;
                var pos = Util.grid2World( grid );
                sprite.attr({
                    anchorX: 0.5,
                    anchorY: 0.5,
                    x: pos.x,
                    y: pos.y,
                    scale: Def.GRID_SCALE
                });
                batchNode.addChild( sprite );
                // draw money
                if( grid.money ) {
                    var money = new cc.Sprite( "#"+Def.OBJ2IMG["MONEY"] );
                    money.attr({
                        anchorX: 0.5,
                        anchorY: 0.5,
                        x: pos.x,
                        y: pos.y,
                        scale: Def.GRID_SCALE
                    });
                    grid.money = money;
                    this.layer.addChild( money, this.zOrder+MapPainter.Z.OBJ );
                }
                // draw thief
                if( grid.thief ) {
                    var thief = new cc.Sprite( "#"+Def.OBJ2IMG["THIEF"] );
                    thief.attr({
                        anchorX: 0.5,
                        anchorY: 0.5,
                        x: pos.x,
                        y: pos.y,
                        scale: Def.GRID_SCALE
                    });
                    grid.thief = thief;
                    this.layer.addChild( thief, this.zOrder+MapPainter.Z.OBJ );
                }
                // draw guard
                if( grid.guard ) {
                    var guard = new cc.Sprite( "#"+Def.OBJ2IMG["GUARD"] );
                    guard.attr({
                        anchorX: 0.5,
                        anchorY: 0.5,
                        x: pos.x,
                        y: pos.y,
                        scale: Def.GRID_SCALE
                    });
                    grid.guard = guard;
                    this.layer.addChild( guard, this.zOrder+MapPainter.Z.OBJ );
                }
                // draw trap
                if( grid.trap ) {
                    var trap = new cc.Sprite( "#"+Def.OBJ2IMG["TRAP"] );
                    trap.attr({
                        anchorX: 0.5,
                        anchorY: 0.5,
                        x: pos.x,
                        y: pos.y,
                        scale: Def.GRID_SCALE
                    });
                    grid.trap = trap;
                    this.layer.addChild( trap, this.zOrder+MapPainter.Z.OBJ );
                }
            }
        }
    },

    getTileImg: function( tile ) {
        return Def.TILE2IMG[tile];
    }
});

MapPainter.Z = {
    TILE: 0, OBJ: 1
}