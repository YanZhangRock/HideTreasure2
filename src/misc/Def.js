/**
 * Created by Rock on 9/4/14.
 */

var Def = new Object();

Def.IMG_SCALE = 2.5
Def.COLOR = {
    GREEN: { r:162, g:199, b:74 },
    YELLOW: { r:253, g:240, b:98 },
    GREY: { r:150, g:150, b:150 }
};
Def.UID = 2000;
Def.MID = 2000;
Def.GRID_SIZE = 80;
Def.ORI_GRID = { x: 0, y: 200 };
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
Def.USE_DICE = true;
Def.ASK_NAME = true;
// game cfg
Def.USE_MENU = true;
Def.SHOW_ANIM = true;
// editor cfg
Def.USE_GAME = true;
Def.ASK_SECRET = true;
//g_language = Def.ENG;
g_language = Def.CHN;