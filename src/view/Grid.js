/**
 * @name Grid
 * @class
 */
var Grid = Base.extend(
    /** @lends Grid# */ {
        _class: "Grid",

        _color: null,
        _size: null,
        _opacity: null,
        _parent: null,

        /**
         * Creates a Grid object.
         *
         * @name Grid#initialize
         */
        /**
         * Creates a Grid object.
         *
         * @name Grid#initialize
         * @param {Object} object an object containing properties to be set on the
         * rectangle
         *
         * @example
         * var rectangle = new Grid({
         *     color: 'red',
         *     size: 60,
         *     opacity: 0.5,
         *     parent: item
         * });
         *
         */
        /**
         * Creates a Grid object.
         *
         * @name Grid#initialize
         * @param {Artboard|Project} parent
         * @param {Color} color
         * @param {Size} Size
         * @param {Number} [opacity]
         */
        initialize: function Grid(arg0, arg1, arg2, arg3) {
            var type = typeof arg0;

            if (arg0 instanceof Artboard || arg0 instanceof Project) {
                this._set(arg0, arg1, arg2, arg3);
            } else if (type === "undefined" || arg0 === null) {
                this._set(paper.project);
            } else {
                this._set(arg0);
            }
        },

        _set: function (parent, color, size, opacity) {
            this.parent = parent;
            this.color = color;
            this.size = size;
            this.opacity = opacity;
            return this;
        },

        /**
         * @bean
         * @type Color
         */
        getColor: function () {
            return this._color;
        },

        setColor: function (/* color */) {
            this._color = Color.read((arguments[0] && arguments) || ["black"]);
        },

        /**
         * @bean
         * @type Size
         */
        getSize: function () {
            return this._size;
        },

        setSize: function (/* size */) {
            this._size = Size.read((arguments[0] && arguments) || [1]);
        },

        /**
         * @bean
         * @type Number
         */
        getOpacity: function () {
            return this._opacity;
        },

        setOpacity: function (opacity) {
            this._opacity = opacity || 0.1;
        },

        /**
         * @bean
         * @type Artboard | Project
         */
        getParent: function () {
            return this._parent;
        },

        setParent: function (parent) {
            this._parent = parent;
            this._parent.grid = this;
        },

        /**
         * @bean
         * @type Project
         */
        getProject: function () {
            return this.isView() ? this._parent : this._parent._project;
        },

        /**
         * @bean
         * @type Project
         */
        getView: function () {
            return this.getProject()._view;
        },

        getBounds: function () {
            return this.getView().bounds;
        },

        isView() {
            return this.getParent() instanceof Project;
        },

        _drawHorizontal(ctx) {
            var bounds = this.getBounds(),
                size = bounds.size.round(),
                point = bounds.point.round(),
                offset = this.getSize().width;

            for (var x = point.x - point.x % offset; x <= size.width + point.x; x = x + offset) {
                ctx.moveTo(x, point.y - offset);
                ctx.lineTo(x, point.y + size.height + offset);
            }
        },

        _drawVertical(ctx) {
            var bounds = this.getBounds(),
                size = bounds.size.round(),
                point = bounds.point.round();
            offset = this.getSize().height;

            for (var y = point.y - point.y % offset; y <= size.height + point.y; y = y + offset) {
                ctx.moveTo(point.x - offset, y);
                ctx.lineTo(point.x + size.width + offset, y);
            }
        },

        draw: function (ctx, matrix, pixelRatio) {
            var project = this.getProject(),
                view = this.getView(),
                zoom = view.getZoom();

            if (this.isView() && zoom < 5) {
                return;
            }

            ctx.strokeStyle = this._color.toCanvasStyle(ctx, matrix);
            ctx.globalAlpha = this._opacity;
            ctx.lineWidth = 0.5 * (1 / zoom);
            ctx.beginPath();
            this._drawHorizontal(ctx);
            this._drawVertical(ctx);
            ctx.stroke();
        },
    },
    new function () {
        item = {
            beans: true,
            _grid: null,
            getGrid: function () {
                return this._grid;
            },
            setGrid: function (grid) {
                this._grid = grid;
            },
        };
        Artboard.inject(item);
        Project.inject(item);
    }
);
