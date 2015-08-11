/**
 * Created by michal.wadas on 2015-08-11.
 */

var _R = typeof require === 'function' ? require('./lib/reflect-helpers.js') : (typeof window !== 'undefined' ? window._R : null);

describe('_R.indirectEval', function(){
    var global = Function('return this;')();
    it('returns primitives from eval', function(){
        expect(_R.indirectEval('"wow"'))
            .toEqual("wow");
    });
    it('have global object as this', function(){
        expect(_R.indirectEval('this'))
            .toEqual(global);
    });
    it('evaluates expressions', function(){
        expect(_R.indirectEval('2+3'))
            .toEqual(5);
    });
    it('do not modify global scope', function(){
        _R.indirectEval('var _a_ = 5;')
        expect(global._a_)
            .toEqual(undefined);
    });
});