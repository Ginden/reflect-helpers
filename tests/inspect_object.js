/**
 * Created by michal.wadas on 2015-08-11.
 */

var _R = typeof require === 'function' ? require('./lib/reflect-helpers.js') : (typeof window !== 'undefined' ? window._R : null);

describe('_R.getInternalClass', function () {
    it('identify primitives', function () {
        expect(_R.getInternalClass('abcd')).toBe('String');
        expect(_R.getInternalClass(5)).toBe('Number');
        expect(_R.getInternalClass(null)).toBe('Null');
        expect(_R.getInternalClass(undefined)).toBe('Undefined');
        expect(_R.getInternalClass(Infinity)).toBe('Number');
        expect(_R.getInternalClass(NaN)).toBe('Number');
        expect(_R.getInternalClass(true)).toBe('Boolean');
    });
    it('identify common types', function(){
        expect(_R.getInternalClass({})).toBe('Object');
        expect(_R.getInternalClass([])).toBe('Array');
        expect(_R.getInternalClass(function f(){})).toBe('Function');
    });
});

describe('_R.getObjectPrototype', function () {
    it('return null for primitives', function() {
        [null, undefined, 1, 'aaa', NaN, true].forEach(function(primitive){
            expect(_R.getObjectPrototype(primitive)).toBe(null);
        });
    });
    it('retrieves valid object for literals', function(){
        expect(_R.getObjectPrototype({})).toBe(Object.prototype);
        expect(_R.getObjectPrototype([])).toBe(Array.prototype);
        expect(_R.getObjectPrototype(/wow/)).toBe(RegExp.prototype);
        expect(_R.getObjectPrototype(function(){})).toBe(Function.prototype);
    });
    it('retrieves valid object for user class', function(){
        function Foo(){}
        expect(_R.getObjectPrototype(new Foo)).toBe(Foo.prototype);
    });
});

describe('_R.getPrototypesChain', function () {
    it('retrieves valid object for arrays', function(){
        var p = ['a'];
        expect(_R.getPrototypesChain(p)).toEqual([p, Array.prototype, Object.prototype, null]);
    });
});

