import {fromJson, encode, decode} from "../src/u.js";
import {nToBits, bitsToN, fromN, toN, fromVarN, toVarN, paddedBinary, paddedN} from "../src/core.js";
import jsc from "jsverify";
import _ from "lodash";
import util from "util";
import assert from "assert";

// todo: review testing/migrate/remove lodash

const oneOf = jsc.nearray(jsc.json).smap((array) => {
    const r = jsc.random(0, array.length - 1);
    return [['oneOf'].concat(array), array[r]];
}, (x) => _.tail(x[0]));

const boolean = jsc.bool.smap(bool => {
    return [['boolean'], bool];
}, ([spec, value]) => value);

const integer = jsc.integer.smap(n => {
    return [['integer'], n];
}, ([spec, value]) => value);

const varchar = jsc.string.smap(x => {
    return [['varchar'], x];
}, ([spec, value]) => value);

const fixedchar = jsc.string.smap(x => {
    return [['fixedchar', x.length], x];
}, ([spec, value]) => value);

const wrap = (object) => {
    const spec = {}, sample = {};
    _.each(object, (value, key) => {
        spec[key] = value[0];
        if (jsc.random(0, 5) !== 0) {
            sample[key] = value[1];
        }
    });
    return [spec, sample];
};

const unwrap = (value) => {
    const spec = value[0], sample = value[1];
    const result = {};
    _.each(spec, (value, key) => {
        result[key] = [value, sample[key]];
    });
    return result;
};

const wrapTuple = (array) => {
    return [['tuple'].concat(_.map(array, ([spec, value]) => spec)), _.map(array, ([spec, value]) => value)];
};

const unwrapTuple = (wrapped) => {
    return _.map(_.tail(wrapped[0]), (spec, i) => [spec, wrapped[1][i]]);
};

const wrapArray = ([spec, value]) => {
    return [['array', spec], _.times(jsc.random(1, 20), _.constant(value))];
};

const unwrapArray = (wrapped) => {
    return [wrapped[0][1], wrapped[1][0]];
};

const generateObject = jsc.generator.recursive(
    jsc.generator.oneof([oneOf.generator, boolean.generator, integer.generator, varchar.generator, fixedchar.generator]),
    function (gen) {
        return jsc.generator.oneof([jsc.generator.dict(gen).map(wrap), jsc.generator.nearray(gen).map(wrapTuple), gen.map(wrapArray)]);
    }
);

const shrinkObject = jsc.shrink.bless((value) => {
    const spec = value[0];
    if (_.isArray(spec)) {
        const type = spec[0];
        switch (type) {
        case 'oneOf': return oneOf.shrink(value);
        case 'boolean': return boolean.shrink(value);
        case 'tuple': return jsc.shrink.nearray(shrinkObject)(unwrapTuple(value)).map(wrapTuple);
        case 'array': return shrinkObject(unwrapArray(value)).map(wrapArray);
        case 'integer': return integer.shrink(value);
        case 'varchar': return varchar.shrink(value);
        case 'fixedchar': return fixedchar.shrink(value);
        default: throw new Error(`Invalid type ${type}`);
        }
    } else {
        return shrinkDictObject(unwrap(value)).map(wrap);
    }
});

const shrinkDictObject = (() => {
    const pairShrink = jsc.shrink.pair(jsc.string.shrink, shrinkObject);
    const arrayShrink = jsc.shrink.array(pairShrink);

    return arrayShrink.smap(jsc.utils.pairArrayToDict, jsc.utils.dictToPairArray);
})();

const object = jsc.bless({
    generator: generateObject,
    shrink: shrinkObject,
    show: jsc.show
});

function validate(generator, debug) {
    return function () {
        this.timeout(Infinity);
        jsc.assert(jsc.forall(generator, (x) => {
            const [spec, value] = x;
            const coder = fromJson(1, spec);
            const encoded = encode(coder, value);
            const decoded = decode([coder], encoded);
            if (!_.isEqual(value, decoded)) {
                console.log('spec ', spec);
                console.log('value', util.inspect(value, {depth: null}));
                console.log('encoded', encoded);
                console.log('decoded', util.inspect(decoded, {depth: null}));
            }
            return _.isEqual(decoded, value);
        }));
    };
}

function validateExample(spec, value) {
    return () => {
        const coder = fromJson(1, spec);
        const encoded = encode(coder, value);
        const decoded = decode([coder], encoded);
        if (!_.isEqual(value, decoded)) {
            console.log('spec ', spec);
            console.log('value', util.inspect(value, {depth: null}));
            console.log('encoded', encoded);
            console.log('decoded', util.inspect(decoded, {depth: null}));
        }

        assert.deepEqual(value, decoded);
    };
}

