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



        })();




        if (errors.length) {
            console.error(errors)
            throw errors;
        } else {
            console.log('\n\n\tTESTS PASSED SUCCESFULLY!\n\n');
        }
    })(typeof _R !== 'undefined' ? _R : require('../index.js'));

}


