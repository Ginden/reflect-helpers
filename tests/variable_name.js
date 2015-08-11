/**
 * Created by michal.wadas on 2015-08-11.
 */

var _R = typeof require === 'function' ? require('../index.js') : (typeof window !== 'undefined' ? window._R : null);



describe('_R.isValidVariableName', function () {
    it('accepts "a" as argument name', function () {
        expect(_R.isValidVariableName("a")).toBe(true);
    });
    it('accepts "b" as argument name', function () {
        expect(_R.isValidVariableName("b")).toBe(true);
    });
    it('accepts "c" as argument name', function () {
        expect(_R.isValidVariableName("c")).toBe(true);
    });
    it('accepts "d" as argument name', function () {
        expect(_R.isValidVariableName("d")).toBe(true);
    });
    it('rejects "var" as argument name', function () {
        expect(_R.isValidVariableName("var")).toBe(false);
    });
    it('rejects "any way to do this is valid" as argument name', function () {
        expect(_R.isValidVariableName("any way to do this is valid")).toBe(false);
    });
    it('rejects ({oh:"hai"}) as argument name', function () {
        expect(_R.isValidVariableName(({oh: "hai"}))).toBe(false);
    });
    it('accepts ({toString:(function () {    return \'fromToString\';})}) as argument name', function () {
        expect(_R.isValidVariableName(({
            toString: (function () {
                return 'fromToString';
            })
        }))).toBe(true);
    });
    it('rejects 4 as argument name', function () {
        expect(_R.isValidVariableName(4)).toBe(false);
    });
    it('rejects "4" as argument name', function () {
        expect(_R.isValidVariableName("4")).toBe(false);
    });
    it('rejects false as argument name', function () {
        expect(_R.isValidVariableName(false)).toBe(false);
    });
    it('accepts "undefined" as argument name', function () {
        expect(_R.isValidVariableName("undefined")).toBe(true);
    });
    it('rejects "null" as argument name', function () {
        expect(_R.isValidVariableName("null")).toBe(false);
    });
    it('rejects null as argument name', function () {
        expect(_R.isValidVariableName(null)).toBe(false);
    });
    it('rejects "\"wow\"" as argument name', function () {
        expect(_R.isValidVariableName("\"wow\"")).toBe(false);
    });
    it('rejects "function" as argument name', function () {
        expect(_R.isValidVariableName("function")).toBe(false);
    });
    it('rejects "//wow" as argument name', function () {
        expect(_R.isValidVariableName("//wow")).toBe(false);
    });
    it('accepts "/* wow */ a" as argument name', function () {
        expect(_R.isValidVariableName("/* wow */ a")).toBe(true);
    });
    it('rejects "/* wow a" as argument name', function () {
        expect(_R.isValidVariableName("/* wow a")).toBe(false);
    });
});


