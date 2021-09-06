/**
 * @name Selector
 * @class
 */
var Selector = Base.extend(/** @lends Selector# */{
    _pathData: null,
    _angle: 0,
    _points: null,
    _bounds: null,
    _position:null,
    _size: null,
    _item: null,
    _owner: null,
    _segments: [],

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

}, Base.each(['pathData', 'angle', 'points', 'bounds', 'position', 'size', 'item', 'segments'],
    function(name) {
        var part = Base.capitalize(name),
            key = '_' + name,
        this['get' + part] = function() {
            return this[key];
        };
        this['set' + part] = function(value) {
            if (value != this[key]) {
                this[key] = value;
            }
        };
    },
{}));