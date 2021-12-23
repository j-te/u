"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.register = register;
exports.encode = encode;
exports.decode = decode;
exports.fromJson = fromJson;

var _core = require("./core.js");

var _utils = require("./utils.js");

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
    var version, bitSize;

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