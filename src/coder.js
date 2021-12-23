import {bitsToN, nToBits, fromVarN, toVarN} from "./core.js";
import {isObject, sortBy} from "./utils.js";

const availableTypes = {};

export function register(name, type) {
    availableTypes[name] = type;
}

export function encode(coder, object) {
    const {bits, blob} = coder.spec.encode(object);
    return coder.encodedVersion + toVarN(bits.length) + bitsToN(bits) + blob;
}

export function decode(coders, string) {
    let version, bitSize;
    [version, string] = fromVarN(string);
    [bitSize, string] = fromVarN(string);

    const coder = coders.find(c => c.version === version);
    if (!coder) {
	throw new Error(`Invalid version: ${version}`);
    }

    const bitCharSize = Math.ceil(bitSize / 6);
    const bits = nToBits(string.substr(0, bitCharSize), bitSize);
    const blob = string.substr(bitCharSize);
    const result = coder.spec.decode({bits, blob});
    const codersFiltered = coders.filter(coder => coder.version > version);
    const pendingMigrations = codersFiltered.concat().sort(sortBy("version"));
    return pendingMigrations.reduce((value, coder) => coder.migrate(value), result.value);
}

export function fromJson(version, jsonSpec, migrate) {
    function loop(spec) {
	if (Array.isArray(spec)) {
	    const method = spec[0];
        const [, ...tail ] = spec;
	    if (method === 'tuple') {
		  return availableTypes.tuple(tail.map(loop));
	    } else if (method === 'array') {
		  return availableTypes.array(loop(spec[1]));
            } else {
		  return availableTypes[method].apply(null, tail);
	    }
	} else if (isObject(spec)) {
	    const entries = Object.keys(spec).sort();
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
