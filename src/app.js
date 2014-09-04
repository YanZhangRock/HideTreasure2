var g_size = {};

var GameScene = cc.Scene.extend({
    gameLayer: null,

    onEnter:function () {
        this._super();
        g_size = cc.winSize;
        initRes();
        this.gameLayer = new GameLayer();
        this.addChild( this.gameLayer );
    }

});

