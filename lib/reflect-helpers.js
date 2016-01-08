/** @module reflect-helpers */

( function(root, factory) {
		/* istanbul ignore if */
        if ( typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define([], factory);
        } /* istanbul ignore else */ else if ( typeof exports === 'object') {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like environments that support module.exports,
            // like Node.
            module.exports = factory();
        } /* istanbul ignore else */ else {
            // Browser globals (root is window)
            root._R = factory();
        }
    }(this, function() {
        var _R = {};
        try {
            _R.global = Function('return this;')();
        } catch (e) {
            /* istanbul ignore next */
            throw new Error('Most of _R functions will not work under CSP - execution prevented.');
        }


        /*
         * SECTION: Settings
         */

        _R.__directives = ['', 'use strict', 'use asm'];

        _R.DIRECTIVE_NORMAL = 0;
        _R.DIRECTIVE_STRICT = 1;
        _R.DIRECTIVE_ASM = 2;

        /*
         * Changes directives used by created functions
         * @method
         * @param {integer|string} directive - directive to be used
         * @returns {boolean}
         */


        _R.$setDirective = function(directive) {
        	/* instabul ignore else */
            if ( typeof directive === 'number') {
                _R.__directive = JSON.stringify(_R.__directives[directive] || '');
            } else {
                _R.__directive = JSON.stringify(directive);
            }
        };

        _R.__directive = '';
        _R.$setDirective(_R.DIRECTIVE_STRICT);

        /*
         * SECTION: HELPERS
         */

        function NativeFunctionSuppliedError() {
            var ret = Object.create(new TypeError());
            ret.message = '_R does not support native or bound functions as arguments!';
            ret.name = 'NativeFunctionSuppliedError';
            return ret;
        }



		/* istanbul ignore next */
        function typeAssert(el, type, error) {
            var currType = typeof el;
            if (type.split('||').indexOf(type) === -1) {
                throw (error || new TypeError('Invalid typeof argument. Expected "' + type + '", encountered ' + currType + ';'));
            }
        }

		/* istanbul ignore next */
        function boolAssert(data, error) {
            if (!!data === false) {
                throw error || new Error();
            }
        }

        var getNaiveFunctionSourceCode = Function.call.bind(Function.toString);

        /*
         * SECTION: reference functions
         */
		/* istanbul ignore next */
        _R.__boundFunction = (function bound() {}).bind(null);
		/* istanbul ignore next */
        _R.__emptyFunction = function(){};
        /* istanbul ignore next */
        _R.__emptySetter = function emptySetter(val) {};

        /*
         * SECTION: Semiprivate functions and data
         * These functions aren't documented but they can be used at user's risk
         */

        _R.__getDescriptor = function __getDescriptor(what, key) {
            var descriptor;
            do {
                descriptor = Object.getOwnPropertyDescriptor(what, key);
                what = _R.getObjectPrototype(what)
            } while (!descriptor && what);
            return descriptor;
        };

        _R.__injectAccesorsToDescriptor = function __injectAccesorsToDescriptor(descriptor, getter, setter) {
            descriptor.get = getter;
            descriptor.set = setter;
            delete descriptor.value;
            delete descriptor.writable;
            return descriptor;
        };

        _R.__createAccesor = function __createGetter(accesor, target, proxy, key) {
            return function (){
                if (arguments.length === 0) {
                    return accesor.call(null, target, key, this);
                } else {
                    return accesor.call(null, target, key, arguments[0], this);
                }
            };
        };

        _R.__magicLengthGetter = function magicLengthGetter() {
            var last = Math.max.apply(null, Object.keys(this).map(Number).filter(function(el) {
                return el >= 0 && el === el;
            }));
            if (last === -Infinity) {
                return 0;
            }
            return last + 1;
        };

        _R.__setterAccessDenied = function(propertyName, value, message, error) {
            message = message || 'Can\'t write to (' + this + ')[' + JSON.stringify(propertyName) + ']!';
            error = error || TypeError;
            if (error) {
                throw new error(message);
            } else {
                return undefined;
            }
        };

        _R.__magicLengthSetter = function magicLengthSetter(val) {
            Object.keys(this).forEach(function(el, i, arr) {
                var modified = Number(el);
                if (modified === modified && modified >= val) {
                    delete this[el];
                }
            }, this);
            return val;
        };

        _R.__isAllowedFunctionProperty = function(propName) {
            return propName !== 'arguments' && propName !== 'callee' && propName !== 'caller';
        };

        _R.__identity = (a)=>a;

        _R.__noConflictPrefix = '__'+Math.random().toString(36).slice(2)+'__';

        /*
        * SECTION: TESTS AND CHECKS
        */

        /**
         * Tests variable name against current implementation rules.
         * " If you were to summarize all these rules in a single ASCII-only regular expression for JavaScript,
         *   it would be 11,236 characters long".
         * @method
         * @param {string} name - string to be tested
         * @param {Boolean} safe - should "contencation safety" enforced (can you safely construct source code using this string)?
         * @returns {boolean}
         */

        _R.isValidVariableName = function isValidVariableName(name, safe) {
            if (typeof name !== 'string') return false;
            // because some characters aren't correctly
            var illegalCharacters = '/*\\\n@.'.split('');
            for(var i = 0; i < illegalCharacters.length; i++) {
                if (name.indexOf(illegalCharacters[i]) !== -1)
                    return false;
            }
            try {
                Function(name, 'return (' + name + ')');
            } catch (e) {
                return false;
            }
            return true;
        };

        /**
         * Tests if function is native or bound
         * @method
         * @param {function} func - function to be stringified
         * @throws {TypeError} when func isn't a function
         * @returns {boolean}
         */

        _R.isBoundOrNativeFunction = function isBoundOrNativeFunction(func) {
            var sourceCode = getNaiveFunctionSourceCode(func);
            if (sourceCode === getNaiveFunctionSourceCode(func.bind(null))) {
                return true;
            }
            // Old Safari
            /* istanbul ignore if */
            if (sourceCode === '[function]') {
                return true;
            }

            try {
                Function('return (' + sourceCode + ')');
                return false;
            } catch (e) {
                return true;
            }

        };

        /*
        * SECTION: Utility
        */

        /**
         * Performs indirect eval in isolated subglobal scope.
         * @method
         * @param {string} code
         * @returns {String}
         */

        _R.indirectEval = function indirectEval(code, preparationCode) {
            return Function((preparationCode || '') + ';\n delete arguments.length; return eval(arguments[0])').call(null, code);
        };

        /*
         * Changes method to function accepting `this` as first argument.
         * @method
         * @param {function} func
         * @returns {function}
         */
        _R.makeGeneric = _R.demethodify = function demethodify(func) {
            return Function.call.bind(func);
        };

        _R.makeMethod = _R.methodify = function methodify(func) {
            function method(){
                return Function.prototype.apply.call(func, null, [this].concat([].slice.call(arguments)));
            }
            method.displayName = func.displayName || func.name;
            return method;
        };

        /*
        * SECTION: RETRIEVE DATA
        */

        /**
         * Returns source code of function or throws error when it's impossible to retrieve
         * @method
         * @param {function} func - function to be stringified
         * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
         * @returns {String}
         */

        _R.getFunctionSourceCode = function getFunctionSourceCode(func) {
            boolAssert(!_R.isBoundOrNativeFunction(func), new NativeFunctionSuppliedError());
            var source = Function.toString.call(func);
            return source;
        };

        /**
         * Returns [[Class]] of what
         * @method
         * @param what - Object or primitive to be inspected
         */
        _R.getInternalClass = function(what) {
            return Object.prototype.toString.call(what).match(/^\[object\s(.*)\]$/)[1];
        };

        /**
         * Returns prototype of first argument
         * If argument isn't an object, returns null
         * Can return invalid object in IE8 and lower.
         * @method
         * @param {*} what
         * @returns {Object?} returns object or null
         */

        _R.getObjectPrototype = function getObjectPrototype(what) {
            if (typeof what !== 'object' && typeof what !== 'function' || what === null || what === undefined) {
                return null;
            }
            else if (Object.getPrototypeOf) {
                return Object.getPrototypeOf(what);
            } else if (( {}).__proto__) {
                return what.__proto__;
            }
            return null;
        };
        /**
         * Returns array of objects existing in prototype chains
         * @method
         * @param {*} what
         * @returns {Object*}
         */

        _R.getPrototypesChain = function getPrototypesChain(what) {
            var prototypesList = [];
            do {
                prototypesList.push(what);
                what = _R.getObjectPrototype(what);
            } while ((typeof what === 'object' || typeof what === 'function') && prototypesList.indexOf(what) === -1);
            return prototypesList;
        };

        /**
         * Returns objects properties names without duplicates
         * @param {*} what
         * @param {boolean} searchInPrototypes
         * @returns {String*}
         */

        _R.getObjectPropertiesNames = function getObjectPropertiesNames(what, searchInPrototypes) {
            var keys = [];
            if (what === null) {
                return [];
            }
            if (searchInPrototypes) {
                let _keys = [];
                [].concat.apply([], _R.getPrototypesChain(what).map(obj=>getObjectPropertiesNames(obj, false))).forEach(function(key){
                    if (!this[key]) {
                        this[key] = true;
                        _keys.push(key);
                    }
                }, Object.create(null));
                return _keys;
            }
            return Object.getOwnPropertyNames(what);
        };
        /*
        * SECTION: Modify and create functions
        */

        /**
         * Returns function redefined in global context
         * @method
         * @param {function} func - function to be redefined
         * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
         */

        _R.declosureFunction = function(func) {
            console.log(func.toString(), _R.isBoundOrNativeFunction(func))
            boolAssert(!_R.isBoundOrNativeFunction(func), new NativeFunctionSuppliedError());
            // _R.indirectEval cannot be used to lamba-lift closure to global scope due to IonMonkey limitations
            return (1, eval)('(' + _R.getFunctionSourceCode(func) + ')');
        };

        /**
         * Creates named function using Function constructor
         * @method
         * @param {string} name - function name (used for recursive calls, shouldn't be confused with function.name property)
         * @param {...string} restArgs - arguments to Function constructor
         * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
         */

        _R.createNamedFunction = function createNamedFunction(name, restArgs) {
            name = name || 'anonymous';
            boolAssert(_R.isValidVariableName(name), new NativeFunctionSuppliedError());
            restArgs = Array.prototype.slice.call(arguments, 1);
            var tempFuncSource = _R.getFunctionSourceCode(Function.apply(null, restArgs));
            var newFuncSource;
            if (tempFuncSource.indexOf('function anonymous') === 0) {
                newFuncSource = tempFuncSource.replace('anonymous', name + ' ');
            } else {
                newFuncSource = 'function ' + name + ' ' + tempFuncSource.slice(tempFuncSource.indexOf('('));
            }
            return _R.indirectEval('('+newFuncSource+')');
        };

        /**
         * Redefines function in context of given object;
         * Default function name is 'anonymous'
         * @method
         * @param {function} func - function name (exists in function scope, shouldn't be confused with function.name property)
         * @param {Object} [context] - context of new function
         * @param {string} [name] - name of new function (defaults to 'anonymous' (will shadow arguments from context))
         * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
         * @returns {Function} Newly created function.
         */

        _R.createClosure = function createClosure(func, context, name) {
            context = context || {};
            name = _R.isValidVariableName(name) ? name : 'anonymous';
            var argumentsNames = [];
            var argumentsValues = [];
            var key, sourceCode;
            Object.keys(context).forEach(function(key){
                argumentsNames.push(key);
                argumentsValues.push(context[key])
            });
            sourceCode = _R.__directive + ';\n var ' + name + '= (' + _R.getFunctionSourceCode(func) + '); return ' + name + ';';
            return Function.apply(null, argumentsNames.concat(sourceCode)).apply(null, argumentsValues);
        };

        /**
         * Redefines function in context of given object and allows scope manipulations;
         * Default function name is 'anonymous';
         * Recursion IS NOT guaranteed to work unless function is reffered by `name` property.
         * @method
         * @param {function} func - function name (exists in function scope, shouldn't be confused with function.name property)
         * @param {Object} [context] - context of new function
         * @param {string} [funcName] - name of new function (defaults to 'anonymous' (will shadow arguments from context))
         * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
         * @returns {Object} Object with two properties - `func` and `scope` object.
         */


        _R.createMagicClosure = _R.createDynamicClosure = function createDynamicClosure(func, context, funcName) {
            context = context || {};
            funcName = _R.isValidVariableName(funcName, true) ? funcName : 'anonymous';
            var argumentsNames = [];
            var scopeVariableName = _R.__noConflictPrefix+'scope';
            var scopeDerName = _R.__noConflictPrefix+'retScope';
            var scopeObject = Object.create(null);
            Object.keys(context).forEach(function(key){
                    argumentsNames.push(key);
                    scopeObject[key] = context[key];
            });
            var sourceCode = 'var '+scopeDerName+' = {};';

            argumentsNames.forEach(function(name){
                sourceCode += 'var '+name+' = '+scopeVariableName+'['+JSON.stringify(name)+'];\n';
            });
            argumentsNames.forEach(function(name){
                sourceCode += 'Object.defineProperty('+scopeVariableName+', '+JSON.stringify(name)+', {\
                    get: function() { return '+name+'; },\
                    set: function(val) {return ('+name+' = val);}\
                });\n'
            });
            sourceCode += 'var '+funcName+' = ('+ _R.getFunctionSourceCode(func)+');';


            sourceCode += '\n return {scope: Object.freeze('+scopeVariableName+'), func: '+funcName+'};';
            return Function(scopeVariableName, sourceCode)(scopeObject);
        };



        /*
        * SECTION: Modify and create objects
        */

        /**
         * new _R.Proxy is an alias for _R.createProxy
         * Calls Object.seal on returned value.
         * Works only if current implementation supports Object.defineProperty()
         * @method
         * @param {Object} what
         * @param {function} getHandler - function filter(originalObject, proxyObject, propertyName)
         * @param {function} [setHandler] - function filter(originalObject, proxyObject, propertyName, propertyValue). Default: do nothing.
         * @returns {Object}
         */

        _R.Proxy = function Proxy(what, getHandler, setHandler) {
            typeAssert(getHandler, 'function', new TypeError('getHandler is not a function!'));
            if (arguments.length > 2) {
                typeAssert(setHandler, 'function', new TypeError('setHandler is not a function!'));
            }

            var proxy = this instanceof Proxy ? this : Object.create(Proxy.prototype);

            setHandler = setHandler || _R.Proxy.defaultSetter;

            var descriptor, accesorGet, accesorSet;
            _R.getObjectPropertiesNames(what, true).forEach(function(key, i) {
                descriptor = _R.__getDescriptor(what, key);
                accesorGet = _R.__createAccesor(getHandler, what, proxy, key);
                accesorSet = setHandler ? _R.__createAccesor(setHandler, what, proxy, key) : _R.__emptyFunction;
                _R.__injectAccesorsToDescriptor(descriptor, accesorGet, accesorSet);
                Object.defineProperty(proxy, key, descriptor);
            });
            Object.seal(proxy);
            return proxy;
        };

        _R.Proxy.defaultSetter = function(orig, propertyName, propertyValue, proxy) {
            return orig[propertyName] = propertyValue;
        };

        /**
         * Returns proxy object.
         * __R.createProxy is an alias for new _R.Proxy

         * @method
         * @param {Object} what
         * @param {function} getHandler - function filter(originalObject, proxyObject, propertyName)
         * @param {function} [setHandler] - function filter(originalObject, proxyObject, propertyName, propertyValue). Default: do nothing.
         * @returns {Object}
         */

        _R.createProxy = function createProxy() {
            return _R.construct(_R.Proxy, arguments);
        };

        /**
         * Forbids writing to properties from `args` of `what` object
         * @method
         * @param {what} target
         * @param {string|string*} ...args
         * @returns {*}
         */

        _R.forbidPropertyNames = function forbidPropertyNames(what) {
            var unpacked = [].concat.apply([], [].slice.call(arguments, 1));
            var key;
            var returnUndefined = Function('return undefined;');
            for (var i = 0; i < unpacked.length; i++) {
                key = unpacked[i];
                Object.defineProperty(what, key, {
                    enumerable : false,
                    configurable : false,
                    writable : false,
                    get : returnUndefined,
                    set : _R.__setterAccessDenied.bind(what, key)
                });
            }
        };


        /**
         * Add magical length property to an object and returns it.
         * @method
         * @param {Object} what
         * @param {Boolean} readOnly
         * @returns {*}
         */
        _R.addMagicLengthProperty = function addMagicLengthProperty(what, readOnly) {
            if (arguments.length < 2) {
                readOnly = true;
            }
            Object.defineProperty(what, 'length', {
                configurable : false,
                enumerable : false,
                get : _R.__magicLengthGetter,
                set : readOnly ? _R.__emptyFunction : _R.__magicLengthSetter
            });
            return what;
        };

        /*
        * Reflect polyfill
        */

        /**
         * Applies constructor with specified arguments (array or array-like)
         * Follows spec of ES6 Reflect.construct
         * @method
         * @param {function} target
         * @param {Array} args
         * @returns {Object}
         */

        var dynamicConstructorsCache = Object.create(null);

        _R.construct = function construct(target, args) {
            typeAssert(target, 'function', new TypeError('_R.construct can be called only on function!'));

            args = [].slice.call(args);
            var len = args.length, func;
            if (_R.has(dynamicConstructorsCache, len)) {
                func = dynamicConstructorsCache[len];
            }
            else {
                var argsList = args.reduce(function (list, el, i) {
                    list.push('arguments[' + (i + 1) + ']');
                    return list;
                }, []);
                var source = 'return (new Constructor(' + argsList.join(', ') + '));';
                func = Function('Constructor', source);
            }
            return func.apply(null, [target].concat(args));
        };
        /**
         * Applies function with specified arguments and this value
         * Follows spec of ES6 Reflect.apply
         * @method
         * @param {function} target
         * @param {Object} thisArg
         * @param {Array} args
         * @returns {*}
         */

        _R.apply = function ReflectApply(target, thisArg, args) {
            return Function.apply.call(target, thisArg, args);
        };

        /**
         * Checks if target has a property key
         * Follows spec of ES6 Reflect.has
         * @method
         * @param {*} target
         * @param {string|symbol} key
         * @returns {*}
         */

        _R.has = function ReflectHas(target, key) {
            return {}.hasOwnProperty.call(target, key);
        };

        _R.toString = function() {
            return '[Object _R]';
        };

        return _R;
    }));
