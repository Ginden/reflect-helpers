function ignore() {
    (function (_R) {
        var global = this || (1, eval)(this);
        var errors = [];

        function expect(expected) {
            expect.count = 0 || expect.count++;
            return {
                toEqual:     function (actual) {
                    this.actual = actual;
                    return this;
                },
                setTestName: function (name) {
                    this.name = name;
                    return this;
                },
                run:         function () {
                    // NaN case
                    if (_R.getInternalClass(this.actual) !== _R.getInternalClass(this.expected)) {
                        this.result = false;
                    }
                    else if (typeof this.expected === 'number' && String(this.expected) === 'NaN') {
                        this.result = !!(typeof this.actual === 'number' && String(this.actual) === 'NaN');
                    }
                    else if (this.expected === this.actual) {
                        this.result = true;
                    }
                    else if (_R.getInternalClass(this.actual) === 'Array') {
                        if (this.expected.length !== this.actual.length) {
                            this.result = false;
                        }
                        else {
                            this.result = true;
                            for (var i = 0; i < this.actual.length; i++) {
                                if (this.actual[i] !== this.expected[i]) {
                                    this.result = false;
                                    break;
                                }
                            }
                        }
                    } else {
                        this.result = false;
                    }

                    return this;
                },
                end:         function (implementationDependant) {
                    var message = 'Test. ' + (this.name || expect.count);
                    if (this.result === false) {
                        message += (implementationDependant ?
                            ' Depends on implementation, but it isn\'t behavior expected by _R.' :
                            'Ouh, it shouldn\'t work this way!');
                        console.warn(message);
                        if (!implementationDependant) {
                            errors.push(JSON.stringify({
                                message:  message,
                                expected: this.expected,
                                actual:   this.actual
                            }));
                        } else {
                            expect.log.push([message, this.expected, this.actual, Error()]);
                        }
                    } else if (this.result === true) {
                        message += ' Result is correct' + (implementationDependant ? ' (but it is implementation dependant)' : '') + '.';
                        console.log(message);
                    } else {
                        throw new Error(JSON.stringify(this));
                    }
                },
                expected:    expected,
                actual:      undefined,
                result:      undefined
            };
        }

        expect.log = [];

        (function () {
            console.log('\n\tTesting _R.createProxy \n');

            (function () {
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
                };
                Circle.setter = function circleSetter(originalObject, proxyObject, propertyName, propertyValue) {
                    if (propertyName !== 'radius') {
                        throw Error('You can not modify anything in circle except radius');
                    } else {
                        return originalObject.radius = propertyValue;
                    }
                };

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
                    if (e.message === 'You can not modify anything in circle except radius') {
                        test.toEqual(10)
                            .setTestName('was k.diameter modified? ')
                            .run()
                            .end();
                    } else {
                        throw new Error('Modification of k.diameter did not throw error. WTF is wrong with this engine?');
                    }
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

        (function () {
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

        (function () {
            console.log('\n\tTesting _R.wrapFunction \n');
            var t = _R.wrapFunction(function () {
                return [].reduce.call(arguments, function (a, b) {
                    return a + b
                });
            }, function () {
                return [100, 200, 300];
            });
            expect(t(1, 1))
                .toEqual(600)
                .setTestName('Checking modyfing result by afterTransformer.')
                .run()
                .end();
            t = _R.wrapFunction(function () {
                return 1;
            }, function () {
            }, function () {
                return 2;
            });
            expect(t())
                .toEqual(2)
                .setTestName('Checking modyfing result by afterTransformer.')
                .run()
                .end();
            t = _R.wrapFunction(Date, function () {
            }, function () {
                return 2;
            });
            expect((new t).toString)
                .toEqual((new Date()).toString)
                .setTestName('Checking constructors with wrapped function.')
                .run()
                .end();

        })();

        (function () {
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

            function F() {
            }

            F.prototype = _R.addMagicLengthProperty({});
            t = new F;
            [].push.call(t, 1, 2, 3, 4, 5);
            expect([].reduce.call(t, function (a, b) {
                return a + b;
            }))
                .toEqual(15)
                .setTestName('Checking using array\'s methods on object with enhanced prototype.')
                .run()
                .end();

        })();

        (function () {
            console.log('\n\tTesting _R.toString \n');

            expect(_R + '')
                .toEqual('[Object _R]')
                .setTestName('Checking _R.toString.')
                .run()
                .end();

        })();

        (function () {
            console.log('\n\tTesting _R.makeGeneric \n');
            var func = _R.makeGeneric([].slice);
            expect(JSON.stringify(func('abcd')))
                .toEqual(JSON.stringify('abcd'.split('')))
                .setTestName('Checking _R.makeGeneric - Array.prototype.slice applied to string. ')
                .run()
                .end();

            var func = _R.makeGeneric(Object.prototype.toString);
            expect(func('xd'))
                .toEqual(({}).toString.call('xd'))
                .setTestName('Checking _R.makeGeneric - Object.prototype.toString. ')
                .run()
                .end();


            var func = _R.makeGeneric([].every);
            expect(func('foobar', function (el) {
                return !!el.charCodeAt(0)
            }))
                .toEqual(true)
                .setTestName('Checking _R.makeGeneric - Array.prototype.every. ')
                .run()
                .end();


        })();

        (function () {
            console.log('\n\tTesting _R.getObjectPrototype \n');

            expect(_R.getObjectPrototype({}))
                .toEqual(Object.prototype)
                .setTestName('Checking _R.getObjectPrototype - object. ')
                .run()
                .end();
            expect(_R.getObjectPrototype([]))
                .toEqual(Array.prototype)
                .setTestName('Checking _R.getObjectPrototype - array')
                .run()
                .end();
            expect(_R.getObjectPrototype(''))
                .toEqual(null)
                .setTestName('Checking _R.getObjectPrototype - string.')
                .run()
                .end();
            expect(_R.getObjectPrototype(5))
                .toEqual(null)
                .setTestName('Checking _R.getObjectPrototype - number.')
                .run()
                .end();
            expect(_R.getObjectPrototype(null))
                .toEqual(null)
                .setTestName('Checking _R.getObjectPrototype - null.')
                .run()
                .end();

        })();


        if (errors.length) {
            console.error(errors)
            throw errors;
        } else {
            console.log('\n\n\tTESTS PASSED SUCCESFULLY!\n\n');
        }
    })(typeof _R !== 'undefined' ? _R : require('../index.js'));

    p.map(function (e) {
        return 'it(\'' + (e[1] ? 'accepts' : 'rejects') + ' ' + (typeof e[0] === 'object' && e[0] ? e[0].toSource() : JSON.stringify(e[0])) + ' as argument name\', function(){ expect(_R.isValidVariableName(' + (typeof e[0] === 'object' && e[0] ? e[0].toSource() : JSON.stringify(e[0])) + ')).toBe(' + e[1] + ');});';
    }).join('\n')

}


