"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.object = object;

var _core = require("./core.js");

var _coder = require("./coder.js");

function object(entries) {
    return {
        encode: function encode(object) {
            var mapped = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.entries(entries)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _ref = _step.value;

                    var _ref2 = _slicedToArray(_ref, 2);

                    var key = _ref2[0];
                    var value = _ref2[1];

                    mapped.push(object.hasOwnProperty(key) ? [{ bits: _core.notNone }, value.encode(object[key])] : { bits: _core.none });
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return (0, _core.concat)(mapped.flat());
        },
        decode: function decode(_ref3) {
            var bits = _ref3.bits,
                blob = _ref3.blob;

            var object = {};
            Object.entries(entries).forEach(function (_ref4) {
                var _ref5 = _slicedToArray(_ref4, 2),
                    key = _ref5[0],
                    entry = _ref5[1];

                if ((0, _core.isNone)(bits)) {
                    bits = bits.substr(1);
                    return;
                } else {
                    bits = bits.substr(1);
                }

                var result = entry.decode({ bits: bits, blob: blob });
                bits = result.rest.bits;
                blob = result.rest.blob;
                object[key] = result.value;
            });
            return { value: object, rest: { bits: bits, blob: blob } };
        }
    };
}

(0, _coder.register)('object', object);