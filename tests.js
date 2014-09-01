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
                message += ' No, it isn\'t'+(implementationDependant ? ' (depends on implementation)' : '')+'!';
                console.error(message);
                if (!implementationDependant) {
                    throw Error([message, this.expected, this.actual]);
                }
                else {
                    expect.log.push([message, this.expected, this.actual, Error()]);
                }
            } else if (this.result === true) {
                message += ' Yes, it is.';
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



