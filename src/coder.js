import {bitsToN, nToBits, fromVarN, toVarN} from "./core.js";
import {isObject, sortBy} from "./utils.js";

var availableTypes = {};

export function register(name, type) {
    availableTypes[name] = type;
}

export function encode(coder, object) {
    var {bits, blob} = coder.spec.encode(object);
    return coder.encodedVersion + toVarN(bits.length) + bitsToN(bits) + blob;
}

export function decode(coders, string) {
    var version, bitSize;
    [version, string] = fromVarN(string);
    [bitSize, string] = fromVarN(string);

    var coder = coders.find(c => c.version === version);
    if (!coder) {
	throw new Error(`Invalid version: ${version}`);
    }

    var bitCharSize = Math.ceil(bitSize / 6);
    var bits = nToBits(string.substr(0, bitCharSize), bitSize);
    var blob = string.substr(bitCharSize);
    var result = coder.spec.decode({bits, blob});
    var codersFiltered = coders.filter(coder => coder.version > version);
    var pendingMigrations = codersFiltered.concat().sort(sortBy("version"));
    return pendingMigrations.reduce((value, coder) => coder.migrate(value), result.value);
}

export function fromJson(version, jsonSpec, migrate) {
    function loop(spec) {
	if (Array.isArray(spec)) {
	    var method = spec[0];
        var [ head, ...tail ] = spec;
	    if (method === 'tuple') {
		  return availableTypes.tuple(tail.map(loop));
	    } else if (method === 'array') {
		  return availableTypes.array(loop(spec[1]));
            } else {
		  return availableTypes[method].apply(null, tail);
	    }
	} else if (isObject(spec)) {
	    var entries = Object.keys(spec).sort();
        const entriesMapped = entries.map((key) => {
            return [key, loop(spec[key])];
        });
        return availableTypes.object(Object.fromEntries(entriesMapped));
	}
    }

    return {
	version: version,
	spec: loop(jsonSpec),
	jsonSpec: jsonSpec,
	encodedVersion: toVarN(version),
	migrate: migrate || (x => x)
    };
}
