/**
 * Created by Rock on 9/21/14.
 */

var MyButton = cc.Node.extend({
    img1: null,
    img2: null,
    label: null,
    myHeight: 0,
    myWidth: 0,
    oriStrScale: 1.0,
    callBackFunc: null,

    ctor: function( str, param ) {
        this._super();
        var p = param || {};
        var scale = p.scale ? p.scale : { x:1, y:1 }
        var scaleX = this._getScale( str ) * scale.x;
        var scaleY = MyButton.SCALE_Y * scale.y;
        var img = new cc.Sprite( "#button.png" );
        img.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: 0,
            y: 0
        });
        img.setScaleX( scaleX );
        img.setScaleY( scaleY );
        this.img1 = img;
        this.addChild( img, MyButton.Z.IMG1 );
        img = new cc.Sprite( "#button2.png" );
        img.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: 0,
            y: 0
        });
        img.setScaleX( scaleX );
        img.setScaleY( scaleY );
        this.img2 = img;
        this.addChild( img, MyButton.Z.IMG2 );
        this.label = new cc.LabelTTF( str, "Arial", 60 );
        this.addChild( this.label, MyButton.Z.LABEL );
        this.myHeight = MyButton.HEIGHT * scaleY;
        this.myWidth = MyButton.WIDTH * scaleX;
        this.img2.setVisible( false );
        var pos = p.pos || {x:0,y:0};
        this.x = g_size.width * pos.x;
        this.y = g_size.height * pos.y;
        this.label.setFontSize( p.fontSize || 40 );
        this.label.setString( p.txt || str );
    },

    _getScale: function( str ) {
        var scale = ( str.length - 2 ) * 0.5;
        scale = scale < 0 ? 0 : scale;
        return scale + 1;
    },

    setCallBack: function( callBack ) {
        this.callBackFunc = callBack;
    },

    onTouchBegan: function( touch ) {
        this.img2.setVisible( true );
        this.label.color = Def.COLOR.YELLOW;
        this.oriStrScale = this.label.getScale();
        this.label.setScale( this.oriStrScale + 0.2 );
    },

    onTouchEnded: function( touch, isOut ) {
        this.img2.setVisible( false );
        this.label.color = cc.color.WHITE;
        this.label.setScale( this.oriStrScale );
        // call back
        if( isOut ) return;
        if( !this.callBackFunc ) return;
        this.callBackFunc();
    }
});

MyButton.Z = {
    IMG1: 1, IMG2: 2, LABEL: 3
};

MyButton.WIDTH = 185;
MyButton.HEIGHT = 72;
MyButton.SCALE_Y = 1.5;