var _R = typeof require === 'function' ? require('./lib/reflect-helpers.js') : (typeof window !== 'undefined' ? window._R : null);

describe('_R.makeGeneric', function(){
    it('Checks if Array#slice is properly extracted', function(){
        var func = _R.makeGeneric([].slice);
        expect(JSON.stringify(func('abcd'))).toEqual(JSON.stringify('abcd'.split('')));
    });

    it('Checks if Object#toString is properly extracted', function(){
        var func = _R.makeGeneric(Object.prototype.toString);
        expect(func('xd'))
            .toEqual(({}).toString.call('xd'));
    });


});