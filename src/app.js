var g_size = {};
var g_layer;

var GameScene = cc.Scene.extend({
    layer: null,

    onEnter:function () {
        this._super();
        g_size = cc.winSize;
        initRes();
        //this.layer = new GameLayer();
        //this.layer = new EditorLayer();
        //this.layer = new MenuLayer( this );
        this.layer = new DiceLayer( this );
        g_layer = this.layer;
        this.addChild( this.layer );
    }

});

