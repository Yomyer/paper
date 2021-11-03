/**
 * @name ControlItem
 * @class
 */

var ControlItem = Item.extend(
    /** @lends Controls# */ {
        _class: "ControlItem",
        _item: null,
        _corner: null,
        _offset: null,
        _control: true,

        initialize: function ControlItem(corner, offset, item) {
            this._project = paper.project;
            if (item) {
                item.remove();
                this._item = item;
            } else {
                this._item = this._createDefaultItem();
            }
            this._item._control = this;
            this._corner = corner;
            this._offset = Point.read([offset]);
            this._style = this._item._style;
        },

        setActived: function () {},

        /**
         * @bean
         * @type String
         */
        getItem: function () {
            return this._item;
        },

        setItem: function (item) {
            this._item = item;
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
        getOffset: function () {
            return this._offset;
        },

        setOffset: function (/* point */) {
            this._offset = Point.read(arguments);
        },

        getPosition: function (_dontLink) {
            return this._item.getPosition(_dontLink);
        },

        setPosition: function (/* point */) {
            var matrix = new Matrix().rotate(this._item.getRotation());
            var offset = matrix._transformPoint(this._offset);
            this._item.setPosition(Point.read(arguments).add(offset));
        },

        getRotation: function () {
            return this._item.getRotation();
        },

        setRotation: function (rotation) {
            this._item.setRotation(rotation);
        },

        getBounds: function () {
            return this._item.getBounds();
        },

        setBounds: function (/* rect */) {
            this._item.setBounds(arguments);
        },

        _createDefaultItem: function () {
            return new Shape.Rectangle({
                size: 7,
                insert: false,
            });
        },

        _hitTest: function (point, options) {
            var scale = this._project._view.getScaling();
            var hit;

            if (
                this._item._locked ||
                !this._item._visible ||
                !options.controls
            ) {
                return null;
            }

            this._item.transform(
                new Matrix().scale(
                    new Point(1).divide(scale),
                    this.getPosition(true)
                ),
                false,
                false,
                true
            );

            if (this._item._hitTest(point, options)) {
                hit = new HitResult("fill", this);
                var match = options.match;

                if (match && !match(hit)) {
                    hit = null;
                }

                if (hit && options.all) {
                    options.all.push(hit);
                }
            }

            this._item.transform(
                new Matrix().scale(scale, this.getPosition(true)),
                false,
                false,
                true
            );

            return hit;
        },

        emit: function emit(type, event) {
            var handlers =
                (this._project._controls._callbacks &&
                    this._project._controls._callbacks[type]) ||
                [];

            handlers = (this._callbacks && this._callbacks[type]) || handlers;

            if (!handlers.length) return false;
            var args = Base.slice(arguments, 1),
                setTarget = event && event.target && !event.currentTarget;

            handlers = handlers.slice();
            if (setTarget) event.currentTarget = this;
            for (var i = 0, l = handlers.length; i < l; i++) {
                if (handlers[i].apply(this, args) == false) {
                    if (event && event.stop) event.stop();
                    break;
                }
            }
            if (setTarget) delete event.currentTarget;
            return true;
        },

        responds: function responds(type) {
            return !!!!(
                (this._callbacks && this._callbacks[type]) ||
                (this._project._controls._callbacks &&
                    this._project._controls._callbacks[type])
            );
        },

        draw: function (ctx, param) {
            var scale = this._project._view.getScaling();

            this._item.transform(
                new Matrix().scale(
                    new Point(1).divide(scale),
                    this.getPosition(true)
                ),
                false,
                false,
                true
            );
            this._item.draw(ctx, param);
            this._item.transform(
                new Matrix().scale(scale, this.getPosition(true)),
                false,
                false,
                true
            );
        },
    }
);
