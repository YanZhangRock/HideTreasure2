cc.game.onStart = function(){
    cc.view.adjustViewPort(true);
    if( cc.sys.isMobile ) {
        var policy = new cc.ResolutionPolicy(
            cc.ContainerStrategy.EQUAL_TO_FRAME,
            cc.ContentStrategy.EXACT_FIT
        )
        cc.view.setDesignResolutionSize( 880, 1200, policy );
    } else {
        cc.view.setDesignResolutionSize( 880, 1200, cc.ResolutionPolicy.SHOW_ALL );
    }
    cc.view.resizeWithBrowserSize(true);
    //cc.screen.requestFullScreen();
    g_size = cc.winSize;
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new GameScene());
    }, this);
};
cc.game.run();