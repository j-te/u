"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _each2 = require("lodash/each");

var _each3 = _interopRequireDefault(_each2);

var _has2 = require("lodash/has");

var _has3 = _interopRequireDefault(_has2);

var _map2 = require("lodash/map");

var _map3 = _interopRequireDefault(_map2);

var _flatten2 = require("lodash/flatten");

var _flatten3 = _interopRequireDefault(_flatten2);

exports.object = object;

var _core = require("./core.js");

var _coder = require("./coder.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function object(entries) {
	return {
		encode: function encode(object) {
			return (0, _core.concat)((0, _flatten3.default)((0, _map3.default)(entries, function (entry, key) {
				if ((0, _has3.default)(object, key)) {
					return [{ bits: _core.notNone }, entry.encode(object[key])];
				}
				return { bits: _core.none };
			})));
		},
		decode: function decode(_ref) {
			var bits = _ref.bits,
			    blob = _ref.blob;

			var object = {};
			(0, _each3.default)(entries, function (entry, key) {
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