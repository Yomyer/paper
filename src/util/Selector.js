/**
 * @name Selector
 * @class
 */
var Selector = Base.extend(
    /** @lends Selector# */ {
        statics: /** @lends Item */ {
            _cache: {},
            _cacheBounds: {},
            _generateSelector: function(owner) {
                if (Selector._isCached(owner)) {
                    return Selector._cache[owner.uid];
                }
                return (Selector._cache[owner.uid] = new Selector(owner));
            },
            _isCached: function(owner) {
                var cache = {
                        area: owner.bounds.area,
                        centerX: owner.bounds.centerX,
                        centerY: owner.bounds.centerY,
                        topLeft: owner.bounds.topLeft,
                        id: owner._id
                    },
                    uid = owner._uid;
                    
                if (
                    Selector._cacheBounds[uid] &&
                    Base.equals(cache, Selector._cacheBounds[uid])
                ) {
                    return true;
                }

                Selector._cacheBounds[uid] = cache;
            },
            clear: function(owner){
                delete Selector._cacheBounds[owner._uid]
            },
            /**
             *
             * @param {Point} point
             * @param {Point} center
             * @param {number} angle
             * @return {Point}
             */
            rotatePoint: function (point, center, angle) {
                var radians = (angle * Math.PI) / 180,
                    diff = point.subtract(center);
                var distance = Math.sqrt(diff.x * diff.x + diff.y * diff.y);

                radians += Math.atan2(diff.y, diff.x);

                return new Point(
                    center.x + distance * Math.cos(radians),
                    center.y + distance * Math.sin(radians)
                );
            },
        },
        _class: "Selector",
        _pathData: null,
        _angle: 0,
        _points: null,
        _bounds: null,
        _position: null,
        _size: null,
        _item: null,
        _segments: [],

        _owner: null,

        /**
         * @name Selector#pathData
         * @type String
         */

        /**
         * @name Selector#angle
         * @type Number
         */

        /**
         * @name Selector#points
         * @type Object {[key: string]: Point}
         */

        /**
         * @name Selector#bounds
         * @type Rectangle
         */

        /**
         * @name Selector#size
         * @type Size
         */

        /**
         * @name Selector#item
         * @type Item
         */

        /**
         * @name Selector#segments
         * @type Segment[]
         */

        initialize: function Selector(owner) {
            this._owner = owner;

            var item = owner;
            if (item.children && item.children.length === 1) {
                item = item.firstChild;
            }

            var angle = item.angle;

            item.set({ rotation: -angle });

            var rectangle = new Rectangle(item.bounds),
                path = new Path.Rectangle({
                    rectangle: rectangle,
                    // insert: false
                });

            var center = path.bounds.center;

            this._points = {
                center: new Point(center),
                topLeft: Selector.rotatePoint(
                    path.bounds.topLeft,
                    center,
                    angle
                ),
                topCenter: Selector.rotatePoint(
                    path.bounds.topLeft.add(
                        new Point(path.bounds.width / 2, 0)
                    ),
                    center,
                    angle
                ),
                topRight: Selector.rotatePoint(
                    path.bounds.topRight,
                    center,
                    angle
                ),
                leftCenter: Selector.rotatePoint(
                    path.bounds.topLeft.add(
                        new Point(0, path.bounds.height / 2)
                    ),
                    center,
                    angle
                ),
                rightCenter: Selector.rotatePoint(
                    path.bounds.topRight.add(
                        new Point(0, path.bounds.height / 2)
                    ),
                    center,
                    angle
                ),
                bottomLeft: Selector.rotatePoint(
                    path.bounds.bottomLeft,
                    center,
                    angle
                ),
                bottomCenter: Selector.rotatePoint(
                    path.bounds.bottomLeft.add(
                        new Point(path.bounds.width / 2, 0)
                    ),
                    center,
                    angle
                ),
                bottomRight: Selector.rotatePoint(
                    path.bounds.bottomRight,
                    center,
                    angle
                ),
            };

            path.set({ rotation: angle, visible: false });
            item.set({ rotation: angle });

            this._angle = angle;
            this._pathData = path.pathData;
            this._position = path.position;
            this._item = item;
            this._segments = path.segments;
            this._bounds = path.bounds;
            this._size = new Size(rectangle.width, rectangle.height);

            path.remove();
        },
    },
    Base.each(
        [
            "pathData",
            "angle",
            "points",
            "bounds",
            "position",
            "size",
            "item",
            "segments",
        ],
        function (name) {
            var part = Base.capitalize(name),
                key = "_" + name;

            this["get" + part] = function () {
                return this[key];
            };

            this["set" + part] = function (value) {
                if (value != this[key]) {
                    this[key] = value;
                }
            };
        },
        {}
    )
);