describe('u', () => {
    describe('primitives', () => {
        it('oneOf', validate(oneOf));
        it('boolean', validate(boolean));
        it('number', validate(integer));
        it('varchar', validate(varchar));
        it('fixedchar', validate(fixedchar));
        it('object', validate(object));
        it('tuple', validateExample(['tuple', ['integer'], ['boolean']], [0, true]));
        it('array', () => {
            validateExample(['array', ['integer']], [0, 1, 3, 4])();
            validateExample(['array', ['integer']], [])();
            validateExample(['array', ['varchar']], ['aasdfas', 'asasasd', 'asdasd'])();
            validateExample(['array', ['varchar']], ['', '', 'asdasd'])();
        });

        it('should handle unspecified keys', () => {
            validateExample({'a': {'a': ['boolean']}}, {})();
            validateExample({'a': {'a': ['boolean']}}, {a: {a: false}})();
            validateExample({'a': {'a': ['boolean'], 'b': ['boolean']}}, {a: {b: false}})();
        });
    });

    describe('core', () => {
        it('should pad numbers', () => {
            jsc.assert(jsc.forall("nat", (x) => {
                return _.isEqual(parseInt(paddedBinary(x, 64), 2), x);
            }));
        });

        it('should encode decode bits', () => {
            jsc.assert(jsc.forall("nearray nat", (xs) => {
                const bits = _.map(xs, x => x.toString(2)).join('');
                return _.isEqual(nToBits(bitsToN(bits), bits.length), bits);
            }));
        });

        it('should encode decode numbers', () => {
            assert.equal(fromN(toN(0)), 0);
            assert.equal(fromN(toN(63)), 63);
            assert.equal(fromN(toN(64)), 64);
            assert.equal(fromN(toN(65)), 65);
            jsc.assert(jsc.forall('nat', (n) => {
                return _.isEqual(fromN(toN(n)), n);
            }));
        });

        it('should encode decode numbers in variable length', () => {
            assert.equal(fromVarN(toVarN(0))[0], 0);
            assert.equal(fromVarN(toVarN(31))[0], 31);
            assert.equal(fromVarN(toVarN(32))[0], 32);
            assert.equal(fromVarN(toVarN(33))[0], 33);
            jsc.assert(jsc.forall('nat', (n) => {
                return _.isEqual(fromVarN(toVarN(n))[0], n);
            }));
        });
    });

    describe('version', function () {
	it('picks the correct version', function () {
	    const version1 = fromJson(1, {a: ['integer']}),
		version2 = fromJson(2, {a: ['boolean']}),
		version3 = fromJson(3, {d: ['fixedchar', 2]});

	    const coders = [version1, version2, version3];
	    assert.deepEqual(decode(coders, encode(version1, {a: 10})), {a: 10});
	    assert.deepEqual(decode(coders, encode(version2, {a: true})), {a: true});
	    assert.deepEqual(decode(coders, encode(version3, {d: 'he'})), {d: 'he'});
	});
    });

    describe('example', () => {
        it('works', () => {
            // used in README
            const spec = {
                lookingFor: ['oneOf', 'bride', 'groom'],
                age: ['tuple', ['integer'] /* min */, ['integer'] /* max */],
                religion: ['oneOf', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Parsi', 'Jain', 'Buddhist', 'Jewish', 'No Religion', 'Spiritual', 'Other'],
                motherTongue: ['oneOf', 'Assamese', 'Bengali', 'English', 'Gujarati', 'Hindi', 'Kannada', 'Konkani', 'Malayalam', 'Marathi', 'Marwari', 'Odia', 'Punjabi', 'Sindhi', 'Tamil', 'Telugu', 'Urdu'],
                onlyProfileWithPhoto: ['boolean']
            };

            const v1 = fromJson(1, spec);

            const encodedv1 = encode(v1, {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true});
            assert.equal(encodedv1, 'bHhc9I-aqa');
            assert.deepEqual(decode([v1], encodedv1), {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true});

            const newSpec = _.extend({}, spec, {
                maritialStatus: ['oneOf', "Doesn't Matter", 'Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce', 'Annulled']
            });

            const v2 = fromJson(2, newSpec, function (old) {
                old.maritialStatus = "Doesn't Matter";
                return old;
            });

            assert.deepEqual(decode([v1, v2], encodedv1), {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: "Doesn't Matter"});
            const encodedv2 = encode(v2, {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: 'Never Married'});
            assert.equal(encodedv2, 'cHlc9I-aHaa');
            assert.deepEqual(decode([v1, v2], encodedv2), {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: 'Never Married'});
        });
    });
});
