"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _each2 = require("lodash/each");

var _each3 = _interopRequireDefault(_each2);

var _map2 = require("lodash/map");

var _map3 = _interopRequireDefault(_map2);

exports.tuple = tuple;

var _core = require("./core.js");

var _coder = require("./coder.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function tuple(entries) {
    return {
        encode: function encode(array) {
            return (0, _core.concat)((0, _map3.default)(entries, function (entry, i) {
                return entry.encode(array[i]);
            }));
        },
        decode: function decode(rest) {
            var array = [];
            (0, _each3.default)(entries, function (entry, i) {
                var result = entry.decode(rest);
                array[i] = result.value;
                rest = result.rest;
            });
            return { value: array, rest: rest };
        }
    };
}

(0, _coder.register)('tuple', tuple);