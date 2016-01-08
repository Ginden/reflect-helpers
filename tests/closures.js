var _R = typeof require === 'function' ? require('./lib/reflect-helpers.js') : (typeof window !== 'undefined' ? window._R : null);

describe('_R.createClosure', function(){
    it('Checks simple function', function(){
        var a = 0, b = 0;
        var func = function add() {
            return a+b;
        };
        expect(_R.createClosure(func, {a: 1, b: 2})()).toEqual(3);
        expect(_R.createClosure(func, {a: 1})).toThrow();
    });
});

describe('_R.createDynamicClosure', function(){
    it('Checks simple function', function(){

        var func = function add() {
            return (++a)+b;
        };
        var magicClosureBase = _R.createDynamicClosure(func, {a: 0, b: 0});
        var context = magicClosureBase.scope;
        var magicClosure = magicClosureBase.func;
        context.a = 0;
        context.b = 0;
        expect(magicClosure()).toEqual(1);
        expect(context.a).toEqual(1);
        context.a = 0;
        expect(context.a).toEqual(0);

    });
});

describe('_R.createNamedFunction', function(){
    it('Create factorial function', function(){
        var factorial = _R.createNamedFunction('factorial', 'n', 'return n===1 ? 1 : n*factorial(n-1);');
        expect(factorial(5)).toEqual(120);
    });
});

describe('_R.declosureFunction', function(){
    it('works on simple function', function(){
        var Boolean = function(){return true;};
        var closure = function() {return Boolean();};
        var func = _R.declosureFunction(closure);
        expect(closure()).toEqual(true);
        expect(func()).toEqual(false);

    });
    it('throws on native function', function(){
        expect(function(){
            _R.declosureFunction(Boolean)
        }).toThrow();

    });

});

