"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = varchar;

var _core = require("./core.js");

var _coder = require("./coder.js");

function varchar() {
    return {
        encode: function encode(string) {
            return { bits: '', blob: (0, _core.toVarN)(string.length) + string };
        },
        decode: function decode(_ref) {
            var bits = _ref.bits,
                blob = _ref.blob;

            var size;

            var _fromVarN = (0, _core.fromVarN)(blob);

            var _fromVarN2 = _slicedToArray(_fromVarN, 2);

            size = _fromVarN2[0];
            blob = _fromVarN2[1];

            return {
                value: blob.substr(0, size),
                rest: { bits: bits, blob: blob.substr(size) }
            };
        }
    };
}

(0, _coder.register)('varchar', varchar);