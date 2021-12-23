(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["u"] = factory();
	else
		root["u"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.register = exports.decode = exports.encode = exports.fromJson = undefined;

	var _coder = __webpack_require__(1);

	Object.defineProperty(exports, "fromJson", {
	  enumerable: true,
	  get: function get() {
	    return _coder.fromJson;
	  }
	});
	Object.defineProperty(exports, "encode", {
	  enumerable: true,
	  get: function get() {
	    return _coder.encode;
	  }
	});
	Object.defineProperty(exports, "decode", {
	  enumerable: true,
	  get: function get() {
	    return _coder.decode;
	  }
	});
	Object.defineProperty(exports, "register", {
	  enumerable: true,
	  get: function get() {
	    return _coder.register;
	  }
	});

	__webpack_require__(4);

	__webpack_require__(5);

	__webpack_require__(6);

	__webpack_require__(7);

	__webpack_require__(8);

	__webpack_require__(9);

	__webpack_require__(10);

	__webpack_require__(11);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.register = register;
	exports.encode = encode;
	exports.decode = decode;
	exports.fromJson = fromJson;

	var _core = __webpack_require__(2);

	var _utils = __webpack_require__(3);

	function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

	var availableTypes = {};

	function register(name, type) {
	    availableTypes[name] = type;
	}

	function encode(coder, object) {
	    var _coder$spec$encode = coder.spec.encode(object),
	        bits = _coder$spec$encode.bits,
	        blob = _coder$spec$encode.blob;

	    return coder.encodedVersion + (0, _core.toVarN)(bits.length) + (0, _core.bitsToN)(bits) + blob;
	}

	function decode(coders, string) {
	    var version = void 0,
	        bitSize = void 0;

	    var _fromVarN = (0, _core.fromVarN)(string);

	    var _fromVarN2 = _slicedToArray(_fromVarN, 2);

	    version = _fromVarN2[0];
	    string = _fromVarN2[1];

	    var _fromVarN3 = (0, _core.fromVarN)(string);

	    var _fromVarN4 = _slicedToArray(_fromVarN3, 2);

	    bitSize = _fromVarN4[0];
	    string = _fromVarN4[1];


	    var coder = coders.find(function (c) {
	        return c.version === version;
	    });
	    if (!coder) {
	        throw new Error("Invalid version: " + version);
	    }

	    var bitCharSize = Math.ceil(bitSize / 6);
	    var bits = (0, _core.nToBits)(string.substr(0, bitCharSize), bitSize);
	    var blob = string.substr(bitCharSize);
	    var result = coder.spec.decode({ bits: bits, blob: blob });
	    var codersFiltered = coders.filter(function (coder) {
	        return coder.version > version;
	    });
	    var pendingMigrations = codersFiltered.concat().sort((0, _utils.sortBy)("version"));
	    return pendingMigrations.reduce(function (value, coder) {
	        return coder.migrate(value);
	    }, result.value);
	}

	function fromJson(version, jsonSpec, migrate) {
	    function loop(spec) {
	        if (Array.isArray(spec)) {
	            var method = spec[0];

	            var _spec = _toArray(spec),
	                head = _spec[0],
	                tail = _spec.slice(1);

	            if (method === 'tuple') {
	                return availableTypes.tuple(tail.map(loop));
	            } else if (method === 'array') {
	                return availableTypes.array(loop(spec[1]));
	            } else {
	                return availableTypes[method].apply(null, tail);
	            }
	        } else if ((0, _utils.isObject)(spec)) {
	            var entries = Object.keys(spec).sort();
	            var entriesMapped = entries.map(function (key) {
	                return [key, loop(spec[key])];
	            });
	            return availableTypes.object(Object.fromEntries(entriesMapped));
	        }
	    }

	    return {
	        version: version,
	        spec: loop(jsonSpec),
	        jsonSpec: jsonSpec,
	        encodedVersion: (0, _core.toVarN)(version),
	        migrate: migrate || function (x) {
	            return x;
	        }
	    };
	}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.bitsRequired = bitsRequired;
	exports.paddedBinary = paddedBinary;
	exports.isNone = isNone;
	exports.concat = concat;
	exports.toN = toN;
	exports.fromN = fromN;
	exports.fromVarN = fromVarN;
	exports.toVarN = toVarN;
	exports.paddedN = paddedN;
	exports.bitsToN = bitsToN;
	exports.nToBits = nToBits;

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function bitsRequired(maxValue) {
	    if (maxValue === 0) {
	        return 1;
	    }
	    return Math.floor(Math.log(maxValue) / Math.LN2) + 1;
	}

	function paddedBinary(value, bitSize) {
	    var binary = value.toString(2);
	    if (binary.length > bitSize) {
	        throw new Error('Invalid value or bitSize: can\'t fit ' + value + ' in ' + bitSize + ' bits');
	    }

	    return '0'.repeat(bitSize - binary.length) + binary;
	}

	var notNone = exports.notNone = paddedBinary(0, 1);
	var none = exports.none = paddedBinary(1, 1);

	function isNone(bits) {
	    return bits && bits.length >= 1 && bits[0] === none[0];
	}

	function concat(encoded) {
	    return encoded.reduce(function (acc, obj) {
	        return { bits: acc.bits + (obj.bits || ''), blob: acc.blob + (obj.blob || '') };
	    }, { bits: '', blob: '' });
	}

	var availableCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-';
	var base = availableCharacters.length; // 64

	function toN(x) {
	    if (x < 0) {
	        throw new Error('Invalid number: can\'t encode negative number ' + x);
	    }

	    var result = '';
	    while (x >= base) {
	        result = availableCharacters[x % base] + result;
	        x = Math.floor(x / base);
	    }

	    result = availableCharacters[x] + result;
	    return result;
	}

	function fromN(n) {
	    var x = 0,
	        index = void 0;
	    for (var i = 0; i < n.length; i++) {
	        index = availableCharacters.indexOf(n[i]);
	        if (index === -1) {
	            throw new Error('Invalid number: can\'t decode ' + n);
	        }
	        x += index * Math.pow(base, n.length - i - 1);
	    }
	    return x;
	}

	function fromVarN(string) {
	    var str = string;
	    var value = 0;
	    var hasMore = true;
	    while (hasMore) {
	        if (str.length === 0) {
	            throw new Error('Invalid number: can\'t decode ' + string);
	        }
	        var byte = str[0];
	        str = str.substr(1);
	        var n = fromN(byte);
	        hasMore = n > 31;
	        value = value << 5 | n & 31;
	    }
	    return [value, str];
	}

	function toVarN(n) {
	    var result = '';
	    var charsRequired = Math.ceil(bitsRequired(n) / 5);
	    var bits = paddedBinary(n, charsRequired * 5);
	    while (bits) {
	        var part = bits.substr(0, 5);
	        bits = bits.substr(5);
	        part = (bits.length === 0 ? '0' : '1') + part;
	        result += bitsToN(part);
	    }
	    return result;
	}

	function paddedN(x, charSize) {
	    var r = toN(x);
	    if (r.length > charSize) {
	        throw new Error('Invalid charSize: can\'t encode ' + x + ' in ' + charSize + ' chars');
	    }

	    return availableCharacters[0].repeat(charSize - r.length) + r;
	}

	function bitsToN(bits) {
	    var result = '',
	        char = void 0;
	    while (bits) {
	        char = bits.substr(0, 6);
	        bits = bits.substr(6);

	        if (char.length < 6) {
	            char += '0'.repeat(6 - char.length);
	        }
	        result += toN(parseInt(char, 2));
	    }

	    return result;
	}

	function nToBits(chars, bitSize) {
	    return [].concat(_toConsumableArray(chars)).map(function (c) {
	        return paddedBinary(fromN(c), 6);
	    }).join('').substr(0, bitSize);
	}

/***/ }),
/* 3 */
/***/ (function(module, exports) {

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

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = oneOf;

	var _core = __webpack_require__(2);

	var _coder = __webpack_require__(1);

	function oneOf() {
	    for (var _len = arguments.length, choices = Array(_len), _key = 0; _key < _len; _key++) {
	        choices[_key] = arguments[_key];
	    }

	    var bitSize = (0, _core.bitsRequired)(choices.length - 1);
	    return {
	        encode: function encode(choice) {
	            var index = choices.indexOf(choice);
	            if (index === -1) {
	                throw new Error("Invalid choice: " + choice + " is not one of " + choices.join(','));
	            }
	            return { bits: (0, _core.paddedBinary)(index, bitSize), blob: '' };
	        },

	        decode: function decode(_ref) {
	            var bits = _ref.bits,
	                blob = _ref.blob;

	            var index = parseInt(bits.substr(0, bitSize), 2);
	            return {
	                value: choices[index],
	                rest: { bits: bits.substring(bitSize), blob: blob }
	            };
	        }
	    };
	}

	(0, _coder.register)('oneOf', oneOf);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = boolean;

	var _oneOf = __webpack_require__(4);

	var _oneOf2 = _interopRequireDefault(_oneOf);

	var _coder = __webpack_require__(1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function boolean() {
	    return (0, _oneOf2.default)(true, false);
	}

	(0, _coder.register)('boolean', boolean);

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = integer;

	var _core = __webpack_require__(2);

	var _coder = __webpack_require__(1);

	function integer() {
	    return {
	        encode: function encode(int) {
	            var binary = Math.abs(int).toString(2);
	            var bits = (0, _core.paddedBinary)(binary.length, 6) + (int > 0 ? '1' : '0') + binary;
	            return { bits: bits, blob: '' };
	        },
	        decode: function decode(_ref) {
	            var bits = _ref.bits,
	                blob = _ref.blob;

	            var size = parseInt(bits.substr(0, 6), 2);
	            bits = bits.substr(6);
	            var sign = bits[0] === '1' ? 1 : -1;
	            bits = bits.substr(1);
	            return {
	                value: sign * parseInt(bits.substr(0, size), 2),
	                rest: { bits: bits.substr(size), blob: blob }
	            };
	        }
	    };
	}

	(0, _coder.register)('integer', integer);

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.default = varchar;

	var _core = __webpack_require__(2);

	var _coder = __webpack_require__(1);

	function varchar() {
	    return {
	        encode: function encode(string) {
	            return { bits: '', blob: (0, _core.toVarN)(string.length) + string };
	        },
	        decode: function decode(_ref) {
	            var bits = _ref.bits,
	                blob = _ref.blob;

	            var size = void 0;

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

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = fixedChar;

	var _coder = __webpack_require__(1);

	function fixedChar(size) {
	    return {
	        encode: function encode(string) {
	            return { bits: '', blob: string.toString() };
	        },
	        decode: function decode(_ref) {
	            var bits = _ref.bits,
	                blob = _ref.blob;

	            return {
	                value: blob.substr(0, size),
	                rest: { bits: bits, blob: blob.substr(size) }
	            };
	        }
	    };
	}

	(0, _coder.register)('fixedchar', fixedChar);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.object = object;

	var _core = __webpack_require__(2);

	var _coder = __webpack_require__(1);

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

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.tuple = tuple;

	var _core = __webpack_require__(2);

	var _coder = __webpack_require__(1);

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

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.array = array;

	var _core = __webpack_require__(2);

	var _coder = __webpack_require__(1);

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

/***/ })
/******/ ])
});
;