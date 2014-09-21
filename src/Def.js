/**
 * Created by Rock on 9/4/14.
 */

var Def = new Object();

Def.UID = 2000;
Def.MID = 2000;
Def.GRID_SIZE = 80;
Def.ORI_GRID = { x: 0, y: 160 };
Def.GRID_SCALE = 1.25;
Def.UP = 0;
Def.DOWN = 1;
Def.LEFT = 2;
Def.RIGHT = 3;

Def.TILE2IMG = {
    GRASS: "Grass0.png",
    TREES: "Tree0.png"
};
Def.OBJ2IMG = {
    "THIEF": "thief.png",
    "GUARD": "guard.png",
    "MONEY": "money.png",
    "TRAP": "trap.png"
};
Def.CHN = 1;
Def.ENG = 2;
// menu cfg
Def.ASK_NAME = false;
// game cfg
Def.USE_MENU = false;
Def.SHOW_ANIM = false;
// editor cfg
Def.USE_GAME = true;
Def.ASK_SECRET = false;
//g_language = Def.ENG;
g_language = Def.CHN;