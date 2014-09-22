/**
 * Created by Rock on 9/21/14.
 */

var MyLabel = cc.Node.extend({
    img: null,
    label: null,

    ctor: function( str, size, scale ) {
        this._super();
        var scale = scale ? scale : { x:1, y:1 }
        var scaleX = this._getScale( str ) * scale.x;
        var scaleY = MyLabel.SCALE_Y * scale.y;
        var img = new cc.Sprite( "#msgbox1.png" );
        img.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: 0,
            y: 0
        });
        img.setScaleX( scaleX );
        img.setScaleY( scaleY );
        this.img = img;
        this.addChild( img, MyLabel.Z.IMG );
        this.label = new cc.LabelTTF( str, "Arial", size );
        this.label.color = Def.COLOR.GREEN;
        this.addChild( this.label, MyLabel.Z.LABEL );
    },

    _getScale: function( str ) {
        var scale = ( str.length - 3 ) * 0.6;
        scale = scale < 0 ? 0 : scale;
        return scale + 1;
    }
});

MyLabel.Z = {
    IMG: 1, LABEL: 2
};
MyLabel.SCALE_Y = 1.2;