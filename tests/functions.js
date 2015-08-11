/**
 * Created by michal.wadas on 2015-08-11.
 */

var _R = typeof require === 'function' ? require('./lib/reflect-helpers.js') : (typeof window !== 'undefined' ? window._R : null);


describe('_R.isBoundOrNativeFunction', function () {
    it('accepts normal functions', function () {
        expect(_R.isBoundOrNativeFunction(function a() {
        })).toBe(false);
    });
    it('rejects bound functions', function () {
        expect(_R.isBoundOrNativeFunction(function b() {
        }.bind(null))).toBe(true);
    });
    it('rejects native Date constructor', function () {
        expect(_R.isBoundOrNativeFunction(Date)).toBe(true);
    });
    it('rejects function with "[native code]" in body', function () {
        var func = function () {
            /*
             [native code]
             */
        };
        expect(_R.isBoundOrNativeFunction(func)).toBe(false);
    });
    it('ignores  overriden .toString method', function () {
        var p = function () {
        };
        p.toString = function () {
            return p.bind(null).toString()
        };
        expect(_R.isBoundOrNativeFunction(p)).toBe(false);
    });
});

describe('_R.getFunctionSourceCode', function () {
    it('should retrieve code for normal function', function () {
        expect(_R.getFunctionSourceCode(function a(){})).toBe('function a(){}');
    });
    it('throws for invalid type of argument', function () {
        expect(function () {
            _R.getFunctionSourceCode(null);
        }).toThrow();
        expect(function () {
            _R.getFunctionSourceCode(function () {
            }.bind(null));
        }).toThrow();
        expect(function () {
            _R.getFunctionSourceCode(Date);
        }).toThrow();
    });
});

describe('_R.wrapFunction', function () {

    it('modyfies arguments by beforeTransformer', function () {
        var t = _R.wrapFunction(function () {
            return [].reduce.call(arguments, function (a, b) {
                return a + b
            });
        }, function () {
            return [100, 200, 300];
        });
        expect(t(1, 1)).toBe(600);
    });
    it('modifies result using afterTransformer', function () {
        var t = _R.wrapFunction(function () {
            return 1;
        }, function () {
        }, function () {
            return 2;
        });
        expect(t(1,2,3,4,5,6)).toBe(2);
    });
});

