"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.array = array;

var _core = require("./core.js");

var _coder = require("./coder.js");

function array(entry) {
    return {
        encode: function encode(array) {
            return (0, _core.concat)([{ blob: (0, _core.toVarN)(array.length) }].concat(array.map(entry.encode)));
        },
        decode: function decode(_ref) {
            var bits = _ref.bits,
                blob = _ref.blob;

            var size = void 0;

            var _fromVarN = (0, _core.fromVarN)(blob);

            var _fromVarN2 = _slicedToArray(_fromVarN, 2);

            size = _fromVarN2[0];
            blob = _fromVarN2[1];

            var rest = { bits: bits, blob: blob };
            var array = [],
                result = void 0,
                i = void 0;
            for (i = 0; i < size; i++) {
                result = entry.decode(rest);
                array[i] = result.value;
                rest = result.rest;
            }
            return { value: array, rest: rest };
        }
    };
}

(0, _coder.register)('array', array);