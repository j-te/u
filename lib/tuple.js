"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.tuple = tuple;

var _core = require("./core.js");

var _coder = require("./coder.js");

function tuple(entries) {
    return {
        encode: function encode(array) {
            return (0, _core.concat)(entries.map(function (entry, i) {
                return entry.encode(array[i]);
            }));
        },
        decode: function decode(rest) {
            var array = [];
            entries.forEach(function (entry, i) {
                var result = entry.decode(rest);
                array[i] = result.value;
                rest = result.rest;
            });
            return { value: array, rest: rest };
        }
    };
}

(0, _coder.register)('tuple', tuple);