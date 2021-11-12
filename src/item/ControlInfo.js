/**
 * @name ControlInfo
 * @class
 * @extends Item
 */

var ControlInfo = Item.extend(
    /** @lends ControlInfo# */ {
        _class: "ControlInfo",
        _content: null,
        _item: null,
        _label: null,
        _background: null,
        _padding: new Point(16, 6),
        _corner: 'topLeft',
        _offset: 18,

        initialize: function ControlInfo(content, point, corner) {
            this._project = paper.project;

            this.setCorner(corner);

            this._initialize(content);
            this.setContent(content);
            this.setPosition(point);
        },

        _initialize: function (content) {
            
            this.setLabel(
                new PointText({
                    fillColor:this._project._controls.fillColor,
                    point: [0, 0],
                    content: content,
                    fontSize: 12,
                    insert: false,
                    fontWeight: 200,
                })
            );

            this.setBackground(
                new Shape.Rectangle({
                    fillColor: this._project._controls.strokeColor,
                    insert: false,
                    position: this._label.position,
                    size: new Size(this._label.bounds).add(this._padding),
                })
            );

            this.setItem(
                new Group({
                    insert: false,
                    children: [this._background, this._label],
                })
            );
            this._updatePivot();
        },

        _updatePivot: function() {
            this._item.pivot = this._item.bounds[this._corner].add(this._getOffset());
        },

        _getOffset: function(){
            var offsets = {
                topLeft: -this._offset,
                topRight: [this._offset, -this._offset],
                topCenter:[0, -this._offset],
                leftCenter: [-this._offset, 0],
                rightCenter: [this._offset, 0],
                bottomLeft: [-this._offset, this._offset],
                bottomRight: this._offset,
                bottomCenter: [0, this._offset],
            };
            
            return offsets[this._corner];
        },

        /**
         * @bean
         * @type String
         */
        getContent: function () {
            return this._content;
        },

        setContent: function (content) {
            this._content = content;

            this._label.set({ content: content });

            this._background.position = this._label.position;
            this._background.size = new Size(this._label.bounds).add(
                this._padding
            );
            this._background.radius = 4;
        },

        /**
         * @bean
         * @type String
         */
        getCorner: function () {
            return this._corner;
        },

        setCorner: function (corner) {
            this._corner = corner;
        },

        /**
         * @bean
         * @type Point
         */
        getPosition: function () {
            return this._position;
        },

        setPosition: function (/* point */) {
            this._position = Point.read(arguments);

            this._item.position = this._position;
            this._updatePivot();
        },

        /**
         * @bean
         * @type PointText
         */
        getLabel: function () {
            return this._label;
        },

        setLabel: function (label) {
            this._label = label;
        },

        /**
         * @bean
         * @type Path
         */
        getBackground: function () {
            return this._background;
        },

        setBackground: function (background) {
            this._background = background;
        },

        /**
         * @bean
         * @type Group
         */
        getItem: function () {
            return this._item;
        },

        setItem: function (item) {
            this._item = item;
        },

        draw: function (ctx, matrix, pixelRatio) {
            var zoom = this._project._view.getZoom();

            ctx.save();

            matrix.applyToContext(ctx);

            var param = new Base({
                offset: new Point(0, 0),
                pixelRatio: pixelRatio,
                viewMatrix: matrix.isIdentity() ? null : matrix,
                matrices: [new Matrix()],
                updateMatrix: true,
            });

            this._item.transform(
                new Matrix().scale(1 / zoom, this.getPosition()),
                false,
                false,
                true
            );

            this._item.draw(ctx, param);

            this._item.transform(
                new Matrix().scale(zoom, this.getPosition()),
                false,
                false,
                true
            );

            ctx.restore();
        },
    }
);
