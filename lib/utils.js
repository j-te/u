"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.sortBy = sortBy;
exports.isObject = isObject;
function sortBy(key) {
    return function (a, b) {
        return a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0;
    };
}

function isObject(object) {
    return (typeof object === "undefined" ? "undefined" : _typeof(object)) === "object" && object !== null;
}