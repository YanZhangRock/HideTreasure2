/**
 * Created by Rock on 9/4/14.
 */

var MapEditor = cc.Class.extend({
    layer: null,
    thief: null,
    moneyNum: 0,
    trapNum: 0,

    ctor: function( layer ) {
        this.layer = layer;
    },

    editMap: function( grid, tile, img ) {
        if( tile == "THIEF" ) {
            this._addThief( grid, img );
        } else if( tile == "MONEY" ) {
            this._addMoney( grid, img );
        } else if ( tile == "GUARD" ) {
            this.addGuard( grid )
        } else if ( tile == "TRAP" ) {
            this.addTrap( grid );
        } else if ( tile == "KEY" ) {
            this.addTrap( grid );
        } else {
            this._changeTile( grid, tile, img );
        }
    },

    _changeTile: function( pos, tile, img ) {
        var grid = this.layer.map.grids[pos.x][pos.y];
        if( this.gridHasObj( grid ) ) return;
        var frame = cc.spriteFrameCache.getSpriteFrame(img);
        grid.sprite.setSpriteFrame( frame );
        grid.tile = tile;
    },

    _addThief: function( grid, img ) {
        if( grid.thief ) {
            this.layer.removeChild( grid.thief );
            grid.thief = null;
            this.thief = null;
            return;
        }
        if( this.gridHasObj( grid ) ) return;
        if( grid.tile == "TREES" ) return;
        if( this.thief ) return;
        var p = Util.grid2World( grid );
        var thief = new cc.Sprite( "#"+img );
        thief.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: p.x,
            y: p.y,
            scale: Def.GRID_SCALE
        });
        this.layer.addChild( thief, EditorLayer.Z.OBJ );
        grid.thief = thief;
        this.thief = thief;
    },

    _addMoney: function( grid, img ) {
        if( grid.money ) {
            this.layer.removeChild( grid.money );
            grid.money = null;
            this.moneyNum--;
            return;
        }
        if( this.moneyNum >= MapEditor.MAX_MONEY ) return;
        if( this.gridHasObj( grid ) ) return;
        if( grid.tile == "TREES" ) return;
        var p = Util.grid2World( grid );
        var money = new cc.Sprite( "#"+img );
        money.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: p.x,
            y: p.y,
            scale: Def.GRID_SCALE
        });
        this.moneyNum++;
        this.layer.addChild( money, EditorLayer.Z.OBJ );
        grid.money = money;
        this.layer.onAddMoney();
    },

    addGuard: function( grid ) {
        if( grid.guard ) {
            if( grid.money ) {
                this.layer.onRemoveGuard( grid.guard );
                grid.guard = null;
            }
            return;
        }
        if( !this.gridHasObj( grid ) || grid.thief ) return;
        if( this.layer.guardNum >= EditorLayer.MAX_FAKE_CHEST ) return;
        if( grid.tile == "TREES" ) return;
        var p = Util.grid2World( grid );
        var guard = new cc.Sprite( "#guard.png" );
        guard.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: p.x,
            y: p.y,
            scale: Def.GRID_SCALE
        });
        grid.guard = guard;
        this.layer.onAddGuard( guard );
    },

    addTrap: function( grid ) {
        if( grid.trap ) {
            this.layer.onRemoveKey( grid.trap );
            grid.trap = null;
            this.trapNum--;
            return;
        }
        if( this.layer.keyNum >= EditorLayer.MAX_KEY ) return;
        if( this.trapNum >= MapEditor.MAX_TRAP ) return;
        if( this.gridHasObj( grid ) ) return;
        if( grid.tile == "TREES" ) return;
        var p = Util.grid2World( grid );
        var trap = new cc.Sprite( "#key.png" );
        trap.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: p.x,
            y: p.y,
            scale: Def.GRID_SCALE
        });
        this.trapNum++;
        this.layer.onAddKey( trap );
        grid.trap = trap;
    },

    gridHasObj: function( grid ) {
        if( grid.thief || grid.money || grid.guard || grid.trap ) {
            return true;
        }
        return false;
    }
});

MapEditor.MAX_MONEY = 1;
MapEditor.MAX_TRAP = 2;