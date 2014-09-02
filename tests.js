var _R = require('./reflect-helpers.js');
function expect(expected) {
    expect.count = 0 || expect.count++;
    return {
        toEqual: function(actual) {
            this.actual = actual;
            return this;
        },
        setTestName: function(name) {
            this.name = name;
            return this;
        },
        run: function() {
            // NaN case
            if (this.expected !== this.expected) {
                this.result =  this.expected !== this.actual;
            }
            else {
                this.result = (this.expected === this.actual);
            }
            return this;
        },
        end: function(implementationDependant) {
            var message = 'Test. '+(this.name || expect.count);
            if (this.result === false) {
                message += (implementationDependant ?
                            ' Depends on implementation, but it isn\'t behavior expected by _R.' :
                            'Ouh, it shouldn\'t work this way!');
                console.error(message);
                if (!implementationDependant) {
                    throw JSON.stringify({message: message, expected: this.expected, actual: this.actual});
                }
                else {
                    expect.log.push([message, this.expected, this.actual, Error()]);
                }
            } else if (this.result === true) {
                message += ' Result is correct' + (implementationDependant ? ' (but it is implementation dependant)' : '')+'.';
                console.log(message);
            } else {
                throw new Error('Invalid test case');
            }
        },
        expected: expected,
        actual: undefined
    };
}
expect.log = [];
(function(){
    console.log('\n Testing _R.isValidVariableName \n');
var varsIdentifiers = [
    ['a', true],
    ['b', true],
    ['c', true],
    ['d', true],
    ['var', false],
    ['any way to do this is valid', false],
    [{oh: 'hai'}, false],
    [{toString: function(){return 'fromToString';}}, true],
    [4, false],
    ['4', false],
    [false, false],
    ['undefined', true],
    ['null', false],
    [null, false],
    ['"wow"', false],
    ['function', false],
    ['//wow', false],
    ['/* wow */ a', true],
    ['/* wow a', false],
];
var id, expectedVal, implementationDependant, test;
for (var i = 0; i < varsIdentifiers.length; i++) {
    id = varsIdentifiers[i][0];
    expectedVal = varsIdentifiers[i][1];
    implementationDependant = !!(varsIdentifiers[i][2]);
    expect(
        _R.isValidVariableName(id)
    ).toEqual(
        expectedVal
    ).setTestName('Is "'+id+'" valid variable name?').run().end(implementationDependant);
}
})();

(function(){
    console.log('\n Testing _R.isBoundOrNativeFunction \n');
var functions = [
    [function a() {}, false],
    [(function b(){}).bind(null), true],
    [console.log, true, true],
    [Date, true],
    [Date.bind(null), true],
    [setTimeout, true, true],
    [Date, true],
    [(function() {/*
    [native code]
*/}), false],
    [(function a() {
        a.toString = Function.toString.bind(setTimeout);
        return a;
        })(), false],
    [eval, true]
];
var prepare;
try {
    prepare = [eval('() => global'), false];
    functions.push(prepare);
    prepare = [eval('(a) => a'), false];
    functions.push(prepare)
    prepare = [eval('(() => global).bind(null)'), true];
    functions.push(prepare)
}
catch (e) {
    console.log('\nThis implementation does not support arrow functions. Ommiting tests.\n');
}
var func, expectedVal, implementationDependant, test;
for (var i = 0; i < functions.length; i++) {
    func = functions[i][0];
    expectedVal = functions[i][1];
    implementationDependant = !!(functions[i][2]);
    expect(
        _R.isBoundOrNativeFunction(func)
    ).toEqual(
        expectedVal
    ).setTestName('Is function ("'+(func.name || i)+'") native or bound?').run().end(implementationDependant);
}
})();


