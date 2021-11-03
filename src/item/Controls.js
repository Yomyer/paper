/**
 * @name Controls
 * @class
 */
var Controls = Item.extend(/** @lends Controls# */{
    _class: 'Controls',
    _applyChildrenStyle: false,
    _corners: ['topLeft', 'topCenter', 'topRight', 'rightCenter', 'bottomRight', 'bottomCenter', 'bottomLeft', 'leftCenter'],
    _project: null,
    _angle: 0,
    _width: null,
    _height: null,
    _center: null,
    _topCenter: null,
    _rightCenter: null,
    _bottomCenter: null,
    _leftCenter: null,
    _topLeft: null,
    _topRight: null,
    _bottomRight: null,
    _bottomLeft: null,
    _children: [],

    initialize: function Controls(arg) {
        var that = this;

        this._initialize(arg);
        this._style.set({
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 2,
            shadowOffset: 1,
            strokeColor: 'rgba(0, 142, 252, 1)',
            fillColor: 'white',
            strokeWidth: 0.2
        });

        
        Base.each(this._corners, function(corner){
            var item = new ControlItem(corner);
            item._style.set(that._style.clone());
            that.addControl(item, corner);
        });
    },

    _changed: function(flags, item){

        if(flags & /*#=*/ ChangeFlag.CONTROL){
            item.setRotation(this.angle);
            item.setPosition(this[item.corner]);
        }
        if (flags & /*#=*/ ChangeFlag.GEOMETRY) {
            if(this._project._activeItems.length){
                if(!item._control){
                    var that = this;
                    var controls = this._children;

                    Base.each(this._getActiveItemsInfo(), function(value, key){
                        that['_'+ key] = value || (['angle', 'widht', 'height'].includes(key) ? 0 : null);
                    });

                    for (var x =0; x < controls.length; x++) {
                        controls[x].setRotation(that._angle);
                        controls[x].setPosition(that[controls[x].corner]);
                    }
                }
            }else{
                this._angle = this._width = this._height = 0;
                this._center = this._topCenter = this._rightCenter = this._bottomCenter = 
                this._leftCenter = this._topLeft = this._topRight = this._bottomRight = this._bottomLeft = null;
            }
        }  
    },



    /**
     * @param {Item} item the item to be added as a child
     * @return {Item} the added item, or `null` if adding was not possible
     */
    addControl: function(item, name){
        item.remove();
        this._children.push(item);
        
        if(name){
            this._children[name || item.name] = item;
            this._changed(/*#=*/ChangeFlag.CONTROL, item);
        }
    },
    
    /**
     * @bean
     * @type Number
     */
    getX: function(){
        return this._topLeft.x;
    },

    /**
     * @bean
     * @type Number
     */
    getY: function(){
        return this._topLeft.y;
    },

        
    /**
     * @bean
     * @type Array
     */
    getControls: function(){
        return this._children;
    },

    /**
     * @bean
     * @type Number
     */
    getAngle: function(){
        return this._angle;
    },

    /**
     * @bean
     * @type Number
     */
    getWidth: function(){
        return this._width;
    },

    /**
     * @bean
     * @type Number
     */
    getHeight: function(){
        return this._height;
    },

    /**
     * @bean
     * @type Point
     */
    getCenter: function(){
        return this._center;
    },

    /**
     * @bean
     * @type Point
     */
    getTopLeft: function(){
        return this._topLeft;
    },

    /**
     * @bean
     * @type Point
     */
     getTopCenter: function(){
        return this._topCenter;
    },

    /**
     * @bean
     * @type Point
     */
    getTopRight: function(){
        return this._topRight;
    },

    /**
     * @bean
     * @type Point
     */
    getRightCenter: function(){
        return this._rightCenter;
    },

    /**
     * @bean
     * @type Point
     */
    getBottomRight: function(){
        return this._bottomRight;
    },

    /**
     * @bean
     * @type Point
     */
    getBottomCenter: function(){
        return this._bottomCenter;
    },

    /**
     * @bean
     * @type Point
     */
    getBottomLeft: function(){
        return this._bottomLeft;
    },

    /**
     * @bean
     * @type Point
     */
    getLeftCenter: function(){
        return this._leftCenter;
    },

    _getActiveItemsInfo: function() {
        var items = this._project._activeItems;
        if(items.length){
            var info = items[0].activeInfo;

            if (items.length > 1) {
                var rect = items[0].bounds;
                for (var x in items) {
                    rect = rect.unite(items[x].bounds);
                }
                info = {
                    angle: 0,
                    width: rect.width,
                    height: rect.height,
                    center: rect.center,
                    topCenter: rect.topCenter,
                    rightCenter: rect.rightCenter,
                    bottomCenter: rect.bottomCenter,
                    leftCenter: rect.leftCenter,
                    topLeft: rect.topLeft,
                    topRight: rect.topRight,
                    bottomRight: rect.bottomRight,
                    bottomLeft: rect.bottomLeft,
                };
            }
    
            return info;
        }
        return null;
    },
    
    draw: function(ctx, matrix, pixelRatio){
        var items = this._project._activeItems;
        var controls = this._children;

        matrix = matrix.appended(this.getGlobalMatrix(true));

        ctx.lineWidth = 0.3;
        ctx.strokeStyle = this.strokeColor.toCanvasStyle(ctx, matrix);

        for (var x in items) {
            items[x]._drawActivation(ctx, matrix, items.length > 1);
        }

        var bounds = matrix._transformBounds(this);

        if(items.length > 1){
            ctx.beginPath();
            ctx.moveTo(bounds.topLeft.x, bounds.topLeft.y);
            ctx.lineTo(bounds.topRight.x, bounds.topRight.y);
            ctx.lineTo(bounds.bottomRight.x, bounds.bottomRight.y);
            ctx.lineTo(bounds.bottomLeft.x, bounds.bottomLeft.y);
            ctx.closePath();
            
            ctx.stroke();
        }

        matrix.applyToContext(ctx);

        var param = new Base({
            offset: new Point(0, 0),
            pixelRatio: pixelRatio,
            viewMatrix: matrix.isIdentity() ? null : matrix,
            matrices: [new Matrix()],
            updateMatrix: true,
        });

        for (var x = 0; x < controls.length; x++) {
            // new Matrix().scale(0.95).applyToContext(ctx);
            this._children[x].draw(ctx, param);
        }
        
    }
}, {
    statics: {
        create: function(project) {
            return new Controls(project);
        }
    },
});