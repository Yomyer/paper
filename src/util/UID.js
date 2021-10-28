/*
 * Paper.js - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Copyright (c) 2011 - 2020, Jürg Lehni & Jonathan Puckey
 * http://juerglehni.com/ & https://puckey.studio/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

/**
 * @name UID
 * @class
 */
var UID = Base.extend(
    /** @lends UID# */ {
        _class: "UID",

        statics: /** @lends Item */ {
            _id: 1,
            _pools: {},

            /**
             * Returns the next unique id.
             * @method get
             * @return {Number} the next unique id
             * @private
             * @static
             **/
            get: function (name) {
                if (name) {
                    // Use one UID pool per given constructor
                    var pool = this._pools[name];
                    if (!pool) pool = this._pools[name] = { _id: 1 };
                    return pool._id++;
                } else {
                    // Use the global UID pool:
                    return this._id++;
                }
            },

            /**
             * Returns the unique id.
             * @method generateUID
             * @param {Number} [size=32] The optional x portion of the Coordinate
             * @return {String} the unique uid
             * @static
             **/
            generate: function (size) {
                var uid = [],
                    parts = Math.floor((size || 16) / 4);

                var time = new Date()
                    .getTime()
                    .toString()
                    .split("")
                    .reverse()
                    .join("")
                    .replace(new RegExp("(\\d{2})(\\B)", "g"), "$1-")
                    .split("-");

                for (var x = 0; x < parts; x++) {
                    uid.push(time[x]);
                    uid.push(
                        (
                            "00" + ((Math.random() * 46654566) | 0).toString(36)
                        ).slice(-2)
                    );
                }

                return uid.join("");
            },
        },
    }
);
