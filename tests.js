(function(_R) {
    var global = this || (1, eval)(this);
    try {
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
                        this.result = this.expected !== this.actual;
                    } else if (_R.getInternalClass(this.actual) === 'Array') {
                        if (this.expected.length !== this.actual.length) {
                            return false;
                        }
                        for (var i = 0; i < this.actual.length; i++) {
                            if (this.actual[i] !== this.expected[i]) {
                                return false;
                            }
                        }
                        return true;
                    } else {
                        this.result = (this.expected === this.actual);

                    }
                    return this;
                },
                end: function(implementationDependant) {
                    var message = 'Test. ' + (this.name || expect.count);
                    if (this.result === false) {
                        message += (implementationDependant ?
                            ' Depends on implementation, but it isn\'t behavior expected by _R.' :
                            'Ouh, it shouldn\'t work this way!');
                        console.warn(message);
                        if (!implementationDependant) {
                            throw JSON.stringify({
                                message: message,
                                expected: this.expected,
                                actual: this.actual
                            });
                        } else {
                            expect.log.push([message, this.expected, this.actual, Error()]);
                        }
                    } else if (this.result === true) {
                        message += ' Result is correct' + (implementationDependant ? ' (but it is implementation dependant)' : '') + '.';
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
        (function() {
            console.log('\n\tTesting _R.isValidVariableName \n');
            var varsIdentifiers = [
                ['a', true],
                ['b', true],
                ['c', true],
                ['d', true],
                ['var', false],
                ['any way to do this is valid', false],
                [{
                        oh: 'hai'
                    },
                    false
                ],
                [{
                        toString: function() {
                            return 'fromToString';
                        }
                    },
                    true
                ],
                [4, false],
                ['4', false],
                [false, false],
                ['undefined', true],
                ['null', false],
                [null, false],
                ['"wow"', false],
                ['function', false],
                ['//wow', false, true],
                ['/* wow */ a', true],
                ['/* wow a', false, true],
            ];
            var id, expectedVal, implementationDependant, test;
            for (var i = 0; i < varsIdentifiers.length; i++) {
                id = varsIdentifiers[i][0];
                expectedVal = varsIdentifiers[i][1];
                implementationDependant = !!(varsIdentifiers[i][2]);
                expect(
                        _R.isValidVariableName(id)
                    )
                    .toEqual(
                        expectedVal
                    )
                    .setTestName('Is "' + id + '" valid variable name?')
                    .run()
                    .end(implementationDependant);
            }
        })();

        (function() {
            console.log('\n\tTesting _R.isBoundOrNativeFunction \n');
            var functions = [
                [
                    function a() {},
                    false
                ],
                [(function b() {})
                    .bind(null), true
                ],
                [console.log, true, true],
                [Date, true],
                [Date.bind(null), true],
                [setTimeout, true, true],
                [Date, true],
                [(function() {
                    /*
                        [native code]
                    */
                }), false],
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
            } catch (e) {
                console.log('\n\tThis implementation does not support arrow functions. Ommiting tests.\n');
            }
            var func, expectedVal, implementationDependant, test;
            for (var i = 0; i < functions.length; i++) {
                func = functions[i][0];
                expectedVal = functions[i][1];
                implementationDependant = !!(functions[i][2]);
                expect(
                        _R.isBoundOrNativeFunction(func)
                    )
                    .toEqual(
                        expectedVal
                    )
                    .setTestName('Is function ("' + (func.name || i) + '") native or bound?')
                    .run()
                    .end(implementationDependant);
            }
        })();

        (function() {
            console.log('\n\tTesting _R.getFunctionSourceCode \n');
            var functions = [
                [
                    function a() {}, 'function a() {}'
                ],
            ];
            var func, expectedVal, implementationDependant, test;
            for (var i = 0; i < functions.length; i++) {
                func = functions[i][0];
                expectedVal = functions[i][1];
                implementationDependant = !!(functions[i][2]);
                expect(
                        _R.getFunctionSourceCode(func)
                    )
                    .toEqual(
                        expectedVal
                    )
                    .setTestName('Can function ("' + (func.name || i) + '") code be retrieved?')
                    .run()
                    .end(implementationDependant);
            }
        })();

        (function() {
            console.log('\n\tTesting _R.getInternalClass \n');
            var values = [
                ['abcd', 'String'],
                [5, 'Number'],
                [null, 'Null', true],
                [undefined, 'Undefined', true],
                [Function(), 'Function'],
                [this, 'global', true],
                [{}, 'Object'],
                [
                    [], 'Array'
                ],
                [Infinity, 'Number'],
                [NaN, 'Number'],
                [true, 'Boolean'],
                [new String('oh hai'), 'String'],
            ];
            if (typeof Symbol !== 'undefined') {
                values.push([Symbol(), 'Symbol', true]);
            }
            var func, expectedVal, implementationDependant, test;
            for (var i = 0; i < values.length; i++) {
                func = values[i][0];
                expectedVal = values[i][1];
                implementationDependant = !!(values[i][2]);
                expect(
                        _R.getInternalClass(func)
                    )
                    .toEqual(
                        expectedVal
                    )
                    .setTestName('Is element ' + i + ' [[Class]] equal to ' + expectedVal + '?')
                    .run()
                    .end(implementationDependant);
            }
        })();

        (function() {
            console.log('\n\tTesting _R.createProxy \n');

            (function() {
                function Circle(r) {
                    this.diameter = undefined; // property have to exist 
                    this.area = undefined; // property have to exist
                    this.radius = r;
                    return _R.createProxy(this, Circle.getter, Circle.setter);
                }
                Circle.getter = function circleGetter(originalObject, proxyObject, propertyName) {
                    if (propertyName === 'radius') {
                        return originalObject.radius;
                    }
                    if (propertyName === 'diameter') {
                        return proxyObject.radius * 2;
                    }
                    if (propertyName === 'area') {
                        return proxyObject.radius * proxyObject.radius * Math.PI;
                    }
                }
                Circle.setter = function circleSetter(originalObject, proxyObject, propertyName, propertyValue) {
                    if (propertyName !== 'radius') {
                        throw Error('You can not modify anything in circle except radius');
                    } else {
                        return originalObject.radius = propertyValue;
                    }
                }

                var k = new Circle(5);
                expect(k.radius * 2)
                    .toEqual(k.diameter)
                    .setTestName('k.radius *2 === k.diameter')
                    .run()
                    .end(); // true
                var test = expect(k.diameter);
                try {
                    k.diameter = 7; // Error: You can not modify anything in circle except radius
                    nonexistingVariableName;
                } catch (e) {
                    if (e.message === 'You can not modify anything in circle except radius')
                        test.toEqual(10)
                        .setTestName('was k.diameter modified? ')
                        .run()
                        .end();
                    else
                        throw new Error('Modification of k.diameter did not throw error. WTF is wrong with this engine?');
                }
                k.oh = 'hai'; // Error in strict mode; Does nothing outside of strict mode
                k.radius = 11; // works
                expect(k.diameter)
                    .toEqual(22)
                    .setTestName('k.diameter === 22')
                    .run()
                    .end();
            })();




        })();

        (function() {
            console.log('\n\tTesting _R.indirectEval \n');
            expect(_R.indirectEval('"wow"'))
                .toEqual("wow")
                .setTestName('Returning values from indirectEval. ')
                .run()
                .end();
            expect(_R.indirectEval('this'))
                .toEqual(global)
                .setTestName('Checking this in indirectEval. Should be global object. ')
                .run()
                .end();
            expect(_R.indirectEval('2+3'))
                .toEqual(5)
                .setTestName('Checking simple expressions in indirectEval. ')
                .run()
                .end()
            _R.indirectEval('var a = 3;')
            expect(global.a)
                .toEqual(undefined)
                .setTestName('Checking if indirectEval modifies global scope. ')
                .run()
                .end();
        })();

        (function() {
            console.log('\n\tTesting _R.wrapFunction \n');
            var t = _R.wrapFunction(function(){return [].reduce.call(arguments,function(a,b) {return a+b});}, function() {return [100,200,300];});
            expect(t(1,1))
                .toEqual(600)
                .setTestName('Checking modyfing result by afterTransformer.')
                .run()
                .end();
            t = _R.wrapFunction(function(){return 1;}, function() {}, function(){return 2;});
            expect(t())
                .toEqual(2)
                .setTestName('Checking modyfing result by afterTransformer.')
                .run()
                .end();
            t = _R.wrapFunction(Date, function() {}, function(){return 2;});
            expect((new t).toString)
                .toEqual((new Date()).toString)
                .setTestName('Checking constructors with wrapped function.')
                .run()
                .end();

        })();

        (function() {
            console.log('\n\tTesting _R.addMagicLengthProperty \n');
            var t = {};
            _R.addMagicLengthProperty(t, false);
            
            expect(t.length)
                .toEqual(0)
                .setTestName('Checking length of empty object.')
                .run()
                .end();
            t[50] = 3;
            expect(t.length)
                .toEqual(51)
                .setTestName('Checking length of empty array-like with holes.')
                .run()
                .end();
            t.length = 30;
            expect(t.hasOwnProperty('50'))
                .toEqual(false)
                .setTestName('Checking triming array-like by modifying .length .')
                .run()
                .end();
            function F(){}
            F.prototype = _R.addMagicLengthProperty({});
            t = new F;
            [].push.call(t, 1,2,3,4,5);
            expect([].reduce.call(t, function(a,b) {return a+b;}))
                .toEqual(15)
                .setTestName('Checking using array\'s methods on object with enhanced prototype.')
                .run()
                .end();

           
        })();




        console.log('\n\n\tTESTS PASSED SUCCESFULLY!\n\n');




    } catch (e) {
        console.log(e);
        throw e;
    }
})(typeof _R !== 'undefined' ? _R : require('./reflect-helpers.js'));