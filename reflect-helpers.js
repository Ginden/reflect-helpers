/** @module reflect-helpers */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root._R = factory();
    }
}(this, function() {
    var _R = {};

    _R.__supportsObjectDefineProperties = (function() {
        if (!Object.defineProperty) {
            return false;
        }
        try {
            var q = {};
            Object.defineProperty(q, 'wow', {
                value: 3
            });
            return q.wow === 3;
        } catch (e) {
            return false;
        }
    })();

    var getNaiveFunctionSourceCode = Function.call.bind(Function.toString);

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
        if (typeof directive === 'number') {
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
        var ret = objectCreate(new TypeError());
        ret.message = '_R does not support native or bound functions as arguments!';
        ret.name = 'NativeFunctionSuppliedError';
        return ret;
    }

    function objectCreate(proto) {
        function F() {}
        if (Object.create) {
            return Object.create(proto);
        } else {
            F.prototype = proto;
            return (new F());
        }
    }

    function removeDuplicatesFromStringArray(what) {
        var dict = objectCreate(null);
        var ret = [];
        var i, key;
        for (i = 0; i < what.length; i++) {
            dict[what[i]] = true;
        }
        for (key in dict) {
            ret.push(key);
        }
        return ret;
    }

    function typeAssert(el, type, error) {
        var currType = typeof el;
        if (type.split('||').indexOf(type) === -1) {
            throw (error || new TypeError('Invalid typeof argument. Expected "' + type + '", encountered ' + currType + ';'));
        }
    }
    
    function boolAssert(data, error) {
        if (!data) {
            throw error || new Error();
        }
    }

    /*
     * SECTION: reference functions
     */

    _R.__boundFunction = (function a() {}).bind(null);

    _R.__emptyFunction = Function();
    _R.__emptySetter = Function('val', '');

    /*
     * SECTION: Semiprivate functions and data
     * These functions aren't documented but they are exposed at user's risk
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

    _R.__createAccesor = function __createGetter(accesor, original, proxy, key) {
        return accesor.bind(null, original, proxy, key);
    };

    _R.__magicLengthGetter = function magicLengthGetter() {
        var last = Math.max.apply(null,
            Object.keys(this)
            .map(Number)
            .filter(function(el) {
                return el > 0 && el === el;
            })
        );
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

    /*
     * SECTION: TESTS AND CHECKS
     */

    /**
     * Tests variable name against current implementation rules.
     * " If you were to summarize all these rules in a single ASCII-only regular expression for JavaScript,
     *   it would be 11,236 characters long".
     * @method
     * @param {string} name - string to be tested
     * @returns {boolean}
     */

    _R.isValidVariableName = function isValidVariableName(name) {
        try {
            Function(name, '');
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
        return Function((preparationCode || '') +
            ';\n return eval(arguments[0])').call(null, code);
    };

    /*
     * Changes method to function accepting `this` as first argument.
     * @method
     * @param {function} func
     * @returns {function}
     */
    _R.makeGeneric = function demethodify(func) {
        return Function.call.bind(func);
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
        if (typeof what !== 'object' || typeof what !== 'function') {
            return null;
        }
        if (Object.getPrototypeOf) {
            return Object.getPrototypeOf(what);
        } else if (({}).__proto__) {
            return what.__proto__;
        } else {
            // This branch doesn't work in certain cases

            // check against null and undefined
            // != test is intentional
            if (what != null) {
                return what.constructor ? (what.constructor.prototype || null) : null;
            }
        }
        return null;
    }

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
        } while (what = _R.getObjectPrototype(what) && prototypesList.indexOf(what) !== -1);
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
        if (Object.getOwnPropertyNames) {
            keys.push.apply(keys, Object.getOwnPropertyNames(what));
        } else {
            for (var key in what) {
                if (Object.hasOwnProperty.call(what, key)) {
                    keys.push(key);
                }
            }
        }
        if (searchInPrototypes) {
            keys.push.apply(keys, _R.getObjectPropertiesNames(_R.getObjectPrototype(what), true));
        }
        return keys;
    }

    /*
     * SECTION: Modify and create functions
     */

    /**
     * Returns function redefined in global context
     * @method
     * @param {function} func - function to be redefined
     * @param {function} [transformer] - transformation function applied to function source code. function callback(sourceCode, func)
     * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
     */

    _R.declosureFunction = function(func, transformer) {
        boolAssert(_R.isBoundOrNativeFunction(func), new NativeFunctionSuppliedError());
        transformer = transformer || function(a) {
            return a;
        };
        // _R.indirectEval cannot be used to lamba-lift closure to global scope due to IonMonkey limitations
        return (1,eval)('(' + transformer(_R.getFunctionSourceCode(func), func) + ')'); 
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
            tempFuncSource = tempFuncSource.replace('anonymous', name + ' ');
        } else {
            newFuncSource = 'function ' + name + ' ' + tempFuncSource.slice(tempFuncSource.indexOf('('));
        }
        return _R.indirectEval(newFuncSource);
    };

    /**
     * Redefines function in context of given object;
     * Default function name is
     * @method
     * @param {function} func - function name (exists in function scope, shouldn't be confused with function.name property)
     * @param {Object} [context] - context of new function
     * @param {string} [name] - name of new function (defaults to 'anonymous' (will shadow arguments from context))
     * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
     */

    _R.createClosure = function createClosure(func, context, name) {
        context = context || {};
        name = _R.isValidVariableName(name) ? name : 'anonymous';
        var argumentsNames = [];
        var argumentsValues = [];
        var key, sourceCode;
        for (key in context) {
            if (Object.hasOwnProperty.call(context, key) && _R.isValidVariableName(key)) {
                argumentsNames.push(key);
                argumentsValues.push(context[key])
            }
        }
        sourceCode = _R.__directive + ';\n var ' + name + '= (' + _R.getFunctionSourceCode(func) + '); return ' + name + ';';
        return Function.apply(null, argumentsNames.concat(sourceCode)).apply(null, argumentsValues);
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
        boolAssert(_R.__supportsObjectDefineProperties, new Error('_R.createProxy requires spec-compatible Object.defineProperty to work!'));
        typeAssert(getHandler, 'function', new TypeError('getHandler is not a function!'));
        if (arguments.length > 2) {
            typeAssert(setHandler, 'function', new TypeError('setHandler is not a function!'));
        }
        
        var proxy = this instanceof Proxy ? this : objectCreate(Proxy.prototype);
        
        setHandler = setHandler || _R.Proxy.defaultSetter;
        
        

        
        var keys, key, originalDescriptor, descriptor, accesorGet, accesorSet;
        removeDuplicatesFromStringArray(_R.getObjectPropertiesNames(what, true)).forEach(function (key, i) {
            descriptor = _R.__getDescriptor(what, key);
            accesorGet = _R.__createAccesor(getHandler, what, proxy, key);
            accesorSet = setHandler ? _R.__createAccesor(setHandler, what, proxy, key) : _R.__emptyFunction;
            _R.__injectAccesorsToDescriptor(descriptor, accesorGet, accesorSet);
            Object.defineProperty(proxy, key, descriptor);
        });
        Object.seal(proxy);
        return this;
    };

    _R.Proxy.defaultSetter = function(orig, proxy, name, val) {
        return orig[name] = val;
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
        for (var i = 0; i < unpacked.length; i++) {
            key = unpacked[i];
            Object.defineProperty(
                what, key, {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    get: function() {
                        return undefined;
                    },
                    set: _R.__setterAccessDenied.bind(what, key)
                }
            );
        }
    };

    _R.addMagicLengthProperty = function addMagicLengthProperty(what, readOnly) {
        if (arguments.length < 2) {
            readOnly = true;
        }
        Object.defineProperty(what, 'length', {
            configurable: false,
            enumerable: false,
            get: _R.__magicLengthGetter,
            set: readOnly ? _R.__emptyFunction : _R__magicLengthSetter
        });
        return what;
    };

	

	
	_R.wrapFunction = function wrapFunction(func, before, after, commonData) {
		typeAssert(func, 'function');
		typeAssert(before, 'function');
		var ret = function myFunc () {
		    var data;
			var newArgs = (ret.__before && ret.__before(func, this, null, arguments, commonData)) || arguments;
			if (this instanceof myFunc) {
			    data = _R.construct(func, newArgs)
			}
			else {
			    data = Function.apply.call(func, this, newArgs);
			}
			var afterResult = ret.__after && ret.__after(func, this, data, newArgs, commonData);
			data = (afterResult === undefined) ? data : afterResult;
			return data;
		};
		ret.__before = before;
		ret.__after = after;
		var properties = _R.getObjectPropertiesNames(func);
		properties.reduce(function(newFunc,el){
			newFunc[el] = func[el];
			return newFunc;
		}, ret);
		return ret;
	}



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

    _R.construct = function construct(target, args) {
        typeAssert(target, 'function', new TypeError('_R.construct can be called only on function'));
        args = [].slice.call(args);
        var argsList = args.reduce(function(list,el,i) {
        	list.push('arguments[' + (i + 1) + ']');
        	return list;
        }, []);
        var source = 'return (new Constructor(' + argsList.join(', ') + '));';
        return Function('Constructor', source).apply(null, [target].concat(args));
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
     * @param {function} target
     * @param {string|symbol} key
     * @returns {*}
     */

    _R.has = function ReflectHas(target, key) {
        return Object.prototype.hasOwnProperty.call(target, key);
    };





    _R.toString = function() {
        return '[Object _R]';
    };


    return _R;
}));