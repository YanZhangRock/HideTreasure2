//(function () {
//    var onBridgeReady = function () {
//        // 分享到朋友圈;
//        WeixinJSBridge.on('menu:share:timeline', function (argv) {
//            WeixinJSBridge.invoke('shareTimeline', {
//                "img_url": " http://smallerpig.qiniudn.com/wp-content/uploads/2013/12/header.jpg",
//                "img_width": "120",
//                "img_height": "120",
//                "link": "www.smallerpig.com",
//                "desc": "你大爷的描述",//经过测试，该值没用 By smallerpig
//                "title": "你大爷的标题"
//            }, function () { });
//        });
//    }
//    if (document.addEventListener) {
//        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
//    } else if (document.attachEvent) {
//        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
//        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
//    }
//})();

cc.game.onStart = function(){
//    document.addEventListener('WeixinJSBridgeReady', function() {
//        // 隐藏按钮，对应的展示参数是：showOptionMenu
//        WeixinJSBridge.call('hideOptionMenu');
//    });
    cc.view.adjustViewPort(true);
    cc.view.setDesignResolutionSize(940, 1300, cc.ResolutionPolicy.SHOW_ALL);
    cc.view.resizeWithBrowserSize(true);
    g_size = cc.winSize;
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new GameScene());
    }, this);


};
cc.game.run();