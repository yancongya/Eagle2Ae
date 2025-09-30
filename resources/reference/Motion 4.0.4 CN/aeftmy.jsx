if (!Array.prototype.every) {
    Array.prototype.every = function(callback, thisArg) {
        if (this === void(0) || this === null) {
            throw new TypeError("Array.prototype.every called on null or undefined")
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (callback.__class__ !== "Function") {
            throw new TypeError(callback + " is not a function")
        }
        T = (arguments.length > 1 ? thisArg : void(0));
        k = 0;
        while (k < len) {
            if (k in O) {
                kValue = O[k];
                var testResult = callback.call(T, kValue, k, O);
                if (!testResult) {
                    return false;
                }
            }
            k++;
        }
        return true;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function(callback, thisArg) {
        if (this === void(0) || this === null) {
            throw new TypeError("Array.prototype.filter called on null or undefined")
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (callback.__class__ !== "Function") {
            throw new TypeError(callback + " is not a function")
        }
        var res = [];
        var T = (arguments.length > 1 ? thisArg : void(0));
        for (var i = 0; i < len; i += 1) {
            if (i in t) {
                var val = t[i];
                if (callback.call(T, val, i, t)) {
                    res.push(val);
                }
            }
        }
        return res;
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        if (this === void(0) || this === null) {
            throw new TypeError("Array.prototype.indexOf called on null or undefined")
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = +fromIndex || 0;
        if (Math.abs(n) === Infinity) {
            n = 0;
        }
        if (n >= len) {
            return -1;
        }
        k = Math.max((n >= 0 ? n : len - Math.abs(n)), 0);
        while (k < len) {
            if (k in o && o[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        if (this === void(0) || this === null) {
            throw new TypeError("Array.prototype.forEach called on null or undefined")
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (callback.__class__ !== "Function") {
            throw new TypeError(callback + " is not a function")
        }
        var T = (arguments.length > 1 ? thisArg : void(0));
        for (var k = 0; k < len; k += 1) {
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
        }
    };
}
if (!Array.isArray) {
    Array.isArray = function(arg) {
        if (arg === void(0) || arg === null) {
            return false;
        }
        return arg.__class__ === "Array";
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {
        if (this === void(0) || this === null) {
            throw new TypeError("Array.prototype.map called on null or undefined")
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (callback.__class__ !== "Function") {
            throw new TypeError(callback + " is not a function")
        }
        T = (arguments.length > 1 ? thisArg : void(0));
        A = new Array(len);
        for (var k = 0; k < len; k += 1) {
            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }
        }
        return A;
    };
}
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement, fromIndex) {
        if (this === void(0) || this === null) {
            throw new TypeError("Array.prototype.lastIndexOf called on null or undefined")
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        n = len - 1;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) {
                n = 0;
            } else {
                if (n != 0 && n != Infinity && n != -Infinity) {
                    n = n > 0 || -1 * Math.floor(Math.abs(n));
                }
            }
        }
        for (k = (n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n)); k >= 0; k--) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(callback, initialValue) {
        if (this === void(0) || this === null) {
            throw new TypeError("Array.prototype.reduce called on null or undefined")
        }
        if (callback.__class__ !== "Function") {
            throw new TypeError(callback + " is not a function")
        }
        var t = Object(this);
        var len = t.length >>> 0;
        var k = 0;
        if (arguments.length > 1) {
            value = initialValue;
        } else {
            while (k < len && !(k in t)) {
                k++;
            }
            if (k >= len) {
                throw new TypeError("Reduce of empty array with no initial value")
            }
            value = t[k++];
        }
        for (; k < len; k++) {
            if (k in t) {
                value = callback(value, t[k], k, t);
            }
        }
        return value;
    };
}
if (typeof JSON !== "object") {
    JSON = {};
}
(function() {
    "use strict";

    function f(n) {
        return (n < 10 ? "0" + n : n);
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function() {
            return (isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null);
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function() {
            return this.valueOf();
        };
    }

    function quote(string) {
        escapable.lastIndex = 0;
        return (escapable.test(string) ? "\"" + string.replace(escapable, function(a) {
            var c = meta[a];
            return (typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4));
        }) + "\"" : "\"" + string + "\"");
    }

    function str(key, holder) {
        var mind = gap;
        var value = holder[key];
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case "string":
                return quote(value);
            case "number":
                return (isFinite(value) ? String(value) : "null");
            case "boolean":
            case "null":
                return String(value);
            case "object":
                if (!value) {
                    return "null";
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    length = value.length;
                    for (var i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }
                    v = ((partial.length === 0 ? "[]" : gap) ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]");
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (var i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v);
                            }
                        }
                    }
                } else {
                    for (var k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v);
                            }
                        }
                    }
                }
                v = ((partial.length === 0 ? "{}" : gap) ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}");
                gap = mind;
                return v;
        }
    }
    if (typeof JSON.stringify !== "function") {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function(value, replacer, space) {
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (var i = 0; i < space; i += 1) {
                    indent += " ";
                }
            } else {
                if (typeof space === "string") {
                    indent = space;
                }
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && typeof replacer !== "object" || typeof replacer.length !== "number") {
                throw new Error("JSON.stringify")
            }
            return str("", {
                "": value
            });
        };
    }
    if (typeof JSON.parse !== "function") {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function(text, reviver) {
            function walk(holder, key) {
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (var k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if ((/^[\],:{}\s]*$/.test)(((text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace)(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace)(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return (typeof reviver === "function" ? walk({
                    "": j
                }, "") : j);
            }
            throw new SyntaxError("JSON.parse")
        };
    }
})();
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function(callback, initialValue) {
        if (this === void(0) || this === null) {
            throw new TypeError("Array.prototype.reduceRight called on null or undefined")
        }
        if (callback.__class__ !== "Function") {
            throw new TypeError(callback + " is not a function")
        }
        var t = Object(this);
        var len = t.length >>> 0;
        var k = len - 1;
        if (arguments.length > 1) {
            value = initialValue;
        } else {
            while (k >= 0 && !(k in t)) {
                k--;
            }
            if (k < 0) {
                throw new TypeError("Reduce of empty array with no initial value")
            }
            value = t[k--];
        }
        for (; k >= 0; k--) {
            if (k in t) {
                value = callback(value, t[k], k, t);
            }
        }
        return value;
    };
}
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (this.__class__ !== "Function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable")
        }
        var aArgs = Array.prototype.slice.call(arguments, 1);
        var fToBind = this;
        var fNOP = function() {

        };
        var fBound = function() {
            return fToBind.apply((this instanceof fNOP ? this : oThis), aArgs.concat(Array.prototype.slice.call(arguments)));
        };
        if (this.prototype) {
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();
        return fBound;
    };
}
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    };
}
if (!Object.create) {
    Object.create = (function() {
        function Temp() {

        }
        var hasOwn = Object.prototype.hasOwnProperty;
        return function(O) {
            if (Object(O) !== O && O !== null) {
                throw TypeError("Object prototype may only be an Object or null")
            }
            Temp.prototype = O;
            var obj = new Temp();
            Temp.prototype = null;
            if (arguments.length > 1) {
                var Properties = Object(arguments[1]);
                for (var prop in Properties) {
                    if (hasOwn.call(Properties, prop)) {
                        var descriptor = Properties[prop];
                        if (Object(descriptor) !== descriptor) {
                            throw TypeError(prop + "must be an object")
                        }
                        if ("get" in descriptor || "set" in descriptor) {
                            throw new TypeError("getters & setters can not be defined on this javascript engine")
                        }
                        if ("value" in descriptor) {
                            obj[prop] = Properties[prop];
                        }
                    }
                }
            }
            return obj;
        };
    })();
}
if (!Object.defineProperties) {
    Object.defineProperties = function(object, props) {
        function hasProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }

        function convertToDescriptor(desc) {
            if (Object(desc) !== desc) {
                throw new TypeError("Descriptor can only be an Object.")
            }
            var d = {};
            if (hasProperty(desc, "enumerable")) {
                d.enumerable = !(!desc.enumerable);
            }
            if (hasProperty(desc, "configurable")) {
                d.configurable = !(!desc.configurable);
            }
            if (hasProperty(desc, "value")) {
                d.value = desc.value;
            }
            if (hasProperty(desc, "writable")) {
                d.writable = !(!desc.writable);
            }
            if (hasProperty(desc, "get")) {
                throw new TypeError("getters & setters can not be defined on this javascript engine")
            }
            if (hasProperty(desc, "set")) {
                throw new TypeError("getters & setters can not be defined on this javascript engine")
            }
            return d;
        }
        if (Object(object) !== object) {
            throw new TypeError("Object.defineProperties can only be called on Objects.")
        }
        if (Object(props) !== props) {
            throw new TypeError("Properties can only be an Object.")
        }
        var properties = Object(props);
        for (var propName in properties) {
            if (hasOwnProperty.call(properties, propName)) {
                var descr = convertToDescriptor(properties[propName]);
                object[propName] = descr.value;
            }
        }
        return object;
    };
}
if (!Array.prototype.some) {
    Array.prototype.some = function(callback, thisArg) {
        if (this === void(0) || this === null) {
            throw new TypeError("Array.prototype.some called on null or undefined")
        }
        if (callback.__class__ !== "Function") {
            throw new TypeError(callback + " is not a function")
        }
        var t = Object(this);
        var len = t.length >>> 0;
        var T = (arguments.length > 1 ? thisArg : void(0));
        for (var i = 0; i < len; i += 1) {
            if (i in t && callback.call(T, t[i], i, t)) {
                return true;
            }
        }
        return false;
    };
}
if (!Object.defineProperty) {
    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if (Object(object) !== object) {
            throw new TypeError("Object.defineProperty can only be called on Objects.")
        }
        if (Object(descriptor) !== descriptor) {
            throw new TypeError("Property description can only be an Object.")
        }
        if ("get" in descriptor || "set" in descriptor) {
            throw new TypeError("getters & setters can not be defined on this javascript engine")
        }
        if ("value" in descriptor) {
            object[property] = descriptor.value;
        }
        return object;
    };
}
if (!Object.getOwnPropertyDescriptor) {
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if (Object(object) !== object) {
            throw new TypeError("Object.getOwnPropertyDescriptor can only be called on Objects.")
        }
        if (!Object.prototype.hasOwnProperty.call(object, property)) {
            return descriptor;
        }
        descriptor = {
            enumerable: Object.prototype.propertyIsEnumerable.call(object, property),
            configurable: true
        };
        descriptor.value = object[property];
        var psPropertyType = object.reflect.find(property).type;
        descriptor.writable = !(psPropertyType === "readonly");
        return descriptor;
    };
}
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
        if (Object(object) !== object) {
            throw new TypeError("Object.freeze can only be called on Objects.")
        }
        return object;
    };
}
if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function(object) {
        if (Object(object) !== object) {
            throw new TypeError("Object.getPrototypeOf can only be called on Objects.")
        }
        return object.__proto__;
    };
}
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        if (Object(object) !== object) {
            throw new TypeError("Object.getOwnPropertyNames can only be called on Objects.")
        }
        var names = [];
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
        for (var prop in object) {
            if (hasOwnProperty.call(object, prop)) {
                names.push(prop);
            }
        }
        var properties = object.reflect.properties;
        var methods = object.reflect.methods;
        var all = methods.concat(properties);
        for (var i = 0; i < all.length; i += 1) {
            var prop = (all[i]).name;
            if (hasOwnProperty.call(object, prop) && !propertyIsEnumerable.call(object, prop)) {
                names.push(prop);
            }
        }
        return names;
    };
}
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
        if (Object(object) !== object) {
            throw new TypeError("Object.isExtensible can only be called on Objects.")
        }
        return true;
    };
}
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
        if (Object(object) !== object) {
            throw new TypeError("Object.isFrozen can only be called on Objects.")
        }
        return false;
    };
}
if (!Object.keys) {
    Object.keys = function(object) {
        if (Object(object) !== object) {
            throw new TypeError("Object.keys can only be called on Objects.")
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var result = [];
        for (var prop in object) {
            if (hasOwnProperty.call(object, prop)) {
                result.push(prop);
            }
        }
        return result;
    };
}
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
        if (Object(object) !== object) {
            throw new TypeError("Object.isSealed can only be called on Objects.")
        }
        return false;
    };
}
if (!Object.seal) {
    Object.seal = function seal(object) {
        if (Object(object) !== object) {
            throw new TypeError("Object.seal can only be called on Objects.")
        }
        return object;
    };
}
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
        if (Object(object) !== object) {
            throw new TypeError("Object.preventExtensions can only be called on Objects.")
        }
        return object;
    };
}
(function() {
    "use strict";
    var __webpack_modules__ = {
        "./build/aeft/bridge.js": function(__unused_webpack_module, exports) {
            exports.__esModule = true;
            try {
                xLib = new ExternalObject("lib:PlugPlugExternalObject");
            } catch (e) {
                alert("Missing ExternalObject: " + e);
            }

            function dispatch(type, data) {
                if (!xLib) {
                    return;
                }
                var eventObj = new CSXSEvent();
                eventObj.type = type;
                eventObj.data = data || "";
                eventObj.dispatch();
            }
            exports["default"] = dispatch;
        },
        "./build/aeft/console.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            var bridge_1 = __webpack_require__("./build/aeft/bridge.js");

            function _log(args, type) {
                var safeArgs = args.map(function(arg) {
                    try {
                        JSON.stringify(arg);
                        if (Array.isArray(arg)) {
                            return arg;
                        }
                        if (typeof arg === "object") {
                            return Object.keys(arg).reduce(function(memo, key) {
                                if (typeof arg[key] === "function") {
                                    memo[key] = "[function ".concat((arg[key]).name, "]");
                                    return memo;
                                }
                                if (typeof arg[key] === "undefined") {
                                    memo[key] = "[undefined]";
                                    return memo;
                                }
                                memo[key] = arg[key];
                                return memo;
                            }, {});
                        }
                        return arg;
                    } catch (e) {
                        return arg.toString();
                    }
                });
                bridge_1["default"]("CONSOLE_" + type, JSON.stringify(safeArgs));
            }

            function logConsole() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i += 1) {
                    args[_i] = arguments[_i];
                }
                _log(args, "LOG");
            }

            function logError() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i += 1) {
                    args[_i] = arguments[_i];
                }
                _log(args, "ERROR");
            }

            function logWarning() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i += 1) {
                    args[_i] = arguments[_i];
                }
                _log(args, "WARN");
            }
            exports["default"] = {
                log: logConsole,
                error: logError,
                warn: logWarning
            };
        },
        "./build/aeft/errors.js": function(__unused_webpack_module, exports) {
            exports.__esModule = true;
            exports.INVALID_LAYER_TYPE = exports.NOT_ENOUGH_SELECTED_KEYFRAMES_ON_SELECTED_PROPERTIES = exports.NOT_ENOUGH_KEYFRAMES_ON_SELECTED_PROPERTIES = exports.NO_SELECTED_LAYER_IS_SHAPELAYER_OR_TEXTLAYER = exports.NO_SELECTED_LAYER_IS_SHAPELAYER_OR_AVLAYER = exports.NO_PUPPET_PINS_FOUND = exports.NO_SELECTED_PROPERTIES_ARE_KEYFRAMEABLE = exports.NOT_ENOUGH_SELECTED_KEYFRAMES = exports.NO_SELECTED_LAYER_IS_TEXT_LAYER = exports.NOT_ALL_SELECTED_PROPERTIES_ARE_ON_SAME_LAYER = exports.NOT_ENOUGH_SELECTED_PROPERTIES_ON_COMPOSITION = exports.NOT_ENOUGH_SELECTED_PROPERTIES_ON_LAYER = exports.NOT_ENOUGH_SELECTED_LAYERS = exports.NO_ACTIVE_COMPOSITION = exports.NO_ADJUSTMENT_LAYERS = exports.FATAL_ERROR = void(0);
            exports.FATAL_ERROR = "fatal-error";
            exports.NO_ADJUSTMENT_LAYERS = "input/no-adjustment-layers";
            exports.NO_ACTIVE_COMPOSITION = "input/no-active-composition";
            exports.NOT_ENOUGH_SELECTED_LAYERS = "input/not-enough-selected-layers";
            exports.NOT_ENOUGH_SELECTED_PROPERTIES_ON_LAYER = "input/not-enough-selected-properties-on-layer";
            exports.NOT_ENOUGH_SELECTED_PROPERTIES_ON_COMPOSITION = "input/not-enough-selected-properties-on-composition";
            exports.NOT_ALL_SELECTED_PROPERTIES_ARE_ON_SAME_LAYER = "input/not-all-selected-properties-are-on-same-layer";
            exports.NO_SELECTED_LAYER_IS_TEXT_LAYER = "input/no-selected-layer-is-text-layer";
            exports.NOT_ENOUGH_SELECTED_KEYFRAMES = "input/not-enough-selected-keyframes";
            exports.NO_SELECTED_PROPERTIES_ARE_KEYFRAMEABLE = "input/no-selected-properties-are-keyframeable";
            exports.NO_PUPPET_PINS_FOUND = "input/no-puppet-pins-found";
            exports.NO_SELECTED_LAYER_IS_SHAPELAYER_OR_AVLAYER = "input/no-selected-layer-is-shapelayer-or-avlayer";
            exports.NO_SELECTED_LAYER_IS_SHAPELAYER_OR_TEXTLAYER = "input/no-selected-layer-is-shapelayer-or-textlayer";
            exports.NOT_ENOUGH_KEYFRAMES_ON_SELECTED_PROPERTIES = "input/not-enough-keyframes-on-selected-properties";
            exports.NOT_ENOUGH_SELECTED_KEYFRAMES_ON_SELECTED_PROPERTIES = "input/not-enough-selected-keyframes-on-selected-properties";
            exports.INVALID_LAYER_TYPE = "input/invalid-layer-type";
        },
        "./build/aeft/ffxMap.js": function(__unused_webpack_module, exports) {
            exports.__esModule = true;
            exports["default"] = {
                excite: {
                    pseudo: "Pseudo/BNCA2506f0b33",
                    enable: "Pseudo/BNCA2506f0b33-0001",
                    overshoot: "Pseudo/BNCA2506f0b33-0003",
                    bounce: "Pseudo/BNCA2506f0b33-0004",
                    friction: "Pseudo/BNCA2506f0b33-0005"
                },
                stare: {
                    pseudo: "Pseudo/oYCGfabae136L",
                    enable: "Pseudo/oYCGfabae136L-0001",
                    target: "Pseudo/oYCGfabae136L-0002",
                    calibration: "Pseudo/oYCGfabae136L-0003"
                },
                spin: {
                    pseudo: "Pseudo/yrO224f4b207o",
                    enable: "Pseudo/yrO224f4b207o-0001",
                    reverse: "Pseudo/yrO224f4b207o-0002",
                    calibration: "Pseudo/yrO224f4b207o-0004",
                    spinsPerSecond: "Pseudo/yrO224f4b207o-0005"
                },
                orbit: {
                    pseudo: "Pseudo/wQOMc41e812eH",
                    enable: "Pseudo/wQOMc41e812eH-0001",
                    target: "Pseudo/wQOMc41e812eH-0002",
                    reverse: "Pseudo/wQOMc41e812eH-0004",
                    speed: "Pseudo/wQOMc41e812eH-0005",
                    distance: "Pseudo/wQOMc41e812eH-0006",
                    calibration: "Pseudo/wQOMc41e812eH-0007"
                },
                jump: {
                    pseudo: "Pseudo/aHCxb79bbc95d",
                    enable: "Pseudo/aHCxb79bbc95d-0001",
                    jump: "Pseudo/aHCxb79bbc95d-0002",
                    stretch: "Pseudo/aHCxb79bbc95d-0004",
                    gravity: "Pseudo/aHCxb79bbc95d-0005",
                    maxJumps: "Pseudo/aHCxb79bbc95d-0006"
                },
                burst: {
                    pseudo: "Pseudo/UgOta64372a0u",
                    globalPosition: "Pseudo/UgOta64372a0u-0001",
                    copiesCount: "Pseudo/UgOta64372a0u-0003",
                    copiesBurstOffset: "Pseudo/UgOta64372a0u-0004",
                    copiesDistanceFromCenter: "Pseudo/UgOta64372a0u-0005",
                    copiesRevolution: "Pseudo/UgOta64372a0u-0006",
                    copiesRevolutionOffset: "Pseudo/UgOta64372a0u-0007",
                    linkWidthAndHeight: "Pseudo/UgOta64372a0u-0010",
                    height: "Pseudo/UgOta64372a0u-0011",
                    width: "Pseudo/UgOta64372a0u-0012",
                    roundness: "Pseudo/UgOta64372a0u-0013",
                    strokeWidth: "Pseudo/UgOta64372a0u-0014",
                    colorFillEnable: "Pseudo/UgOta64372a0u-0018",
                    colorFillColor: "Pseudo/UgOta64372a0u-0019",
                    colorStrokeEnable: "Pseudo/UgOta64372a0u-0022",
                    colorStrokeColor: "Pseudo/UgOta64372a0u-0023",
                    sequenceLinkWidthAndHeight: "Pseudo/UgOta64372a0u-0027",
                    sequenceHeight: "Pseudo/UgOta64372a0u-0028",
                    sequenceWidth: "Pseudo/UgOta64372a0u-0029"
                },
                blend: {
                    pseudo: "Pseudo/CTCR927f2b6bd",
                    enable: "Pseudo/CTCR927f2b6bd-0001",
                    smoothness: "Pseudo/CTCR927f2b6bd-0002",
                    precision: "Pseudo/CTCR927f2b6bd-0003"
                },
                forcefield: {
                    pseudo: "Pseudo/jQCm6c02bba1T",
                    magnetism: "Pseudo/jQCm6c02bba1T-0002",
                    target: "Pseudo/jQCm6c02bba1T-0004",
                    offset: "Pseudo/jQCm6c02bba1T-0005"
                },
                guides: {
                    enable: "DNC8e44021f21-0001"
                },
                dynamics1d: {
                    pseudo: "Pseudo/IwOVa882cc43v",
                    enable: "Pseudo/IwOVa882cc43v-0001",
                    type: "Pseudo/IwOVa882cc43v-0002",
                    frequency: "Pseudo/IwOVa882cc43v-0003",
                    amount: "Pseudo/IwOVa882cc43v-0004",
                    seed: "Pseudo/IwOVa882cc43v-0005"
                },
                dynamics2d: {
                    pseudo: "Pseudo/EPO5750a279cg",
                    enable: "Pseudo/EPO5750a279cg-0001",
                    type: "Pseudo/EPO5750a279cg-0002",
                    frequency: "Pseudo/EPO5750a279cg-0003",
                    amount: "Pseudo/EPO5750a279cg-0004",
                    seed: "Pseudo/EPO5750a279cg-0005",
                    seperation: "Pseudo/EPO5750a279cg-0007",
                    seperationX: "Pseudo/EPO5750a279cg-0008",
                    seperationY: "Pseudo/EPO5750a279cg-0009"
                },
                dynamics3d: {
                    pseudo: "Pseudo/jAOY6e34ca3cf",
                    enable: "Pseudo/jAOY6e34ca3cf-0001",
                    type: "Pseudo/jAOY6e34ca3cf-0002",
                    frequency: "Pseudo/jAOY6e34ca3cf-0003",
                    amount: "Pseudo/jAOY6e34ca3cf-0004",
                    seed: "Pseudo/jAOY6e34ca3cf-0005",
                    seperation: "Pseudo/jAOY6e34ca3cf-0007",
                    seperationX: "Pseudo/jAOY6e34ca3cf-0008",
                    seperationY: "Pseudo/jAOY6e34ca3cf-0009",
                    seperationZ: "Pseudo/jAOY6e34ca3cf-0010"
                },
                texture: {
                    pseudo: "Pseudo/jnOIbb35c80eN",
                    imagePosition: "Pseudo/jnOIbb35c80eN-0002",
                    imageScale: "Pseudo/jnOIbb35c80eN-0003",
                    imageRotation: "Pseudo/jnOIbb35c80eN-0004",
                    delayEnable: "Pseudo/jnOIbb35c80eN-0007",
                    delayAmount: "Pseudo/jnOIbb35c80eN-0008",
                    dynamicsEnable: "Pseudo/jnOIbb35c80eN-0011",
                    dynamicsType: "Pseudo/jnOIbb35c80eN-0012",
                    dynamicsFrequency: "Pseudo/jnOIbb35c80eN-0013",
                    dynamicsAmount: "Pseudo/jnOIbb35c80eN-0014",
                    dynamicsSeed: "Pseudo/jnOIbb35c80eN-0015",
                    seperationEnable: "Pseudo/jnOIbb35c80eN-0017",
                    seperationX: "Pseudo/jnOIbb35c80eN-0018",
                    seperationY: "Pseudo/jnOIbb35c80eN-0019",
                    seperationZ: "Pseudo/jnOIbb35c80eN-0020"
                },
                falloff: {
                    pseudo: "Pseudo/b0OA8d132c8bv",
                    enable: "Pseudo/b0OA8d132c8bv-0001",
                    invert: "Pseudo/b0OA8d132c8bv-0002",
                    falloff: "Pseudo/b0OA8d132c8bv-0003"
                },
                falloff1d: {
                    pseudo: "Pseudo/ajO511f0e9a91",
                    x: "Pseudo/ajO511f0e9a91-0001"
                },
                falloff2d: {
                    pseudo: "Pseudo/9JOu53278f8bp",
                    x: "Pseudo/9JOu53278f8bp-0001",
                    y: "Pseudo/9JOu53278f8bp-0002"
                },
                falloff3d: {
                    pseudo: "Pseudo/iSOkadb76865x",
                    x: "Pseudo/iSOkadb76865x-0001",
                    y: "Pseudo/iSOkadb76865x-0002",
                    z: "Pseudo/iSOkadb76865x-0003"
                },
                falloffcolor: {
                    pseudo: "Pseudo/LBP67203f30dE",
                    color: "Pseudo/LBP67203f30dE-0001"
                },
                vector: {
                    pseudo: "Pseudo/lNBj54414cf1C",
                    color: "Pseudo/lNBj54414cf1C-0002",
                    colorVariationEnable: "Pseudo/lNBj54414cf1C-0004",
                    colorVariationSeed: "Pseudo/lNBj54414cf1C-0005",
                    colorVariationCycle: "Pseudo/lNBj54414cf1C-0006",
                    strokeWidth: "Pseudo/lNBj54414cf1C-0010",
                    strokeVariationEnable: "Pseudo/lNBj54414cf1C-0012",
                    strokeVariationSeed: "Pseudo/lNBj54414cf1C-0013",
                    strokeVariationRangeStarting: "Pseudo/lNBj54414cf1C-0014",
                    strokeVariationRangeEnding: "Pseudo/lNBj54414cf1C-0015",
                    writeOnTime: "Pseudo/lNBj54414cf1C-0019",
                    writeOnLength: "Pseudo/lNBj54414cf1C-0020",
                    writeOnVariationEnable: "Pseudo/lNBj54414cf1C-0022",
                    writeOnVariationSeed: "Pseudo/lNBj54414cf1C-0023",
                    writeOnVariationTime: "Pseudo/lNBj54414cf1C-0024",
                    writeOnVariationLength: "Pseudo/lNBj54414cf1C-0025"
                },
                vignette: {
                    pseudo: "Pseudo/hlCma9f4e5bei",
                    enable: "Pseudo/hlCma9f4e5bei-0001",
                    ellipse: "Pseudo/hlCma9f4e5bei-0002",
                    feather: "Pseudo/hlCma9f4e5bei-0004",
                    position: "Pseudo/hlCma9f4e5bei-0005",
                    scale: "Pseudo/hlCma9f4e5bei-0006",
                    intensity: "Pseudo/hlCma9f4e5bei-0007"
                }
            };
        },
        "./build/aeft/tap.js": function(__unused_webpack_module, exports) {
            exports.__esModule = true;
            var Tap = (function() {
                function Tap(filePath) {
                    this.buffer = "";
                    this.count = 0;
                    this.succeeded = 0;
                    this.failed = 0;
                    if (filePath) {
                        this.file = File(filePath);
                        if (!this.file.exists) {
                            this.file = new File(filePath);
                        }
                        this.file.open("w", undefined, undefined);
                        this.file.encoding = "UTF-8";
                        this.file.lineFeed = "Unix";
                    }
                    this.writeln("TAP version 13");
                }
                Tap.prototype.write = function(str) {
                    this.buffer += str;
                    if (this.file) {
                        this.file.write(str);
                    }
                };
                Tap.prototype.writeln = function(str) {
                    this.buffer += str + "\n";
                    if (this.file) {
                        this.file.write(str + "\n");
                    }
                };
                Tap.prototype.test = function(name, cb) {
                    this.writeln("# ".concat(name));
                    cb(this);
                };
                Tap.prototype.equals = function(a, b, msg) {
                    this.count++;
                    if (JSON.stringify(a) == JSON.stringify(b)) {
                        this.succeeded++;
                        this.writeln("ok " + this.count + " " + msg || "Are equal");
                    } else {
                        this.failed++;
                        this.writeln("not ok ".concat(this.count, " ").concat(msg || "Not equal", "\n  ---\n    operator: equal\n    expected: ").concat(JSON.stringify(b), "\n    actual:   ").concat(JSON.stringify(a), "\n  ..."));
                    }
                };
                Tap.prototype.notEquals = function(a, b, msg) {
                    this.count++;
                    if (JSON.stringify(a) !== JSON.stringify(b)) {
                        this.succeeded++;
                        this.writeln("ok ".concat(this.count, " ").concat(msg || "Are not equal"));
                    } else {
                        this.writeln("not ok ".concat(this.count, " ").concat(msg || "Are equal", "\n  ---\n    operator: notEqual\n    expected: difference\n    actual:   ").concat(JSON.stringify(a), "\n  ..."));
                        this.failed++;
                    }
                };
                Tap.prototype.end = function() {
                    this.writeln("\n1..".concat(this.count, "\n# tests ").concat(this.count, "\n# pass ").concat(this.succeeded, "\n# fail ").concat(this.failed));
                    if (this.file) {
                        this.file.close();
                    }
                    return this.buffer;
                };
                return Tap;
            })();
            exports["default"] = Tap;
        },
        "./build/aeft/tools/align.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __read = this && this.__read || function(o, n) {
                    var m = typeof Symbol === "function" && o[Symbol.iterator];
                    if (!m) {
                        return o;
                    }
                    var i = m.call(o);
                    var ar = [];
                    try {
                        while (n === void(0) || n-- > 0 && !(r = i.next()).done) {
                            ar.push(r.value)
                        }
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            if (r && !r.done && m = i["return"]) {
                                m.call(i)
                            }
                        } finally {
                            if (e) {
                                throw e.error
                            }
                        }
                    }
                    return ar;
                };
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                return {
                    composition: composition,
                    selectedLayers: selectedLayers
                };
            }
            exports.check = check;

            function run(offset, alignToSelection) {
                var _a = check();
                var composition = _a.composition;
                var selectedLayers = _a.selectedLayers;
                app.beginUndoGroup("Motion - Align");
                var time = composition.time;
                var selection = [];
                if (alignToSelection && selectedLayers.length > 1) {
                    selectedLayers.forEach(function(layer) {
                        var bounds = utils_1.layerToBounds(layer, time, false, false);
                        var absTopLeft = utils_1.harvestPoint([bounds.left, bounds.top, 0], layer, "toWorld");
                        var absBottomRight = utils_1.harvestPoint([bounds.left + bounds.width, bounds.top + bounds.height, 0], layer, "toWorld");
                        if (selection.length === 0) {
                            selection = [absTopLeft[0], absBottomRight[0], absTopLeft[1], absBottomRight[1]];
                        } else {
                            selection = [(absTopLeft[0] < selection[0] ? absTopLeft[0] : selection[0]), (absBottomRight[0] > selection[1] ? absBottomRight[0] : selection[1]), (absTopLeft[1] < selection[2] ? absTopLeft[1] : selection[2]), (absBottomRight[1] > selection[3] ? absBottomRight[1] : selection[3])];
                        }
                    });
                }
                selectedLayers.forEach(function(layer) {
                    if (!utils_1.isAVLayer(layer)) {
                        return;
                    }
                    var bounds = utils_1.layerToBounds(layer, time, false, false);
                    var _a = __read(utils_1.harvestPoint([bounds.left, bounds.top, 0], layer, "toWorld"), 2);
                    var absTopLeftX = _a[0];
                    var absTopLeftY = _a[1];
                    var _b = __read(utils_1.harvestPoint([bounds.left + bounds.width, bounds.top + bounds.height, 0], layer, "toWorld"), 2);
                    var absBottomRightX = _b[0];
                    var absBottomRightY = _b[1];
                    var _c = __read(utils_1.harvestPoint(layer.anchorPoint.value, layer, "toWorld"), 2);
                    var anchorPointX = _c[0];
                    var anchorPointY = _c[1];
                    var xSign = ((anchorPointX - absBottomRightX) > 0 ? 1 : -1);
                    var ySign = ((anchorPointY - absBottomRightY) > 0 ? 1 : -1);
                    var extraOffsetX = (xSign < 0 ? anchorPointX - absTopLeftX : 0);
                    var extraOffsetY = (ySign < 0 ? anchorPointY - absTopLeftY : 0);
                    var extraMinusOffsetX = ((anchorPointX - absTopLeftX) < 0 ? anchorPointX - absTopLeftX : 0);
                    var extraMinusOffsetY = ((anchorPointY - absTopLeftY) < 0 ? anchorPointY - absTopLeftY : 0);
                    var absXOffset = [anchorPointX - absTopLeftX, anchorPointX - absBottomRightX, ((((Math.abs(anchorPointX - absTopLeftX) + Math.abs(anchorPointX - absBottomRightX)) / 2) * xSign) + extraOffsetX) - extraMinusOffsetX];
                    var absYOffset = [anchorPointY - absTopLeftY, anchorPointY - absBottomRightY, ((((Math.abs(anchorPointY - absTopLeftY) + Math.abs(anchorPointY - absBottomRightY)) / 2) * ySign) + extraOffsetY) - extraMinusOffsetY];
                    var xOffsetIndex = ((offset[0] === null ? 3 : offset[0] === 0.5) ? 2 : offset[0]);
                    var yOffsetIndex = ((offset[1] === null ? 3 : offset[1] === 0.5) ? 2 : offset[1]);
                    var destination = [(offset[0] * composition.width) + (offset[0] !== null ? absXOffset[xOffsetIndex] : 0) || layer.position.value[0], (offset[1] * composition.height) + (offset[1] !== null ? absYOffset[yOffsetIndex] : 0) || layer.position.value[1]];
                    if (alignToSelection && selectedLayers.length > 1) {
                        selection[4] = (selection[0] + selection[1]) / 2;
                        selection[5] = (selection[2] + selection[3]) / 2;
                        var xSelection = (offset[0] !== null ? ((offset[0] === 0.5 ? selection[4] : selection[offset[0]])) : selection[-1]);
                        var ySelection = (offset[1] !== null ? ((offset[1] === 0.5 ? selection[5] : selection[offset[1] + 2])) : selection[-1]);
                        destination = [xSelection + (offset[0] !== null ? absXOffset[xOffsetIndex] : 0) || layer.position.value[0], ySelection + (offset[1] !== null ? absYOffset[yOffsetIndex] : 0) || layer.position.value[1]];
                    }
                    utils_1.safelySetPoint(layer.transform.position, destination, time);
                    layer.selected = true;
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/anchor.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.runAnchorWIP = exports.runAnchorOld = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var rotateMatrix = function(matrix, repeat) {
                var newGrid = [];
                for (var i = 0; i < repeat; i += 1) {
                    newGrid = [];
                    var rowLength = Math.sqrt(matrix.length);
                    newGrid.length = matrix.length;
                    for (var i_1 = 0; i_1 < matrix.length; i_1 += 1) {
                        var x = i_1 % rowLength;
                        var y = Math.floor(i_1 / rowLength);
                        var newX = (rowLength - y) - 1;
                        var newY = x;
                        var newPosition = (newY * rowLength) + newX;
                        newGrid[newPosition] = matrix[i_1];
                    }
                    matrix = newGrid;
                }
                return newGrid;
            };

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                return {
                    composition: composition,
                    selectedLayers: selectedLayers
                };
            }
            exports.check = check;

            function runAnchorOld(row, col, includeMask, center, lockRotation, toFirst, toLast, toAverage) {
                var anchorX = col;
                var anchorY = row;
                var ignoreMasks = !includeMask;
                var composition = app.project.activeItem;
                if (!(composition instanceof CompItem)) {
                    return;
                }
                var curTime = composition.time;
                var theLayers = composition.selectedLayers;
                var x = 0;
                var y = 0;
                var lowerPositionBound = [Infinity, Infinity];
                var upperPositionBound = [-Infinity, -Infinity];
                var avgPosition = [Infinity, Infinity];
                if (toAverage) {
                    theLayers.forEach(function(layer) {
                        var absAnchorPoint = utils_1.harvestPoint([layer.anchorPoint.value[0], layer.anchorPoint.value[1]], layer, "toWorld");
                        absAnchorPoint.forEach(function(point, i) {
                            if (point < lowerPositionBound[i]) {
                                lowerPositionBound[i] = point;
                            }
                            if (point > upperPositionBound[i]) {
                                upperPositionBound[i] = point;
                            }
                        });
                        avgPosition = lowerPositionBound.map(function(_, i) {
                            return ((upperPositionBound[i] - lowerPositionBound[i]) / 2) + lowerPositionBound[i];
                        });
                    });
                }
                for (var num = 0; num < theLayers.length; num += 1) {
                    var theLayer = theLayers[num];
                    var xRef = anchorX;
                    var yRef = anchorY;
                    if (theLayer instanceof CameraLayer || theLayer.source && theLayer.source.name.indexOf(".c4d") !== -1) {
                        return;
                    }
                    var noMasks = true;
                    if (ignoreMasks === true) {
                        noMasks = true;
                    } else {
                        if (theLayer.mask.numProperties !== 0) {
                            for (var i = 1; i <= theLayer.mask.numProperties; i += 1) {
                                if (theLayer.mask(i).maskMode != MaskMode.NONE) {
                                    noMasks = false;
                                }
                            }
                        }
                    }
                    if (lockRotation) {
                        var matrix = [
                            [0, 0],
                            [0.5, 0],
                            [1, 0],
                            [0, 0.5],
                            [0.5, 0.5],
                            [1, 0.5],
                            [0, 1],
                            [0.5, 1],
                            [1, 1]
                        ];
                        var indexPoint = 0;
                        var rotation = theLayer.rotation.value % 360;
                        if (rotation < 0) {
                            rotation = 360 + rotation;
                        }
                        for (var k = 0; k < matrix.length; k += 1) {
                            if ((matrix[k])[0] === xRef && (matrix[k])[1] === yRef) {
                                indexPoint = k;
                            }
                        }
                        switch (true) {
                            case rotation >= 0 && rotation < 45:
                                break;
                            case rotation >= 45 && rotation < 135:
                                var m = rotateMatrix(matrix, 1);
                                xRef = (m[indexPoint])[0];
                                yRef = (m[indexPoint])[1];
                                break;
                            case rotation >= 135 && rotation < 225:
                                var m = rotateMatrix(matrix, 2);
                                xRef = (m[indexPoint])[0];
                                yRef = (m[indexPoint])[1];
                                break;
                            case rotation >= 225 && rotation < 315:
                                var m = rotateMatrix(matrix, 3);
                                xRef = (m[indexPoint])[0];
                                yRef = (m[indexPoint])[1];
                                break;
                            case rotation >= 315 && rotation < 360:
                                break;
                        }
                    }
                    if (noMasks) {
                        switch (xRef) {
                            case 0:
                                x = 0;
                                break;
                            case 0.5:
                                x = theLayer.sourceRectAtTime(curTime, false).width / 2;
                                break;
                            case 1:
                                x = theLayer.sourceRectAtTime(curTime, false).width;
                                break;
                            default:

                        }
                        switch (yRef) {
                            case 0:
                                y = 0;
                                break;
                            case 0.5:
                                y = theLayer.sourceRectAtTime(curTime, false).height / 2;
                                break;
                            case 1:
                                y = theLayer.sourceRectAtTime(curTime, false).height;
                                break;
                            default:

                        }
                        if (theLayer instanceof TextLayer || theLayer instanceof ShapeLayer) {
                            x += theLayer.sourceRectAtTime(curTime, false).left;
                            y += theLayer.sourceRectAtTime(curTime, false).top;
                        }
                    } else {
                        var xBounds = [];
                        var yBounds = [];
                        var numMasks = theLayer.mask.numProperties;
                        for (var f = 1; f <= numMasks; f += 1) {
                            var numVerts = theLayer.mask(f).maskShape.value.vertices.length;
                            if (theLayer.mask(f).maskMode == MaskMode.NONE) {
                                continue;
                            }
                            for (var j = 0; j < numVerts; j += 1) {
                                var curVerts = theLayer.mask(f).maskShape.valueAtTime(curTime, false).vertices[j];
                                xBounds.push(curVerts[0]);
                                yBounds.push(curVerts[1]);
                            }
                        }
                        xBounds.sort(function(a, b) {
                            return a - b;
                        });
                        yBounds.sort(function(a, b) {
                            return a - b;
                        });
                        var xl = xBounds.shift();
                        var xh = xBounds.pop();
                        var yl = yBounds.shift();
                        var yh = yBounds.pop();
                        if (xl === undefined || xh === undefined || yl === undefined || yh === undefined) {
                            return;
                        }
                        if (theLayer instanceof TextLayer || theLayer instanceof ShapeLayer) {
                            var xl2 = theLayer.sourceRectAtTime(curTime, false).left;
                            var xh2 = xl2 + theLayer.sourceRectAtTime(curTime, false).width;
                            var yl2 = theLayer.sourceRectAtTime(curTime, false).top;
                            var yh2 = yl2 + theLayer.sourceRectAtTime(curTime, false).height;
                            if (xl < xl2) {
                                xl = xl2;
                            }
                            if (xh > xh2) {
                                xh = xh2;
                            }
                            if (yl < yl2) {
                                yl = yl2;
                            }
                            if (yh > yh2) {
                                yh = yh2;
                            }
                        }
                        switch (xRef) {
                            case 0:
                                x = xl;
                                break;
                            case 0.5:
                                x = xl + ((xh - xl) / 2);
                                break;
                            case 1:
                                x = xh;
                                break;
                            default:

                        }
                        switch (yRef) {
                            case 0:
                                y = yl;
                                break;
                            case 0.5:
                                y = yl + ((yh - yl) / 2);
                                break;
                            case 1:
                                y = yh;
                                break;
                            default:

                        }
                    }
                    if (toFirst || toLast) {
                        var index = (toFirst ? 0 : theLayers.length - 1);
                        var referenceLayer = theLayers[index];
                        var absAnchorPoint = utils_1.harvestPoint([referenceLayer.anchorPoint.value[0], referenceLayer.anchorPoint.value[1]], referenceLayer, "toWorld");
                        var relativeAnchor = utils_1.harvestPoint([absAnchorPoint[0], absAnchorPoint[1]], theLayer, "fromWorld");
                        x = relativeAnchor[0];
                        y = relativeAnchor[1];
                    }
                    if (toAverage) {
                        var relativeAnchor = utils_1.harvestPoint([avgPosition[0], avgPosition[1]], theLayer, "fromComp");
                        x = relativeAnchor[0];
                        y = relativeAnchor[1];
                    }
                    if (theLayer.anchorPoint.isTimeVarying) {
                        var theComp = composition;
                        theLayer.anchorPoint.setValueAtTime(theComp.time, [x, y]);
                    } else {
                        var curAnchor = theLayer.anchorPoint.value;
                        var scaleValue = theLayer.scale.value;
                        var xMove = (x - curAnchor[0]) * (scaleValue[0] / 100);
                        var yMove = (y - curAnchor[1]) * (scaleValue[1] / 100);
                        var posEx = false;
                        var curPos = void(0);
                        if (theLayer.position.expressionEnabled) {
                            theLayer.position.expressionEnabled = false;
                            posEx = true;
                        }
                        var dupLayer = theLayer.duplicate();
                        var oldParent = theLayer.parent;
                        dupLayer.moveToEnd();
                        if (dupLayer.scale.isTimeVarying) {
                            dupLayer.scale.setValueAtTime(composition.time, [100, 100]);
                        } else {
                            dupLayer.scale.setValue([100, 100]);
                        }
                        theLayer.parent = dupLayer;
                        theLayer.anchorPoint.setValue([x, y]);
                        if (theLayer.position.isTimeVarying) {
                            if (theLayer.position.dimensionsSeparated) {
                                var xProp = theLayer.property("ADBE Transform Group").property("ADBE Position_0");
                                var numXKeys = xProp.numKeys;
                                for (var k = 1; k <= numXKeys; k += 1) {
                                    xProp.setValueAtKey(k, xProp.keyValue(k) + xMove);
                                }
                                var yProp = theLayer.property("ADBE Transform Group").property("ADBE Position_1");
                                var numYKeys = yProp.numKeys;
                                for (var k = 1; k <= numYKeys; k += 1) {
                                    yProp.setValueAtKey(k, yProp.keyValue(k) + yMove);
                                }
                            } else {
                                var numKeys = theLayer.position.numKeys;
                                for (var k = 1; k <= numKeys; k += 1) {
                                    curPos = theLayer.position.keyValue(k);
                                    curPos[0] += xMove;
                                    curPos[1] += yMove;
                                    theLayer.position.setValueAtKey(k, curPos);
                                }
                            }
                        } else {
                            curPos = theLayer.position.value;
                            if (theLayer.position.dimensionsSeparated) {
                                theLayer.property("ADBE Transform Group").property("ADBE Position_0").setValue(curPos[0] + xMove);
                                theLayer.property("ADBE Transform Group").property("ADBE Position_1").setValue(curPos[1] + yMove);
                            } else {
                                theLayer.position.setValue([curPos[0] + xMove, curPos[1] + yMove, curPos[2]]);
                            }
                        }
                        if (posEx) {
                            theLayer.position.expressionEnabled = true;
                        }
                        theLayer.parent = null;
                        dupLayer.remove();
                        if (center) {
                            if (theLayer.position.numKeys === 0) {
                                if (theLayer.position.dimensionsSeparated) {
                                    theLayer.property("ADBE Transform Group").property("ADBE Position_0").setValue(composition.width / 2);
                                    theLayer.property("ADBE Transform Group").property("ADBE Position_1").setValue(composition.height / 2);
                                } else {
                                    theLayer.position.setValue([composition.width / 2, composition.height / 2]);
                                }
                            } else {
                                if (theLayer.position.dimensionsSeparated) {
                                    theLayer.property("ADBE Transform Group").property("ADBE Position_0").setValueAtTime(composition.time, composition.width / 2);
                                    theLayer.property("ADBE Transform Group").property("ADBE Position_1").setValueAtTime(composition.time, composition.height / 2);
                                } else {
                                    theLayer.position.setValueAtTime(composition.time, [composition.width / 2, composition.height / 2]);
                                }
                            }
                        }
                        theLayer.parent = oldParent;
                    }
                }
            }
            exports.runAnchorOld = runAnchorOld;

            function runAnchorWIP(row, col, includeMask, center, extents) {
                if (includeMask === void(0)) {
                    includeMask = true;
                }
                if (center === void(0)) {
                    center = false;
                }
                if (extents === void(0)) {
                    extents = false;
                }
                var _a = check();
                var composition = _a.composition;
                var selectedLayers = _a.selectedLayers;
                var time = composition.time;
                selectedLayers.forEach(function(layer) {
                    if (!utils_1.isAVLayer(layer)) {
                        return;
                    }
                    var bounds = utils_1.layerToBounds(layer, composition.time, includeMask, extents);
                    var absTopLeft = utils_1.harvestPoint([bounds.left, bounds.top, 0], layer, "toWorld");
                    var absTopRight = utils_1.harvestPoint([bounds.left + bounds.width, bounds.top, 0], layer, "toWorld");
                    var absBottomLeft = utils_1.harvestPoint([bounds.left, bounds.top + bounds.height, 0], layer, "toWorld");
                    var horizontalVector = [absTopRight[0] - absTopLeft[0], absTopRight[1] - absTopLeft[1], absTopRight[2] - absTopLeft[2]];
                    var verticalVector = [absBottomLeft[0] - absTopLeft[0], absBottomLeft[1] - absTopLeft[1], absBottomLeft[2] - absTopLeft[2]];
                    var oldParent = layer.parent;
                    layer.parent = null;
                    var absDestination = [absTopLeft[0] + (horizontalVector[0] * col) + (verticalVector[0] * row), absTopLeft[1] + (horizontalVector[1] * col) + (verticalVector[1] * row), absTopLeft[2] + (horizontalVector[2] * col) + (verticalVector[2] * row)];
                    var relativeAnchor = utils_1.harvestPoint(absDestination, layer, "fromWorld");
                    var anchorOffset = [relativeAnchor[0] - layer.anchorPoint.value[0], relativeAnchor[1] - layer.anchorPoint.value[1], relativeAnchor[2] - layer.anchorPoint.value[2] || 0];
                    utils_1.safelyAddPoint(layer.transform.anchorPoint, anchorOffset, time);
                    if (center) {
                        utils_1.safelySetPoint(layer.transform.position, [composition.width / 2, composition.height / 2], time);
                    } else {
                        var positionOffset = [absDestination[0] - layer.transform.position.value[0], absDestination[1] - layer.transform.position.value[1], absDestination[2] - layer.transform.position.value[2] || 0];
                        utils_1.safelyAddPoint(layer.transform.position, positionOffset, time);
                    }
                    if (oldParent) {
                        layer.parent = oldParent;
                    }
                    layer.selected = true;
                });
            }
            exports.runAnchorWIP = runAnchorWIP;

            function run(row, col, includeMask, center, lockRotation, toFirst, toLast, toAverage) {
                app.beginUndoGroup("Motion - Anchor");
                runAnchorOld(row, col, includeMask, center, lockRotation, toFirst, toLast, toAverage);
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/animo.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var ANIMO_PREFIX = "[a] ";
            var ANIMO_CONTROLLER_PREFIX = "[a-c] ";

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                var selectedProperties = utils_1.getSelectedPropertiesOnComposition(composition);
                var propertiesHaveKeyframes = false;
                for (var j = 0; j < selectedProperties.length; j += 1) {
                    var selectedProperty = selectedProperties[j];
                    if (selectedProperty instanceof PropertyGroup) {
                        continue;
                    }
                    if (selectedProperty.canVaryOverTime && selectedProperty.numKeys > 1) {
                        propertiesHaveKeyframes = true;
                    }
                }
                if (!propertiesHaveKeyframes) {
                    throw utils_1.WrappedError(new Error("Selected properties do not have at least 2 keyframe"), errors_1.NOT_ENOUGH_KEYFRAMES_ON_SELECTED_PROPERTIES)
                }
                return {
                    composition: composition,
                    selectedLayers: selectedLayers,
                    selectedProperties: selectedProperties
                };
            }
            exports.check = check;

            function propertyToShortName(property, includeLayerName) {
                var name = [];
                var parent = property.parentProperty;
                name.push(property.name);
                while (parent) {
                    if (includeLayerName && parent instanceof Layer) {

                    } else {
                        name.unshift(parent.name);
                    }
                    parent = parent.parentProperty;
                }
                return name.join(">");
            }

            function makeSelections(controllerLayer, selectedProperties, groupEnabled, includeLayerName, name) {
                var effects = controllerLayer.property("ADBE Effect Parade");
                if (groupEnabled) {
                    var effectName = name || controllerLayer.name.replace(ANIMO_CONTROLLER_PREFIX, "");
                    var effect = effects.property(effectName);
                    effect.property("Pseudo/Vja67b86eDUB-0002").selected = true;
                } else {
                    selectedProperties.forEach(function(selectedProperty) {
                        effects.property(propertyToAnimoEffectName(selectedProperty, includeLayerName)).property("Pseudo/Vja67b86eDUB-0002").selected = true;
                    });
                }
            }

            function propertyToAnimoEffectName(property, includeLayerName) {
                return "".concat(ANIMO_PREFIX).concat(propertyToShortName(property, includeLayerName));
            }

            function minifier(code, map) {
                Object.keys(map).forEach(function(key) {
                    code = code.replace(new RegExp(key, "g"), map[key]);
                });
                var lines = code.split("\n").map(function(line) {
                    return line.trim();
                });
                var firstLine = lines.shift();
                return "".concat(firstLine, "\n").concat(lines.join(""));
            }

            function getExpression(controllerName, effectName) {
                return minifier("// Mt. Mograph - Animo - Property\neffectProperty = thisComp.layer(".concat(JSON.stringify(controllerName), ").effect(").concat(JSON.stringify(effectName), ");\nisEnabled = effectProperty(\"Pseudo/Vja67b86eDUB-0001\");\nif (isEnabled > 0 && numKeys > 1) {\nanimatePercentage = effectProperty(\"Pseudo/Vja67b86eDUB-0002\");\nstartKeyTime = key(1).time;\nendKeyTime = key(numKeys).time;\nkeyedDuration = endKeyTime - startKeyTime;\nvalueAtTime(startKeyTime + (keyedDuration * (animatePercentage / 100)));\n} else {\nvalue;\n}"), {
                    effectProperty: "a",
                    isEnabled: "b",
                    animatePercentage: "c",
                    startKeyTime: "d",
                    endKeyTime: "e",
                    keyedDuration: "f"
                });
            }

            function getSpectreOutputExpression(effectName) {
                return minifier("// Mt. Mograph - Animo - Spectre Output\nchildEffect = effect(".concat(JSON.stringify(effectName), ");\ntrig_enable = childEffect(\"Pseudo/Vja67b86eDUB-0004\");\ntry {\ntl_allowFX = childEffect(\"Pseudo/Vja67b86eDUB-0005\");\ntl_trigger = childEffect(\"Pseudo/Vja67b86eDUB-0006\");\ntl_multiplier = childEffect(\"Pseudo/Vja67b86eDUB-0007\");\nif (trig_enable > 0 && tl_trigger !== index) {\n  tl_anchor = toComp(transform.anchorPoint);\n  tl_zero = toComp([0, 0]);\n  tl_dimension = toComp([thisLayer.width, thisLayer.height]);\n  x_diff = Math.abs(tl_zero[0] - tl_dimension[0]);\n  y_diff = Math.abs(tl_zero[1] - tl_dimension[1]);\n  trigger_sample = tl_trigger.sampleImage(tl_anchor, [x_diff / 2, y_diff / 2], tl_allowFX, time);\n  calc_sample = trigger_sample[3] * 100 * tl_multiplier;\n  calc_sample;\n} else {\n  0;\n}\n} catch (e) {\n0;\n}"), {
                    childEffect: "a",
                    trig_enable: "b",
                    tl_allowFX: "c",
                    tl_trigger: "d",
                    tl_anchor: "e",
                    tl_zero: "f",
                    tl_dimension: "g",
                    x_diff: "h",
                    y_diff: "i",
                    trigger_sample: "j",
                    calc_sample: "k"
                });
            }

            function getSpectreEnableExpression(effectName) {
                return minifier("// Mt. Mograph - Animo - Spectre Enable\nchildEffect = effect(".concat(JSON.stringify(effectName), ");\nspectre_on = childEffect(\"Pseudo/Vja67b86eDUB-0004\");\nif (spectre_on > 0){\n0;\n} else {\nvalue;\n}"), {
                    childEffect: "a",
                    spectre_on: "b"
                });
            }

            function getAnimateExpression(effectName) {
                return minifier("// Mt. Mograph - Animo - Animate\neffectProperty = effect(".concat(JSON.stringify(effectName), ");\nenableTrigger = effectProperty(\"Pseudo/Vja67b86eDUB-0004\");\ntriggerOutput = effectProperty(\"Pseudo/Vja67b86eDUB-0008\");\ncycleIsEnabled = effectProperty(\"Pseudo/Vja67b86eDUB-0011\");\ncycleType = effectProperty(\"Pseudo/Vja67b86eDUB-0012\");\nif (enableTrigger > 0) {\ntriggerOutput;\n} else if (cycleIsEnabled == 1 && numKeys > 1 && enableTrigger < 1) {\nif (cycleType == 1) {\n  loopOut(\"cycle\");\n} else if (cycleType == 2) {\n  loopOut(\"pingpong\");\n}\n} else {\nvalue\n}"), {
                    effectProperty: "a",
                    enableTrigger: "b",
                    triggerOutput: "c",
                    cycleIsEnabled: "d",
                    cycleType: "e"
                });
            }

            function getSpectreAnchorExpression() {
                return "[thisLayer.width / 2, thisLayer.height / 2];";
            }
            var isAnimoable = function(property) {
                return property instanceof Property && property.canSetExpression && property.canVaryOverTime && property.numKeys >= 2;
            };

            function findControllerLayer(composition, selectedLayers, name) {
                var searchControllerLayer = utils_1.arrayFilter(utils_1.collectionToArray(composition.layers), function(layer) {
                    return layer.name === (ANIMO_CONTROLLER_PREFIX + name) && layer.label === 10 && layer.selectedProperties.length === 0;
                });
                if (searchControllerLayer.length === 1) {
                    return {
                        isNew: false,
                        foundControllerLayer: searchControllerLayer[0]
                    };
                }
                var searchSelectedLayers = utils_1.arrayFilter(selectedLayers, function(layer) {
                    return layer.label === 10 && layer.selectedProperties.length === 0;
                });
                if (searchSelectedLayers.length === 1) {
                    return {
                        isNew: false,
                        foundControllerLayer: searchSelectedLayers[0]
                    };
                }
                return {
                    isNew: false,
                    foundControllerLayer: null
                };
            }

            function findOrCreateControllerLayer(composition, selectedLayers, name) {
                var findResult = findControllerLayer(composition, selectedLayers, name);
                if (findResult.foundControllerLayer) {
                    return findResult;
                }
                utils_1.restoreSelectionAfter(function() {
                    controllerLayer = composition.layers.addNull();
                    controllerLayer.label = 10;
                    var controllerLayerName = utils_1.getUniqueNameFromLayers(composition.layers, (name ? ANIMO_CONTROLLER_PREFIX + name : ANIMO_CONTROLLER_PREFIX + "animo"));
                    controllerLayer.name = controllerLayerName;
                });
                return {
                    foundControllerLayer: controllerLayer,
                    isNew: true
                };
            }

            function addAnimo(composition, controllerLayer, properties, keyframesEnabled, shyEnabled, includeLayerName, name) {
                if (keyframesEnabled === void(0)) {
                    keyframesEnabled = false;
                }
                if (shyEnabled === void(0)) {
                    shyEnabled = false;
                }
                if (includeLayerName === void(0)) {
                    includeLayerName = false;
                }
                var groupEnabled = true;
                var fn = utils_1.genfun("function applyAnimo(composition, controllerLayer) {\nvar effectsProperty = controllerLayer.property('ADBE Effect Parade')");
                if (groupEnabled) {
                    var minTime_1 = Infinity;
                    var maxTime_1 = 0;
                    properties.forEach(function(property) {
                        var first = property.keyTime(1);
                        var last = property.keyTime(property.numKeys);
                        if (minTime_1 > first) {
                            minTime_1 = first
                        }
                        if (maxTime_1 < last) {
                            maxTime_1 = last
                        }
                    });
                    fn(("\nvar effectName = ".concat(JSON.stringify(name), " || controllerLayer.name.replace('").concat(ANIMO_CONTROLLER_PREFIX, "', '');\nif (!effectsProperty.property(effectName)) {\nvar effect = effectsProperty.addProperty('Pseudo/Vja67b86eDUB')\neffect.name = effectName\n\nvar spectreEnableExpression = getSpectreEnableExpression(effectName)\neffect.property('Pseudo/Vja67b86eDUB-0011').expression = spectreEnableExpression\n\nvar spectreOutputExpression = getSpectreOutputExpression(effectName)\neffect.property('Pseudo/Vja67b86eDUB-0008').expression = spectreOutputExpression\n\nvar animateExpression = getAnimateExpression(effectName)\neffect.property('Pseudo/Vja67b86eDUB-0002').expression = animateExpression\n").concat)((keyframesEnabled ? "effect.property('Pseudo/Vja67b86eDUB-0002').setValueAtTime(".concat(JSON.stringify(minTime_1), ", 0)\neffect.property('Pseudo/Vja67b86eDUB-0002').setValueAtTime(").concat(JSON.stringify(maxTime_1), ", 100)") : ""), "\n}"));
                }
                properties.forEach(function(property) {
                    if (!groupEnabled) {
                        effectName = propertyToAnimoEffectName(property, includeLayerName);
                        fn("var effect = effectsProperty.addProperty('Pseudo/Vja67b86eDUB')\nvar effectName = ".concat(JSON.stringify(effectName), "\neffect.name = effectName\n").concat((keyframesEnabled ? "\neffect.property('Pseudo/Vja67b86eDUB-0002').setValueAtTime(".concat(JSON.stringify(property.keyTime(1)), ", 0)\neffect.property('Pseudo/Vja67b86eDUB-0002').setValueAtTime(").concat(JSON.stringify(property.keyTime(property.numKeys)), ", 100)") : "")));
                    }
                    var propertyPath = utils_1.toPropertyPath(false)(property);
                    var layer = utils_1.getLayerForProperty(property);
                    var propertyPathString = ".property(".concat((propertyPath.map(function(str) {
                        return JSON.stringify(str);
                    }).join)(").property("), ")");
                    fn("// add the expression on the property\nvar expression = getExpression(controllerLayer.name, effectName)\nvar layer = composition.layer(".concat(JSON.stringify(layer.name), ")\nvar property = layer").concat(propertyPathString, "\nvar spectreAnchorExpression = getSpectreAnchorExpression()\nvar achorPoint = controllerLayer.property('ADBE Transform Group').property('ADBE Anchor Point')\nachorPoint.expression = spectreAnchorExpression\n\n// if (property.expression) {\n//   property.expression = '/* ' + property.expression + ' */\\n' + expression\n// } else {\n  property.expression = expression\n// }\n"));
                    if (shyEnabled) {
                        layer.shy = true;
                    }
                });
                if (shyEnabled) {
                    composition.hideShyLayers = true;
                }
                fn("}");
                return (fn.toFunction({
                    getExpression: getExpression,
                    getAnimateExpression: getAnimateExpression,
                    getSpectreOutputExpression: getSpectreOutputExpression,
                    getSpectreEnableExpression: getSpectreEnableExpression,
                    getSpectreAnchorExpression: getSpectreAnchorExpression
                }))(composition, controllerLayer);
            }

            function run(name, keyframesEnabled, shyEnabled) {
                var _a = check();
                var selectedLayers = _a.selectedLayers;
                var selectedProperties = _a.selectedProperties;
                utils_1.loadEffects();
                app.beginUndoGroup("Motion - Animo");
                utils_1.fast(function(composition) {
                    var allSelectedProperties = utils_1.arrayFilter(selectedProperties, isAnimoable);
                    var allSelectedPropertiesGetter = utils_1.propertiesToGetterFromComp(allSelectedProperties);
                    var _a = findOrCreateControllerLayer(composition, selectedLayers, name);
                    var foundControllerLayer = _a.foundControllerLayer;
                    var isNew = _a.isNew;
                    utils_1.deselectAll(composition);
                    if (foundControllerLayer) {
                        addAnimo(composition, foundControllerLayer, allSelectedProperties, keyframesEnabled, shyEnabled, true, name);
                        utils_1.tag(foundControllerLayer, 0, ((utils_1.propertyGroupToArray(foundControllerLayer.property("ADBE Effect Parade")).map(function(item) {
                            return item.name;
                        }).reverse)().join)(", "), true);
                        makeSelections(foundControllerLayer, allSelectedPropertiesGetter(composition), true, true, name);
                        if (isNew) {
                            var lowestIndex = utils_1.getLowestIndex(selectedLayers);
                            var destination = composition.layer(lowestIndex);
                            if (destination instanceof AVLayer && destination.hasTrackMatte) {
                                destination = composition.layer(lowestIndex - 1);
                            }
                            if (destination.index !== 1 && composition.layer(destination.index - 1) !== foundControllerLayer) {
                                foundControllerLayer.moveBefore(destination);
                            }
                        }
                    }
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/blend.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.test = exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayer = utils_1.getSelectedLayer(composition);
                utils_1.getSelectedPropertiesOnLayer(selectedLayer, 1);
            }
            exports.check = check;

            function run() {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Blend");
                utils_1.fast(function() {
                    var layerPropertyGetters = composition.selectedLayers.map(function(selectedLayer) {
                        return {
                            layer: selectedLayer,
                            propertyGetters: (utils_1.arrayFilter(selectedLayer.selectedProperties, function(p) {
                                return p instanceof Property;
                            }).map)(utils_1.propertyToGetter)
                        };
                    });
                    layerPropertyGetters.forEach(function(_a) {
                        var selectedLayer = _a.layer;
                        var propertyGetters = _a.propertyGetters;
                        propertyGetters.forEach(function(pg) {
                            var selectedProperty = pg(selectedLayer);
                            var presetName = "";
                            var parentName = "";
                            try {
                                var firstParent = selectedProperty.parentProperty;
                                parentMatchName = firstParent.matchName;
                                parentName = firstParent.name;
                                currentName = selectedProperty.name;
                            } catch (err) {

                            }
                            if (parentMatchName === "ADBE Transform Group") {
                                presetName = "Blend - " + currentName;
                            } else {
                                presetName = "Blend - " + parentName + " - " + currentName;
                            }
                            if (presetName.length > 30) {
                                presetName = presetName.substr(0, 30);
                            }
                            var smoothExp = "_smoothness = effect(\"" + ffxMap_1["default"].blend.pseudo + "\")(\"" + ffxMap_1["default"].blend.smoothness + "\") / 20;\n" + "_precision = effect(\"" + ffxMap_1["default"].blend.pseudo + "\")(\"" + ffxMap_1["default"].blend.precision + "\");\n" + "_enable = effect(\"" + ffxMap_1["default"].blend.pseudo + "\")(\"" + ffxMap_1["default"].blend.enable + "\");\n" + " \n" + "if (_enable == 1) {\n" + "\t\tsmooth(_smoothness, _precision);\n" + "} else {\n" + "\tvalue = value;\n" + "}";
                            if (selectedProperty.canSetExpression) {
                                selectedProperty.expression = smoothExp;
                            }
                            var effectPropertyGroup = selectedLayer.property("ADBE Effect Parade");
                            if (effectPropertyGroup.property(presetName) !== null) {
                                return;
                            }
                            var blendEffect = effectPropertyGroup.addProperty(ffxMap_1["default"].blend.pseudo);
                            blendEffect.name = presetName;
                            var smoothnessProperty = blendEffect.property(ffxMap_1["default"].blend.smoothness);
                            smoothnessProperty.setValue(4);
                            smoothnessProperty.expression = "clamp(value, 1.3, 100);";
                            var precisionProperty = blendEffect.property(ffxMap_1["default"].blend.precision);
                            precisionProperty.expression = "clamp(value, 1, 100);";
                            precisionProperty.setValue(25);
                            var enableProperty = blendEffect.property(ffxMap_1["default"].blend.enable);
                            enableProperty.setValue(1);
                        });
                    });
                }, composition.selectedLayers.length < 4);
                app.endUndoGroup();
            }
            exports.run = run;

            function test() {
                var composition = app.project.items.addComp("Blend Test", 500, 500, 1, 10, 30);
                composition.openInViewer();
                var solid1 = composition.layers.addSolid([0, 1, 0], "Solid 1", 200, 200, 1, 10);
                solid1.name = "Solid 1";
                solid1.position.selected = true;
                return run();
            }
            exports.test = test;
        },
        "./build/aeft/tools/break.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __values = this && this.__values || function(o) {
                    var s = typeof Symbol === "function" && Symbol.iterator;
                    var m = s && o[s];
                    var i = 0;
                    if (m) {
                        return m.call(o);
                    }
                    if (o && typeof o.length === "number") {
                        return {
                            next: function() {
                                if (o && i >= o.length) {
                                    o = void(0)
                                }
                                return {
                                    value: o && o[i++],
                                    done: !o
                                };
                            }
                        };
                    }
                    throw new TypeError((s ? "Object is not iterable." : "Symbol.iterator is not defined."))
                };
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                try {
                    for (var selectedLayers_1 = __values(selectedLayers), selectedLayers_1_1 = selectedLayers_1.next(); !selectedLayers_1_1.done; selectedLayers_1_1 = selectedLayers_1.next()) {
                        var selectedLayer = selectedLayers_1_1.value;
                        if (selectedLayer instanceof TextLayer) {
                            return;
                        }
                    }
                } catch (e_1_1) {
                    e_1 = {
                        error: e_1_1
                    };
                } finally {
                    try {
                        if (selectedLayers_1_1 && !selectedLayers_1_1.done && _a = selectedLayers_1["return"]) {
                            _a.call(selectedLayers_1)
                        }
                    } finally {
                        if (e_1) {
                            throw e_1.error
                        }
                    }
                }
                throw utils_1.WrappedError(new Error("No selected layer is text layer"), errors_1.NO_SELECTED_LAYER_IS_TEXT_LAYER)
            }
            exports.check = check;

            function run(breakType) {
                var originalComp = utils_1.getComposition();
                app.beginUndoGroup("Break");
                var currentCounts = {};
                var layers = utils_1.collectionToArray(originalComp.layers);
                layers.forEach(function(layer) {
                    var nameParts = layer.name.split(" ");
                    var name = layer.name;
                    if (nameParts.length > 1 && nameParts[nameParts.length - 1] === String(Number(nameParts[nameParts.length - 1]))) {
                        nameParts.pop();
                        var nameOnly = nameParts.join(" ");
                        currentCounts[nameOnly] = (currentCounts.hasOwnProperty(nameOnly) ? currentCounts[nameOnly] + 1 : 1);
                    } else {
                        currentCounts[name] = (currentCounts.hasOwnProperty(name) ? currentCounts[name] + 1 : 1);
                    }
                });
                originalComp.selectedLayers.forEach(function(layer) {
                    if (!(layer instanceof TextLayer)) {
                        layer.selected = false;
                    }
                });
                originalComp.selectedLayers.forEach(function(textLayer) {
                    if (!(textLayer instanceof TextLayer)) {
                        return;
                    }
                    var str = textLayer.text.sourceText.value.text;
                    var originalStr = str;
                    if (breakType === "letters") {
                        var textDocument = textLayer.text.sourceText.value;
                        textDocument.text = str;
                        textLayer.text.sourceText.setValue(textDocument);
                    }
                    app.executeCommand(3781);
                    utils_1.fast(function(composition) {
                        var layers = utils_1.collectionToArray(composition.layers);
                        layers.forEach(function(layer) {
                            if (layer instanceof ShapeLayer && layer.name.indexOf(textLayer.name) > -1) {
                                layer.enabled = false;
                                if (breakType === "letters") {
                                    var letters = str.replace(/ /g, "").replace(/\t/g, "").replace(/\r/g, "").replace(/\n/g, "").split("");
                                    letters.forEach(function(letter, i) {
                                        var copy = layer.duplicate();
                                        copy.selected = true;
                                        copy.enabled = true;
                                        if (!currentCounts.hasOwnProperty(letter)) {
                                            currentCounts[letter] = 0;
                                        }
                                        if (currentCounts[letter] > 0) {
                                            copy.name = "".concat(letter, " ").concat(currentCounts[letter]);
                                        } else {
                                            copy.name = letter;
                                        }
                                        currentCounts[letter] += 1;
                                        var vectors = copy.property("ADBE Root Vectors Group");
                                        for (var j = vectors.numProperties - 1; j >= 0; j--) {
                                            var vector = vectors.property(j + 1);
                                            if (j !== i) {
                                                vector.remove();
                                            }
                                        }
                                    });
                                } else {
                                    if (breakType === "words") {
                                        var words = str.split(/\s+/);
                                        var stringPos_1 = 0;
                                        words.forEach(function(word) {
                                            var copy = layer.duplicate();
                                            copy.enabled = true;
                                            copy.selected = true;
                                            copy.name = word;
                                            if (!currentCounts.hasOwnProperty(word)) {
                                                currentCounts[word] = 0;
                                            }
                                            if (currentCounts[word] > 0) {
                                                copy.name = "".concat(word, " ").concat(currentCounts[word]);
                                            } else {
                                                copy.name = word;
                                            }
                                            currentCounts[word] += 1;
                                            var vectors = copy.property("ADBE Root Vectors Group");
                                            for (var j = vectors.numProperties - 1; j >= 0; j--) {
                                                var vector = vectors.property(j + 1);
                                                if (j < stringPos_1 || j >= (stringPos_1 + word.length)) {
                                                    vector.remove();
                                                }
                                            }
                                            stringPos_1 += word.length;
                                        });
                                    }
                                }
                                layer.remove();
                            }
                        });
                    });
                    app.executeCommand(10312);
                    if (breakType === "letters") {
                        var textDocument = textLayer.text.sourceText.value;
                        textDocument.text = originalStr;
                        textLayer.text.sourceText.setValue(textDocument);
                    }
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/burst.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.test = exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run() {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Burst");
                var copies = 9;
                var burstOffset = 0;
                var distanceFromCenter = 250;
                var revolution = 360;
                var revolutionOffset = 0;
                var linkWidthAndHeight = false;
                var height = 60;
                var width = 20;
                var roundness = 30;
                var strokeWidth = 8;
                var fillEnabled = true;
                var fillColor = [0.976, 0.38, 0.709];
                var strokeEnabled = true;
                var strokeColor = [0.454, 0.733, 1];
                var sequenceLink = true;
                var sequenceWidth = 0;
                var sequenceHeight = 0;
                utils_1.fast(function() {
                    var shapeLayer = composition.layers.addShape();
                    shapeLayer.name = "Burst";
                    var rootVectorGroup = shapeLayer.property("ADBE Root Vectors Group");
                    var vectorGroup = rootVectorGroup.addProperty("ADBE Vector Group");
                    vectorGroup.name = "Rectangle 1";
                    var vectorsGroup = vectorGroup.addProperty("ADBE Vectors Group");
                    vectorsGroup.addProperty("ADBE Vector Shape - Rect");
                    vectorsGroup.addProperty("ADBE Vector Filter - Repeater");
                    vectorsGroup.addProperty("ADBE Vector Graphic - Stroke");
                    vectorsGroup.addProperty("ADBE Vector Graphic - Fill");
                    vectorsGroup.addProperty("ADBE Vector Filter - Wiggler");
                    vectorsGroup.property("ADBE Vector Shape - Rect").name = "Burst Piece 1";
                    vectorsGroup.property("ADBE Vector Filter - Repeater").name = "Repeater 1";
                    vectorsGroup.property("ADBE Vector Filter - Wiggler").name = "Wiggle Transform 1";
                    var effectPropertyGroup = shapeLayer.property("ADBE Effect Parade");
                    var effectProperty = effectPropertyGroup.addProperty(ffxMap_1["default"].burst.pseudo);
                    effectProperty.name = "Burst";
                    var copiesCountProperty = effectProperty.property(ffxMap_1["default"].burst.copiesCount);
                    copiesCountProperty.setValue(copies);
                    var copiesRevolutionProperty = effectProperty.property(ffxMap_1["default"].burst.copiesRevolution);
                    copiesRevolutionProperty.setValue(revolution);
                    var copiesRevolutionOffsetProperty = effectProperty.property(ffxMap_1["default"].burst.copiesRevolutionOffset);
                    copiesRevolutionOffsetProperty.setValue(revolutionOffset);
                    var copiesBurstOffsetProperty = effectProperty.property(ffxMap_1["default"].burst.copiesBurstOffset);
                    copiesBurstOffsetProperty.setValue(burstOffset);
                    var copiesDistanceFromCenterProperty = effectProperty.property(ffxMap_1["default"].burst.copiesDistanceFromCenter);
                    copiesDistanceFromCenterProperty.setValue(distanceFromCenter);
                    var linkWidthAndHeightProperty = effectProperty.property(ffxMap_1["default"].burst.linkWidthAndHeight);
                    linkWidthAndHeightProperty.setValue((linkWidthAndHeight ? 1 : 0));
                    var widthProperty = effectProperty.property(ffxMap_1["default"].burst.width);
                    widthProperty.setValue(width);
                    var heightProperty = effectProperty.property(ffxMap_1["default"].burst.height);
                    heightProperty.setValue(height);
                    var strokeWidthProperty = effectProperty.property(ffxMap_1["default"].burst.strokeWidth);
                    strokeWidthProperty.setValue(strokeWidth);
                    var fillEnabledProperty = effectProperty.property(ffxMap_1["default"].burst.colorFillEnable);
                    fillEnabledProperty.setValue((fillEnabled ? 1 : 0));
                    var fillColorProperty = effectProperty.property(ffxMap_1["default"].burst.colorFillColor);
                    fillColorProperty.setValue(fillColor);
                    var strokeEnabledProperty = effectProperty.property(ffxMap_1["default"].burst.colorStrokeEnable);
                    strokeEnabledProperty.setValue(strokeEnabled);
                    var strokeColorProperty = effectProperty.property(ffxMap_1["default"].burst.colorStrokeColor);
                    strokeColorProperty.setValue(strokeColor);
                    var roundnessProperty = effectProperty.property(ffxMap_1["default"].burst.roundness);
                    roundnessProperty.setValue(roundness);
                    var sequenceLinkProperty = effectProperty.property(ffxMap_1["default"].burst.sequenceLinkWidthAndHeight);
                    sequenceLinkProperty.setValue((sequenceLink ? 1 : 0));
                    var sequenceWidthProperty = effectProperty.property(ffxMap_1["default"].burst.sequenceWidth);
                    sequenceWidthProperty.setValue(sequenceWidth);
                    var sequenceHeightProperty = effectProperty.property(ffxMap_1["default"].burst.sequenceHeight);
                    sequenceHeightProperty.setValue(sequenceHeight);
                    var sizeExpr = "x = effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.width + "\");\n" + "y = effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.height + "\");\n" + "link = effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.linkWidthAndHeight + "\");\n" + " \n" + "if (link == 0) {\n" + "\t[x,y];\n" + "} else {\n" + "\t[x,x];\n" + "}";
                    var positionExpr = "[content(\"Rectangle 1\").content(\"Burst Piece 1\").position[1], effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.copiesDistanceFromCenter + "\")];\n";
                    var roundExpr = "effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.roundness + "\");\n";
                    var strokeColorExpr = "effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.colorStrokeColor + "\");\n";
                    var strokeVisibleExpr = "effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.colorStrokeEnable + "\") * 100;\n";
                    var strokeWidthExpr = "effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.strokeWidth + "\");\n";
                    var fillColorExpr = "effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.colorFillColor + "\");\n";
                    var fillVisibleExpr = "effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.colorFillEnable + "\") * 100;\n";
                    var repeaterCopiesExpr = "effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.copiesCount + "\");\n";
                    var repeaterOffsetExpr = "effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.copiesRevolutionOffset + "\");\n";
                    var repeaterRevolutionExpr = "try {\n\tcopies = effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.copiesCount + "\");\n" + "\tdivision = effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.copiesRevolution + "\");\n" + "\tdivision / copies + (content(\"Rectangle 1\")\n" + "\t\t.content(\"Repeater 1\")\n" + "\t\t.offset);\n" + "} catch(e$$4) {\n" + "\tvalue;\n" + "}\n";
                    var globalPosExpr = "effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.globalPosition + "\");\n";
                    var zeroWiggle = "0";
                    var accentPositionOffsetExpr = "[content(\"Rectangle 1\").content(\"Wiggle Transform 1\").transform.position[1], effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.copiesBurstOffset + "\")];\n";
                    var sliderZeroLockExpr = "_copies = value;\nif (_copies < 0){\n_copies = 0;\n}\n_copies;";
                    var roundZeroLockExpr = "_roundness = value;\nif (_roundness < 0) {\n\t_roundness = 0;\n}\n_roundness;";
                    var widthZeroLockExpr = "_width = value;\nif (_width < 0) {\n\t_width = 0;\n}\n_width;";
                    var heightZeroLockExpr = "_height = value;\nif (_height < 0) {\n\t_height = 0;\n}\n_height;";
                    var seqSizeExpr = "x = 100 + effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.sequenceWidth + "\");\n" + "y = 100 + effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.sequenceHeight + "\");\n" + "link = effect(\"" + ffxMap_1["default"].burst.pseudo + "\")(\"" + ffxMap_1["default"].burst.sequenceLinkWidthAndHeight + "\");\n" + " \n" + "if (link == 0) {\n" + "\t[x,y];\n" + "} else {\n" + "\t[x,x];\n" + "}";
                    vectorsGroup.property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size").expression = sizeExpr;
                    vectorsGroup.property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Position").expression = positionExpr;
                    vectorsGroup.property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Roundness").expression = roundExpr;
                    vectorsGroup.property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Color").expression = strokeColorExpr;
                    vectorsGroup.property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Opacity").expression = strokeVisibleExpr;
                    vectorsGroup.property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Width").expression = strokeWidthExpr;
                    vectorsGroup.property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").expression = fillColorExpr;
                    vectorsGroup.property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Opacity").expression = fillVisibleExpr;
                    vectorsGroup.property("ADBE Vector Filter - Repeater").property("ADBE Vector Repeater Copies").expression = repeaterCopiesExpr;
                    vectorsGroup.property("ADBE Vector Filter - Wiggler").property("ADBE Vector Wiggler Transform").property("ADBE Vector Wiggler Rotation").expression = repeaterOffsetExpr;
                    vectorsGroup.property("ADBE Vector Filter - Repeater").property("ADBE Vector Repeater Transform").property("ADBE Vector Repeater Rotation").expression = repeaterRevolutionExpr;
                    shapeLayer.property("ADBE Transform Group").property("ADBE Position").expression = globalPosExpr;
                    vectorsGroup.property("ADBE Vector Filter - Wiggler").property("ADBE Vector Xform Temporal Freq").expression = zeroWiggle;
                    vectorsGroup.property("ADBE Vector Filter - Wiggler").property("ADBE Vector Wiggler Transform").property("ADBE Vector Wiggler Position").expression = accentPositionOffsetExpr;
                    shapeLayer.property("ADBE Effect Parade").property(ffxMap_1["default"].burst.pseudo).property(ffxMap_1["default"].burst.copiesCount).expression = sliderZeroLockExpr;
                    shapeLayer.property("ADBE Effect Parade").property(ffxMap_1["default"].burst.pseudo).property(ffxMap_1["default"].burst.roundness).expression = roundZeroLockExpr;
                    shapeLayer.property("ADBE Effect Parade").property(ffxMap_1["default"].burst.pseudo).property(ffxMap_1["default"].burst.width).expression = widthZeroLockExpr;
                    shapeLayer.property("ADBE Effect Parade").property(ffxMap_1["default"].burst.pseudo).property(ffxMap_1["default"].burst.height).expression = heightZeroLockExpr;
                    vectorsGroup.property("ADBE Vector Filter - Repeater").property("ADBE Vector Repeater Transform").property("ADBE Vector Repeater Scale").expression = seqSizeExpr;
                });
                app.endUndoGroup();
                return JSON.stringify({
                    success: true
                });
            }
            exports.run = run;

            function test() {
                var composition = app.project.items.addComp("Burst Test", 500, 500, 1, 10, 30);
                composition.openInViewer();
                var solid1 = composition.layers.addSolid([0, 1, 0], "Solid 1", 200, 200, 1, 10);
                solid1.name = "Solid 1";
                return run();
            }
            exports.test = test;
        },
        "./build/aeft/tools/clone.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __read = this && this.__read || function(o, n) {
                    var m = typeof Symbol === "function" && o[Symbol.iterator];
                    if (!m) {
                        return o;
                    }
                    var i = m.call(o);
                    var ar = [];
                    try {
                        while (n === void(0) || n-- > 0 && !(r = i.next()).done) {
                            ar.push(r.value)
                        }
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            if (r && !r.done && m = i["return"]) {
                                m.call(i)
                            }
                        } finally {
                            if (e) {
                                throw e.error
                            }
                        }
                    }
                    return ar;
                };
            var __spreadArray = this && this.__spreadArray || function(to, from, pack) {
                    if (pack || arguments.length === 2) {
                        for (var i = 0, l = from.length, ar; i < l; i++) {
                            if (ar || !(i in from)) {
                                if (!ar) {
                                    ar = Array.prototype.slice.call(from, 0, i)
                                }
                                ar[i] = from[i];
                            }
                        }
                    }
                    return to.concat(ar || Array.prototype.slice.call(from));
                };
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayers(composition, 1);
                for (var j = 0; j < composition.selectedProperties.length; j += 1) {
                    var selectedProperty = composition.selectedProperties[j];
                    if (selectedProperty instanceof PropertyGroup) {
                        continue;
                    }
                    if (selectedProperty.canVaryOverTime && selectedProperty.numKeys > 0) {
                        return;
                    }
                }
                throw utils_1.WrappedError(new Error("No keyframes are selected"), errors_1.NOT_ENOUGH_SELECTED_KEYFRAMES)
            }
            exports.check = check;

            function run(cloneType) {
                if (cloneType === void(0)) {
                    cloneType = "REGULAR";
                }
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition);
                app.beginUndoGroup("Clone");
                var currentTime = composition.time;
                var selectedProperties = composition.selectedProperties;
                var unsettableProps = [];
                var maskBezier = false;
                var earliestTime = utils_1.getEarliestTime(composition);
                var newKeys = [];
                var timeArray = [];
                var selectedPropertiesWithKeyframes = {};
                for (var j = 0; j < selectedProperties.length; j += 1) {
                    var selectedProperty = selectedProperties[j];
                    var parentLayer = selectedProperty.propertyGroup(selectedProperty.propertyDepth);
                    if (selectedProperty instanceof PropertyGroup) {
                        continue;
                    }
                    if (selectedProperty.canVaryOverTime && selectedProperty.numKeys > 0) {
                        if (selectedPropertiesWithKeyframes[parentLayer.name]) {
                            (selectedPropertiesWithKeyframes[parentLayer.name]).push(selectedProperty);
                        } else {
                            selectedPropertiesWithKeyframes[parentLayer.name] = [selectedProperty];
                        }
                    }
                }
                selectedLayers.forEach(function(layer) {
                    (selectedPropertiesWithKeyframes[layer.name]).forEach(function(property) {
                        if (!(property instanceof Property)) {
                            return;
                        }
                        if (property.propertyValueType === PropertyValueType.CUSTOM_VALUE) {
                            return unsettableProps[unsettableProps.length] = property;
                        }
                        var newKeyframes = [];
                        var lastKeyframes = [];
                        property.selectedKeys.forEach(function(key) {
                            var selectedValues = property.keyValue(key);
                            var selectedTime = property.keyTime(key);
                            var timeOffset = 0;
                            if (property.propertyValueType == PropertyValueType.SHAPE && property.parentProperty instanceof MaskPropertyGroup) {
                                maskBezier = property.parentProperty.rotoBezier;
                                if (maskBezier) {
                                    property.parentProperty.rotoBezier = false;
                                }
                            }
                            if (earliestTime !== undefined) {
                                timeOffset = selectedTime - earliestTime;
                            }
                            var newTime = currentTime + timeOffset;
                            var keyOutInterpolationType = property.keyOutInterpolationType(key);
                            var keyTemporalContinuous = property.keyTemporalContinuous(key);
                            var keyTemporalAutoBezier = property.keyTemporalAutoBezier(key);
                            timeArray.push(newTime);
                            if (keyOutInterpolationType === KeyframeInterpolationType.BEZIER && keyTemporalContinuous && keyTemporalAutoBezier) {
                                lastKeyframes.push([newTime, selectedValues, utils_1.getKeyframeProperties(property, key)]);
                            } else {
                                newKeyframes.push([newTime, selectedValues, utils_1.getKeyframeProperties(property, key)]);
                            }
                        });
                        newKeyframes.forEach(function(_a, i) {
                            var _b = __read(_a, 1);
                            var _ = _b[0];
                            var newKey = property.addKey((newKeyframes[i])[0]);
                            property.setValueAtKey(newKey, (newKeyframes[i])[1]);
                            if (property.propertyValueType == PropertyValueType.SHAPE) {
                                if (maskBezier) {
                                    property.parentProperty.rotoBezier = true;
                                }
                            }
                            utils_1.setKeyframeProperties(property, (newKeyframes[i])[2], newKey);
                            newKeys.push([layer, property, (newKeyframes[i])[0], (newKeyframes[i])[1]]);
                        });
                        lastKeyframes.forEach(function(_a, i) {
                            var _b = __read(_a, 1);
                            var _ = _b[0];
                            var newKey = property.addKey((lastKeyframes[i])[0]);
                            property.setValueAtKey(newKey, (lastKeyframes[i])[1]);
                            if (property.propertyValueType == PropertyValueType.SHAPE) {
                                if (maskBezier) {
                                    property.parentProperty.rotoBezier = true;
                                }
                            }
                            utils_1.setKeyframeProperties(property, (lastKeyframes[i])[2], newKey);
                            newKeys.push([layer, property, (lastKeyframes[i])[0], (lastKeyframes[i])[1]]);
                        });
                    });
                });
                if (cloneType === "INVERSE" || cloneType === "MIRROR") {
                    var originalSelection_1 = [];
                    var startArea_1 = Math.min.apply(Math, __spreadArray([], __read(timeArray), false));
                    var endArea_1 = Math.max.apply(Math, __spreadArray([], __read(timeArray), false));
                    var tempKeys_1 = {};
                    var keyIndexRange_1 = {};
                    selectedLayers.forEach(function(layer) {
                        (selectedPropertiesWithKeyframes[layer.name]).forEach(function(property) {
                            if (!(property instanceof Property)) {
                                return;
                            }
                            originalSelection_1.push([property, property.selectedKeys.map(function(keyIndex) {
                                return property.keyTime(keyIndex);
                            })]);
                            property.selectedKeys.forEach(function(keyIndex) {
                                property.setSelectedAtKey(keyIndex, false);
                            });
                        });
                    });
                    if (cloneType === "MIRROR") {
                        selectedLayers.forEach(function(layer) {
                            tempKeys_1[layer.name] = {};
                            keyIndexRange_1[layer.name] = {};
                        });
                        newKeys.forEach(function(_a) {
                            var _b = __read(_a, 2);
                            var layer = _b[0];
                            var property = _b[1];
                            tempKeys_1[layer.name][property.name] = [true, true];
                            keyIndexRange_1[layer.name][property.name] = [Infinity, -Infinity];
                        });
                        newKeys.forEach(function(_a) {
                            var _b = __read(_a, 3);
                            var layer = _b[0];
                            var property = _b[1];
                            var keyTime = _b[2];
                            if (keyTime === startArea_1) {
                                (tempKeys_1[layer.name][property.name])[0] = false;
                            }
                            if (keyTime === endArea_1) {
                                (tempKeys_1[layer.name][property.name])[1] = false;
                            }
                        });
                        selectedLayers.forEach(function(layer) {
                            (selectedPropertiesWithKeyframes[layer.name]).forEach(function(property) {
                                if (!(property instanceof Property)) {
                                    return;
                                }
                                if ((tempKeys_1[layer.name][property.name])[0]) {
                                    property.addKey(startArea_1);
                                    newKeys.push([layer, property, startArea_1, 0]);
                                }
                                if ((tempKeys_1[layer.name][property.name])[1]) {
                                    property.addKey(endArea_1);
                                    newKeys.push([layer, property, endArea_1, 0]);
                                }
                            });
                        });
                    }
                    newKeys.forEach(function(_a) {
                        var _b = __read(_a, 3);
                        var _ = _b[0];
                        var property = _b[1];
                        var keyTime = _b[2];
                        var keyIndex = property.nearestKeyIndex(keyTime);
                        property.setSelectedAtKey(keyIndex, true);
                    });
                    app.executeCommand(3693);
                    if (cloneType === "MIRROR") {
                        newKeys.forEach(function(_a) {
                            var _b = __read(_a, 3);
                            var layer = _b[0];
                            var property = _b[1];
                            var keyTime = _b[2];
                            var keyIndex = property.nearestKeyIndex(keyTime);
                            if (keyIndex < (keyIndexRange_1[layer.name][property.name])[0]) {
                                (keyIndexRange_1[layer.name][property.name])[0] = keyIndex;
                            }
                            if (keyIndex > (keyIndexRange_1[layer.name][property.name])[1]) {
                                (keyIndexRange_1[layer.name][property.name])[1] = keyIndex;
                            }
                        });
                        selectedLayers.forEach(function(layer) {
                            (selectedPropertiesWithKeyframes[layer.name]).forEach(function(property) {
                                if (!(property instanceof Property)) {
                                    return;
                                }
                                if ((tempKeys_1[layer.name][property.name])[0]) {
                                    property.removeKey((keyIndexRange_1[layer.name][property.name])[1]);
                                }
                                if ((tempKeys_1[layer.name][property.name])[1]) {
                                    property.removeKey((keyIndexRange_1[layer.name][property.name])[0]);
                                }
                            });
                        });
                    }
                }
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/cloth.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var delay_1 = __webpack_require__("./build/aeft/tools/delay.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var errors_1 = __webpack_require__("./build/aeft/errors.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                if (!selectedLayers[0].property("ADBE Effect Parade").property("ADBE FreePin3")) {
                    throw utils_1.WrappedError(new Error("No puppet pins found"), errors_1.NO_PUPPET_PINS_FOUND)
                }
                return {
                    composition: composition,
                    selectedLayers: selectedLayers
                };
            }
            exports.check = check;

            function run(name, keyframesEnabled, compositionEnabled, shyEnabled) {
                var _a = check();
                var composition = _a.composition;
                var selectedLayers = _a.selectedLayers;
                utils_1.loadEffects();
                app.beginUndoGroup("Motion - Cloth");
                var mainLayer = selectedLayers[0];
                utils_1.fast(function() {
                    utils_1.restoreSelectionAfter(function() {
                        clothController = composition.layers.addNull();
                        clothController.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([50, 50]);
                        clothController.moveBefore(mainLayer);
                    });
                    var prefix = "[c-c]" + name;
                    var clothControllerName = utils_1.getUniqueNameFromLayers(composition.layers, prefix);
                    clothController.name = clothControllerName;
                    clothController.property("ADBE Transform Group").property("ADBE Position").expression = getParentLayerPositionExpression(compositionEnabled, composition.name, clothControllerName);
                    var preCompositionName = "".concat(clothControllerName, " - children");
                    var meshes = mainLayer.property("ADBE Effect Parade").property("ADBE FreePin3").property("ADBE FreePin3 ARAP Group").property("ADBE FreePin3 Mesh Group");
                    var bones = [];
                    for (var i = 1; i <= meshes.numProperties; i += 1) {
                        var createBone = createBoner(composition, mainLayer, clothControllerName, preCompositionName, compositionEnabled);
                        var pins = meshes.property(i).property("ADBE FreePin3 PosPins");
                        for (var j = 1; j <= pins.numProperties; j += 1) {
                            while (pins.property(j).property("ADBE FreePin3 PosPin Position").numKeys !== 0) {
                                pins.property(j).property("ADBE FreePin3 PosPin Position").removeKey(1);
                            }
                            var bone = createBone(pins.property(j));
                            if (bones[j]) {
                                bone.moveAfter(bones[j]);
                            } else {
                                bone.moveAfter(clothController);
                            }
                            bone.selected = false;
                            bones.push(bone);
                        }
                        var lastBone = bones[bones.length - 1];
                        clothController.property("ADBE Transform Group").property("ADBE Position").setValue(lastBone.property("ADBE Transform Group").property("ADBE Position").value);
                        var positionProperties = [lastBone.property("ADBE Transform Group").property("ADBE Position")];
                        delay_1.addDelay(clothController, bones, positionProperties, false, shyEnabled, compositionEnabled, true, true);
                    }
                    if (keyframesEnabled) {
                        clothController.property("ADBE Transform Group").property("ADBE Position").setValueAtTime(composition.time, clothController.property("ADBE Transform Group").property("ADBE Position").value);
                    }
                    var opacityExpression = getOpacityExpression(compositionEnabled, composition.name, clothController.name);
                    mainLayer.property("ADBE Transform Group").property("ADBE Opacity").expression = opacityExpression;
                    clothController.guideLayer = true;
                    clothController.label = 2;
                    clothController.property("ADBE Transform Group").property("ADBE Position").selected = true;
                    mainLayer.locked = true;
                    if (compositionEnabled) {
                        var childLayerIndexes = bones.map(function(layer) {
                            return layer.index;
                        });
                        childLayerIndexes.push(mainLayer.index);
                        composition.layers.precompose(childLayerIndexes, preCompositionName, true);
                        utils_1.collectionToArray(composition.layers).forEach(function(layer) {
                            if (layer.name === clothControllerName) {
                                layer.selected = true;
                                layer.property("ADBE Transform Group").property("ADBE Position").selected = true;
                            }
                            if (layer instanceof AVLayer && layer.source instanceof CompItem && layer.name.indexOf("[c-c]") > -1) {
                                layer.selected = false;
                                if (shyEnabled) {
                                    layer.shy = true;
                                }
                                layer.moveAfter(clothController);
                            }
                        });
                    }
                    if (shyEnabled) {
                        composition.hideShyLayers = true;
                    }
                });
                app.endUndoGroup();
            }
            exports.run = run;

            function createBoner(composition, mainLayer, clothControllerName, preCompositionName, compositionEnabled) {
                var pinSizeExp = getPinSizeExpression(composition.name, clothControllerName, compositionEnabled).split("\n").join("\\n' +\n'");
                var pinColorExp = getPinColorExpression(composition.name, clothControllerName, compositionEnabled).split("\n").join("\\n' +\n'");
                var pinVisExp = getPinVisibleExpression(composition.name, clothControllerName, compositionEnabled).split("\n").join("\\n' +\n'");
                var fn = utils_1.genfun("function createBone(pin) {");
                fn("var bone = composition.layers.addShape();\nvar circle = bone.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group');\nvar ellipse = circle.property('ADBE Vectors Group').addProperty('ADBE Vector Shape - Ellipse');\nellipse.property('ADBE Vector Ellipse Size').setValue([10, 10]);\ncircle.property('ADBE Vectors Group').addProperty('ADBE Vector Graphic - Fill');\ncircle.name = 'Circle';\ncircle.property(\"ADBE Vectors Group\").property(\"ADBE Vector Shape - Ellipse\").property(\"ADBE Vector Ellipse Size\").expression = '".concat(pinSizeExp, "';\ncircle.property(\"ADBE Vectors Group\").property(\"ADBE Vector Graphic - Fill\").property(\"ADBE Vector Fill Color\").expression = '").concat(pinColorExp, "';\nbone.label = 16;\nvar filet = pin.propertyGroup().propertyGroup();\nvar marionnette = filet.propertyGroup().propertyGroup().propertyGroup();\nbone.transform.opacity.expression = '").concat(pinVisExp, "';\nif (!(mainLayer instanceof ShapeLayer)) {\n  const pinPosition = pin.position.value\n  const mainLayerPosition = mainLayer.position.value\n  const anchorPoint = mainLayer.anchorPoint.value\n  const calculatedPosition = [\n    pinPosition[0] + (mainLayerPosition[0] - anchorPoint[0]),\n    pinPosition[1] + (mainLayerPosition[1] - anchorPoint[1])\n  ]\n  bone.transform.position.setValue(calculatedPosition);\n} else {\n  bone.transform.position.setValue(pin.position.value);\n}\nbone.name = mainLayer.name + ' ' + pin.name.replace('Puppet Pin', '- control');\n// bone.selected = true;\npin.position.expression = getPinPositionExpression(preCompositionName, mainLayer, bone, compositionEnabled);\nreturn bone;"));
                fn("}");
                return fn.toFunction({
                    composition: composition,
                    mainLayer: mainLayer,
                    preCompositionName: preCompositionName,
                    getPinPositionExpression: getPinPositionExpression,
                    compositionEnabled: compositionEnabled
                });
            }

            function minifier(code, map) {
                Object.keys(map).forEach(function(key) {
                    code = code.replace(new RegExp(key, "g"), map[key]);
                });
                var lines = code.split("\n").map(function(line) {
                    return line.trim();
                });
                var firstLine = lines.shift();
                return "".concat(firstLine, "\n").concat(lines.join(""));
            }

            function getPinSizeExpression(compositionName, clothControllerName, compositionEnabled) {
                var layerAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(compositionName), ").layer(").concat(JSON.stringify(clothControllerName), ")") : "thisComp.layer(".concat(JSON.stringify(clothControllerName), ")"));
                return "// Mt. Mograph - Cloth (Pin Size Expression)\nsliderValue = ".concat(layerAccessor, "(\"ADBE Effect Parade\")(\"").concat(delay_1.DELAY_PARENT_EFFECT_NAME, "\")(\"Pseudo/WO6fbd0b07I7W-0019\");\n[sliderValue, sliderValue];");
            }

            function getPinColorExpression(compositionName, clothControllerName, compositionEnabled) {
                var layerAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(compositionName), ").layer(").concat(JSON.stringify(clothControllerName), ")") : "thisComp.layer(".concat(JSON.stringify(clothControllerName), ")"));
                return "".concat(layerAccessor, "(\"ADBE Effect Parade\")(\"").concat(delay_1.DELAY_PARENT_EFFECT_NAME, "\")(\"Pseudo/WO6fbd0b07I7W-0018\");");
            }

            function getParentLayerPositionExpression(compositionEnabled, compositionName, clothControllerName) {
                var layerAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(compositionName), ").layer(").concat(JSON.stringify(clothControllerName), ")") : "thisComp.layer(".concat(JSON.stringify(clothControllerName), ")"));
                return minifier("// Mt. Mograph - Cloth (Parent Position)\nvar clothLayer = ".concat(layerAccessor, ";\nvar effectProperty = clothLayer(\"ADBE Effect Parade\")(\"Pseudo/WO6fbd0b07I7W\");\nvar enableOffset = effectProperty(\"Pseudo/WO6fbd0b07I7W-0022\");\nvar clothParent = effectProperty(\"Pseudo/WO6fbd0b07I7W-0023\");\nvar offsetAmount = effectProperty(\"Pseudo/WO6fbd0b07I7W-0024\");\nvar thisParade = thisLayer(\"ADBE Effect Parade\");\nvar dynEnable = thisParade(\"Pseudo/cgcebdb4a0V7C\")(\"Pseudo/cgcebdb4a0V7C-0016\");\nvar dynFreq = thisParade(\"Pseudo/cgcebdb4a0V7C\")(\"Pseudo/cgcebdb4a0V7C-0017\");\nvar dynAmount = thisParade(\"Pseudo/cgcebdb4a0V7C\")(\"Pseudo/cgcebdb4a0V7C-0018\");\nvar dynOffset = value;\nif (dynEnable > 0) {\nseedRandom(time * dynFreq);\ndynOffset = wiggle(0, dynAmount);\n}\nif (enableOffset > 0) {\nvar anchorPoint2 = clothParent(\"ADBE Transform Group\")(\"ADBE Anchor Point\");\n(value - dynOffset) + clothParent.toWorld(anchorPoint2) + offsetAmount;\n} else {\ndynOffset;\n}"), {
                    clothLayer: "a",
                    effectProperty: "b",
                    enableOffset: "c",
                    clothParent: "d",
                    offsetAmount: "e",
                    anchorPoint2: "f",
                    thisParade: "g",
                    dynEnable: "h",
                    dynFreq: "i",
                    dynAmount: "j",
                    dynOffset: "k"
                });
            }

            function getOpacityExpression(compositionEnabled, compositionName, clothControllerName) {
                var layerAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(compositionName), ").layer(").concat(JSON.stringify(clothControllerName), ")") : "thisComp.layer(".concat(JSON.stringify(clothControllerName), ")"));
                return minifier("// Mt. Mograph - Cloth (Visibility)\nvar controllerLayer = ".concat(layerAccessor, ";\nglobalEffect = controllerLayer(\"ADBE Effect Parade\")(\"Pseudo/WO6fbd0b07I7W\");\nenableHide = globalEffect(\"Pseudo/WO6fbd0b07I7W-0027\");\nif (enableHide < 1) {\n0;\n} else {\nvalue;\n}"), {
                    controllerLayer: "a",
                    globalEffect: "b",
                    enableHide: "c"
                });
            }

            function getPinVisibleExpression(compositionName, clothControllerName, compositionEnabled) {
                var layerAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(compositionName), ").layer(").concat(JSON.stringify(clothControllerName), ")") : "thisComp.layer(".concat(JSON.stringify(clothControllerName), ")"));
                return minifier((("// Mt. Mograph - Cloth (Pin Visible Expression)\ntry {\n  child_visible = ".concat)(layerAccessor, "(\"ADBE Effect Parade\")(\"").concat)(delay_1.DELAY_PARENT_EFFECT_NAME, "\")(\"Pseudo/WO6fbd0b07I7W-0017\");\n  if (child_visible == 1) {\n    value;\n  } else {\n    0;\n  }\n} catch (err) {\n  value;\n}"), {
                    child_visible: "a"
                });
            }

            function getPinPositionExpression(compositionName, mainLayer, bone, compositionEnabled) {
                var boneAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(compositionName), ").layer(").concat(JSON.stringify(bone.name), ")") : "thisComp.layer(".concat(JSON.stringify(bone.name), ")"));
                if (mainLayer instanceof ShapeLayer) {
                    return "bonePos = ".concat(boneAccessor, ".position");
                }
                var mainLayerAcessor = "thisComp.layer(".concat(JSON.stringify(mainLayer.name), ")");
                return minifier("var bone = ".concat(boneAccessor, ";\nvar mainLayer = ").concat(mainLayerAcessor, ";\nvar bonePosition = bone.position.value;\nvar mainLayerPosition = mainLayer.position.value;\nvar anchorPointValue = mainLayer.anchorPoint.value;\nbonePos = [\n  anchorPointValue[0] - mainLayerPosition[0] + bonePosition[0],\n  anchorPointValue[1] - mainLayerPosition[1] + bonePosition[1]\n];"), {
                    mainLayer: "a",
                    bonePosition: "b",
                    mainLayerPosition: "c",
                    anchorPointValue: "d"
                });
            }
        },
        "./build/aeft/tools/color.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __read = this && this.__read || function(o, n) {
                    var m = typeof Symbol === "function" && o[Symbol.iterator];
                    if (!m) {
                        return o;
                    }
                    var i = m.call(o);
                    var ar = [];
                    try {
                        while (n === void(0) || n-- > 0 && !(r = i.next()).done) {
                            ar.push(r.value)
                        }
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            if (r && !r.done && m = i["return"]) {
                                m.call(i)
                            }
                        } finally {
                            if (e) {
                                throw e.error
                            }
                        }
                    }
                    return ar;
                };
            var __spreadArray = this && this.__spreadArray || function(to, from, pack) {
                    if (pack || arguments.length === 2) {
                        for (var i = 0, l = from.length, ar; i < l; i++) {
                            if (ar || !(i in from)) {
                                if (!ar) {
                                    ar = Array.prototype.slice.call(from, 0, i)
                                }
                                ar[i] = from[i];
                            }
                        }
                    }
                    return to.concat(ar || Array.prototype.slice.call(from));
                };
            var __values = this && this.__values || function(o) {
                    var s = typeof Symbol === "function" && Symbol.iterator;
                    var m = s && o[s];
                    var i = 0;
                    if (m) {
                        return m.call(o);
                    }
                    if (o && typeof o.length === "number") {
                        return {
                            next: function() {
                                if (o && i >= o.length) {
                                    o = void(0)
                                }
                                return {
                                    value: o && o[i++],
                                    done: !o
                                };
                            }
                        };
                    }
                    throw new TypeError((s ? "Object is not iterable." : "Symbol.iterator is not defined."))
                };
            exports.__esModule = true;
            exports.addStrokePropToVectorGroup = exports.findProperties = exports.setStrokeColorOnLayer = exports.setFillColorOnLayer = exports.findPropertyWithColors = exports.poll = exports.runColor = exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(color, fillOrStroke, onlySelected) {
                if (onlySelected === void(0)) {
                    onlySelected = false;
                }
                app.beginUndoGroup("Motion 4 - Color");
                runColor(color, fillOrStroke, onlySelected);
                app.endUndoGroup();
            }
            exports.run = run;

            function runColor(color, fillOrStroke, onlySelected) {
                if (onlySelected === void(0)) {
                    onlySelected = false;
                }
                var composition = utils_1.getComposition();
                if (composition.selectedLayers.length > 0) {
                    composition.selectedLayers.forEach(function(layer) {
                        if (fillOrStroke === "fill") {
                            setFillColorOnLayer(layer, color, onlySelected);
                        } else if (fillOrStroke === "stroke") {
                            setStrokeColorOnLayer(layer, color, onlySelected);
                        } else {
                            throw new Error("Invalid fillOrStroke option given, can only be \"fill\" or \"stroke\".")
                        }
                    });
                } else {
                    if (app.activeViewer && app.activeViewer.views[0]) {
                        app.activeViewer.views[0].options.checkerboards = false;
                    }
                    composition.bgColor = [color[0], color[1], color[2]];
                }
            }
            exports.runColor = runColor;

            function poll() {
                var composition = utils_1.getComposition();
                if (composition.selectedLayers.length === 0) {
                    return {
                        fill: __spreadArray(__spreadArray([], __read(composition.bgColor), false), [1], false),
                        fillEnabled: true,
                        strokeEnabled: false,
                        canHaveStroke: false,
                        canSwap: false
                    };
                } else {
                    try {
                        for (var _b = __values(composition.selectedLayers), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var layer = _c.value;
                            if (layer instanceof ShapeLayer) {
                                var propWithColors = findPropertyWithColors(layer.property("ADBE Root Vectors Group"));
                                if (propWithColors) {
                                    var fill = null;
                                    var stroke = null;
                                    var strokeEnabled = true;
                                    var fillEnabled = true;
                                    var strokeWidth = 0;
                                    var fillProp = propWithColors.property("ADBE Vector Graphic - Fill");
                                    if (fillProp) {
                                        var fillValue = fillProp.property("ADBE Vector Fill Color").value;
                                        var opacity = findFirstProperty(layer.property("ADBE Root Vectors Group"), "ADBE Vector Fill Opacity").value;
                                        fill = [fillValue[0], fillValue[1], fillValue[2], opacity / 100];
                                        fillEnabled = fillProp.enabled;
                                    }
                                    var strokeProp = propWithColors.property("ADBE Vector Graphic - Stroke");
                                    if (strokeProp) {
                                        var strokeValue = strokeProp.property("ADBE Vector Stroke Color").value;
                                        strokeEnabled = strokeProp.enabled;
                                        strokeWidth = strokeProp.property("ADBE Vector Stroke Width").value;
                                        var opacity = strokeProp.property("ADBE Vector Stroke Opacity").value;
                                        stroke = [strokeValue[0], strokeValue[1], strokeValue[2], opacity / 100];
                                    }
                                    return {
                                        fill: fill,
                                        stroke: stroke,
                                        strokeEnabled: strokeEnabled,
                                        canHaveStroke: true,
                                        fillEnabled: fillEnabled,
                                        strokeWidth: strokeWidth,
                                        canSwap: true
                                    };
                                }
                            } else if (layer instanceof TextLayer && app.project.toolType && app.project.toolType !== ToolType.Tool_TextH && app.project.toolType !== ToolType.Tool_TextV) {
                                var fill = null;
                                var stroke = null;
                                var strokeEnabled = true;
                                var fillEnabled = true;
                                var strokeWidth = 0;
                                var textDocument = layer.property("ADBE Text Properties").property("ADBE Text Document").value;
                                var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity").value;
                                fillEnabled = textDocument.applyFill;
                                strokeEnabled = textDocument.applyStroke;
                                try {
                                    var fillValue = textDocument.fillColor;
                                    fill = [fillValue[0], fillValue[1], fillValue[2], opacity / 100];
                                } catch (err) {
                                    fill = [1, 1, 1, 1];
                                }
                                try {
                                    var strokeValue = textDocument.strokeColor;
                                    strokeWidth = textDocument.strokeWidth;
                                    stroke = [strokeValue[0], strokeValue[1], strokeValue[2], opacity / 100];
                                } catch (err) {
                                    stroke = [1, 1, 1, 1];
                                }
                                return {
                                    fill: fill,
                                    stroke: stroke,
                                    strokeEnabled: strokeEnabled,
                                    canHaveStroke: true,
                                    fillEnabled: fillEnabled,
                                    strokeWidth: strokeWidth,
                                    canSwap: true
                                };
                            } else if (layer instanceof AVLayer && layer.source.mainSource instanceof SolidSource && !layer.nullLayer) {
                                var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity").value;
                                var fillValue = layer.source.mainSource.color;
                                return {
                                    fill: [fillValue[0], fillValue[1], fillValue[2], opacity / 100],
                                    fillEnabled: true
                                };
                            } else {
                                if (layer instanceof AVLayer && layer.property("ADBE Effect Parade").property("ADBE Fill")) {
                                    var fillValue = layer.property("ADBE Effect Parade").property("ADBE Fill").property("ADBE Fill-0002").value;
                                    return {
                                        fill: [fillValue[0], fillValue[1], fillValue[2], 1],
                                        fillEnabled: true
                                    };
                                }
                            }
                        }
                    } catch (e_1_1) {
                        e_1 = {
                            error: e_1_1
                        };
                    } finally {
                        try {
                            if (_c && !_c.done && _a = _b["return"]) {
                                _a.call(_b)
                            }
                        } finally {
                            if (e_1) {
                                throw e_1.error
                            }
                        }
                    }
                }
            }
            exports.poll = poll;

            function findFirstProperty(layerOrPropertyGroup, matchName) {
                for (var i = 1; i <= layerOrPropertyGroup.numProperties; i += 1) {
                    var propertyGroup = layerOrPropertyGroup.property(i);
                    if (propertyGroup instanceof Property) {
                        if (propertyGroup.matchName === matchName) {
                            return propertyGroup;
                        }
                    }
                    if (propertyGroup instanceof PropertyGroup) {
                        var findInChildren = findFirstProperty(propertyGroup, matchName);
                        if (findInChildren !== null) {
                            return findInChildren;
                        }
                    }
                }
                return null;
            }

            function findPropertyWithColors(propertyGroup) {
                var search = propertyGroup;
                var selectedProperties = [];
                for (var i = propertyGroup.numProperties; i > 0; i--) {
                    var property = propertyGroup.property(i);
                    if (property.selected === true) {
                        selectedProperties.push(property);
                    }
                }
                if (selectedProperties.length > 0) {
                    search = selectedProperties[0];
                }
                while (search.property("ADBE Vector Group") || search.property("ADBE Vectors Group")) {
                    var newSearch = void(0);
                    if (search.property("ADBE Vectors Group")) {
                        newSearch = search.property("ADBE Vectors Group");
                    } else {
                        newSearch = search.property("ADBE Vector Group");
                    }
                    if (newSearch === null) {
                        return search;
                    } else {
                        search = newSearch;
                    }
                }
                return search;
            }
            exports.findPropertyWithColors = findPropertyWithColors;

            function setFillColorOnLayer(layer, color, onlySelected, enabled) {
                if (onlySelected === void(0)) {
                    onlySelected = false;
                }
                if (enabled === void(0)) {
                    enabled = true;
                }
                if (layer instanceof ShapeLayer) {
                    var selectedVectorGroupColors_1 = [];
                    layer.selectedProperties.forEach(function(prop) {
                        if (prop.matchName === "ADBE Vector Group") {
                            var colorProp = findProperties(prop, "ADBE Vector Fill Color");
                            selectedVectorGroupColors_1.push.apply(selectedVectorGroupColors_1, __spreadArray([], __read(colorProp), false));
                        }
                    });
                    var fills = (selectedVectorGroupColors_1.length > 0 ? selectedVectorGroupColors_1 : findProperties(layer.property("ADBE Root Vectors Group"), "ADBE Vector Fill Color"));
                    if (fills.length === 0) {
                        var rootVectorsGroups = layer.property("ADBE Root Vectors Group");
                        var vectorGroup = rootVectorsGroups.property("ADBE Vector Group");
                        var vectorsGroup = vectorGroup.property("ADBE Vectors Group");
                        var stroke = vectorsGroup.addProperty("ADBE Vector Graphic - Fill");
                        stroke.name = "Fill 1";
                        fills.push(stroke.property("ADBE Vector Fill Color"));
                    }
                    var allFillsAreDeselected_1 = utils_1.arrayFilter(fills, function(property) {
                        return property.parentProperty.parentProperty.parentProperty.selected === false;
                    }).length === fills.length;
                    fills.forEach(function(property) {
                        if (onlySelected && !allFillsAreDeselected_1 && !property.parentProperty.parentProperty.parentProperty.selected) {
                            return;
                        }
                        property.parentProperty.enabled = enabled;
                        if (property.numKeys > 0) {
                            property.setValueAtTime(layer.containingComp.time, color);
                        } else {
                            property.setValue(color);
                        }
                    });
                    var opacities = findProperties(layer.property("ADBE Root Vectors Group"), "ADBE Vector Fill Opacity");
                    opacities.forEach(function(property) {
                        if (onlySelected && !allFillsAreDeselected_1 && !property.parentProperty.parentProperty.parentProperty.selected) {
                            return;
                        }
                        property.setValue(Math.round(color[3] * 100));
                    });
                } else if (layer instanceof TextLayer) {
                    var textProperty = layer.property("ADBE Text Properties").property("ADBE Text Document");
                    var textDocument = textProperty.value;
                    textDocument.applyFill = true;
                    textDocument.fillColor = [color[0], color[1], color[2]];
                    if (textProperty.numKeys > 0) {
                        textProperty.setValueAtTime(layer.containingComp.time, textDocument);
                    } else {
                        textProperty.setValue(textDocument);
                    }
                    layer.property("ADBE Transform Group").property("ADBE Opacity").setValue(Math.round(color[3] * 100));
                } else if (layer instanceof AVLayer && layer.source.mainSource instanceof SolidSource && !layer.nullLayer) {
                    var layerFill = layer.property("ADBE Effect Parade").property("ADBE Fill");
                    if (layerFill && layerFill.property("ADBE Fill-0002")) {
                        if (layerFill.property("ADBE Fill-0002").numKeys > 0) {
                            layerFill.property("ADBE Fill-0002").setValueAtTime(layer.containingComp.time, [color[0], color[1], color[2]]);
                        } else {
                            layerFill.property("ADBE Fill-0002").setValue([color[0], color[1], color[2]]);
                        }
                        layerFill.property("ADBE Fill-0005").setValue(color[3]);
                    } else {
                        var newSolid = app.project.activeItem.layers.addSolid([color[0], color[1], color[2]], "MOTION_COLOR_SOLID", layer.width, layer.height, layer.containingComp.pixelAspect, layer.containingComp.duration);
                        var items = utils_1.arrayFilter(utils_1.collectionToArray(app.project.items), function(item) {
                            return item.name === "MOTION_COLOR_SOLID";
                        });
                        if (items.length === 1) {
                            var newSolidItem = items[0];
                            newSolidItem.name = layer.name;
                            layer.replaceSource(newSolidItem, true);
                            newSolid.remove();
                            app.beginSuppressDialogs();
                            app.executeCommand(2109);
                            app.endSuppressDialogs(false);
                            layer.selected = true;
                        }
                    }
                } else {
                    if (layer instanceof LightLayer) {
                        var colorProp = layer.property("ADBE Light Options Group").property("ADBE Light Color");
                        if (colorProp.numKeys > 0) {
                            colorProp.setValueAtTime(layer.containingComp.time, color);
                        } else {
                            colorProp.setValue(color);
                        }
                    }
                }
            }
            exports.setFillColorOnLayer = setFillColorOnLayer;

            function setStrokeColorOnLayer(layer, color, onlySelected, enabled) {
                if (onlySelected === void(0)) {
                    onlySelected = false;
                }
                if (enabled === void(0)) {
                    enabled = true;
                }
                if (layer instanceof ShapeLayer) {
                    var selectedVectorGroupStrokes_1 = [];
                    layer.selectedProperties.forEach(function(prop) {
                        if (prop.matchName === "ADBE Vector Group") {
                            var strokeColors = findProperties(prop, "ADBE Vector Stroke Color");
                            if (strokeColors.length === 0) {
                                addStrokePropToVectorGroup(prop);
                                strokeColors.push.apply(strokeColors, __spreadArray([], __read(findProperties(prop, "ADBE Vector Stroke Color")), false));
                            }
                            selectedVectorGroupStrokes_1.push.apply(selectedVectorGroupStrokes_1, __spreadArray([], __read(strokeColors), false));
                        }
                    });
                    var strokes = (selectedVectorGroupStrokes_1.length > 0 ? selectedVectorGroupStrokes_1 : findProperties(layer.property("ADBE Root Vectors Group"), "ADBE Vector Stroke Color"));
                    if (strokes.length === 0) {
                        var rootVectorsGroups = layer.property("ADBE Root Vectors Group");
                        var vectorGroup = rootVectorsGroups.property("ADBE Vector Group");
                        var stroke = addStrokePropToVectorGroup(vectorGroup);
                        strokes.push(stroke.property("ADBE Vector Stroke Color"));
                    }
                    var allStrokesAreDeselected_1 = utils_1.arrayFilter(strokes, function(property) {
                        return property.parentProperty.parentProperty.parentProperty.selected === false;
                    }).length === strokes.length;
                    strokes.forEach(function(property) {
                        if (onlySelected && !allStrokesAreDeselected_1 && !property.parentProperty.parentProperty.parentProperty.selected) {
                            return;
                        }
                        property.parentProperty.enabled = enabled;
                        if (property.numKeys > 0) {
                            property.setValueAtTime(layer.containingComp.time, color);
                        } else {
                            property.setValue(color);
                        }
                    });
                    var opacities = findProperties(layer.property("ADBE Root Vectors Group"), "ADBE Vector Stroke Opacity");
                    opacities.forEach(function(property) {
                        if (onlySelected && !allStrokesAreDeselected_1 && !property.parentProperty.parentProperty.parentProperty.selected) {
                            return;
                        }
                        property.setValue(Math.round(color[3] * 100));
                    });
                } else {
                    if (layer instanceof TextLayer) {
                        var textProperty = layer.property("ADBE Text Properties").property("ADBE Text Document");
                        var textDocument = textProperty.value;
                        textDocument.applyStroke = true;
                        textDocument.strokeColor = [color[0], color[1], color[2]];
                        textProperty.setValue(textDocument);
                        layer.property("ADBE Transform Group").property("ADBE Opacity").setValue(Math.round(color[3] * 100));
                    }
                }
            }
            exports.setStrokeColorOnLayer = setStrokeColorOnLayer;

            function findProperties(layerOrPropertyGroup, matchName) {
                var results = [];
                for (var i = 1; i <= layerOrPropertyGroup.numProperties; i += 1) {
                    var propertyGroup = layerOrPropertyGroup.property(i);
                    if (propertyGroup instanceof PropertyGroup) {
                        results = results.concat(findProperties(propertyGroup, matchName));
                    } else {
                        if (propertyGroup instanceof Property) {
                            if (propertyGroup.matchName === matchName) {
                                results.push(propertyGroup);
                            }
                        }
                    }
                }
                return results;
            }
            exports.findProperties = findProperties;

            function addStrokePropToVectorGroup(vectorGroup) {
                var vectorsGroup = vectorGroup.property("ADBE Vectors Group");
                var stroke = vectorsGroup.addProperty("ADBE Vector Graphic - Stroke");
                stroke.name = "Stroke 1";
                return stroke;
            }
            exports.addStrokePropToVectorGroup = addStrokePropToVectorGroup;
        },
        "./build/aeft/tools/composition.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.poll = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function poll() {
                var composition = utils_1.getComposition();
                return {
                    duration: composition.duration,
                    time: composition.time,
                    workAreaStart: composition.workAreaStart,
                    workAreaDuration: composition.workAreaDuration,
                    width: composition.width,
                    height: composition.height,
                    fps: composition.frameRate,
                    displayStartTime: composition.displayStartTime,
                    name: composition.name
                };
            }
            exports.poll = poll;
        },
        "./build/aeft/tools/delay.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __values = this && this.__values || function(o) {
                    var s = typeof Symbol === "function" && Symbol.iterator;
                    var m = s && o[s];
                    var i = 0;
                    if (m) {
                        return m.call(o);
                    }
                    if (o && typeof o.length === "number") {
                        return {
                            next: function() {
                                if (o && i >= o.length) {
                                    o = void(0)
                                }
                                return {
                                    value: o && o[i++],
                                    done: !o
                                };
                            }
                        };
                    }
                    throw new TypeError((s ? "Object is not iterable." : "Symbol.iterator is not defined."))
                };
            exports.__esModule = true;
            exports.run = exports.check = exports.addDelay = exports.toEffectName = exports.DELAY_CHILD_EFFECT_NAME = exports.DELAY_PARENT_EFFECT_NAME = exports.DELAY_CHILD_PREFIX = exports.DELAY_PARENT_PREFIX = exports.DELAY_PREFIX = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            exports.DELAY_PREFIX = "[d] ";
            exports.DELAY_PARENT_PREFIX = "[d-p] ";
            exports.DELAY_CHILD_PREFIX = "[d-c] ";
            exports.DELAY_PARENT_EFFECT_NAME = exports.DELAY_PREFIX + "G L O B A L";
            exports.DELAY_CHILD_EFFECT_NAME = exports.DELAY_PREFIX + "C H I L D";
            var standardEffectGroup = "Pseudo/ECff194bd30AO";
            var clothEffectGroup = "Pseudo/WO6fbd0b07I7W";
            var d1ChildPrefix = "Pseudo/9rb061afeaiGL";
            var d1MasterPrefix = "Pseudo/yV347c57e3S7H";
            var d2ChildPrefix = "Pseudo/jN8ec962dboGZ";
            var d2MasterPrefix = "Pseudo/Bs5b67a435H7o";
            var d3ChildPrefix = "Pseudo/AM3c44d406eG2";
            var d3MasterPrefix = "Pseudo/cgcebdb4a0V7C";
            var colorChildPrefix = "ADBE Color Balance (HLS)";
            var pseudos = {
                standard: standardEffectGroup,
                cloth: clothEffectGroup,
                "1": {
                    global: {},
                    child: {
                        prefix: d1ChildPrefix,
                        enable: d1ChildPrefix + "-0001",
                        delay: d1ChildPrefix + "-0002",
                        enableMag: d1ChildPrefix + "-0004",
                        mag: d1ChildPrefix + "-0005",
                        softforce: d1ChildPrefix + "-0009",
                        softforceAmt: d1ChildPrefix + "-0010",
                        correction: d1ChildPrefix + "-0013"
                    },
                    parent: {
                        prefix: d1MasterPrefix,
                        delay: d1MasterPrefix + "-0001",
                        dragEnable: d1MasterPrefix + "-0003",
                        dragSeed: d1MasterPrefix + "-0004",
                        dragRange: d1MasterPrefix + "-0005",
                        enableScatter: d1MasterPrefix + "-0008",
                        scatterSeed: d1MasterPrefix + "-0009",
                        x: d1MasterPrefix + "-0010",
                        correction: d1MasterPrefix + "-0022",
                        dynEnable: d1MasterPrefix + "-0014",
                        dynFreq: d1MasterPrefix + "-0015",
                        dynAmount: d1MasterPrefix + "-0016"
                    }
                },
                "2": {
                    child: {
                        prefix: d2ChildPrefix,
                        enable: d2ChildPrefix + "-0001",
                        delay: d2ChildPrefix + "-0002",
                        enableMag: d2ChildPrefix + "-0004",
                        xMag: d2ChildPrefix + "-0006",
                        yMag: d2ChildPrefix + "-0007",
                        softforce: d2ChildPrefix + "-0012",
                        softforceAmt: d2ChildPrefix + "-0013",
                        correction: d2ChildPrefix + "-0016"
                    },
                    parent: {
                        prefix: d2MasterPrefix,
                        delay: d2MasterPrefix + "-0001",
                        dragEnable: d2MasterPrefix + "-0003",
                        dragSeed: d2MasterPrefix + "-0004",
                        dragRange: d2MasterPrefix + "-0005",
                        enableScatter: d2MasterPrefix + "-0008",
                        scatterSeed: d2MasterPrefix + "-0009",
                        x: d2MasterPrefix + "-0010",
                        y: d2MasterPrefix + "-0011",
                        correction: d2MasterPrefix + "-0023",
                        dynEnable: d2MasterPrefix + "-0015",
                        dynFreq: d2MasterPrefix + "-0016",
                        dynAmount: d2MasterPrefix + "-0017"
                    }
                },
                "3": {
                    child: {
                        prefix: d3ChildPrefix,
                        enable: d3ChildPrefix + "-0001",
                        delay: d3ChildPrefix + "-0002",
                        enableMag: d3ChildPrefix + "-0004",
                        xMag: d3ChildPrefix + "-0006",
                        yMag: d3ChildPrefix + "-0007",
                        zMag: d3ChildPrefix + "-0008",
                        softforce: d3ChildPrefix + "-0013",
                        softforceAmt: d3ChildPrefix + "-0014",
                        correction: d3ChildPrefix + "-0017"
                    },
                    parent: {
                        prefix: d3MasterPrefix,
                        delay: d3MasterPrefix + "-0001",
                        dragEnable: d3MasterPrefix + "-0003",
                        dragSeed: d3MasterPrefix + "-0004",
                        dragRange: d3MasterPrefix + "-0005",
                        enableScatter: d3MasterPrefix + "-0008",
                        scatterSeed: d3MasterPrefix + "-0009",
                        x: d3MasterPrefix + "-0010",
                        y: d3MasterPrefix + "-0011",
                        z: d3MasterPrefix + "-0012",
                        correction: d3MasterPrefix + "-0024",
                        dynEnable: d3MasterPrefix + "-0016",
                        dynFreq: d3MasterPrefix + "-0017",
                        dynAmount: d3MasterPrefix + "-0018"
                    }
                },
                "4": {
                    parent: {
                        prefix: d1MasterPrefix
                    },
                    child: {
                        prefix: colorChildPrefix,
                        color: colorChildPrefix + "-0001"
                    }
                }
            };

            function minifier(code, map) {
                Object.keys(map).forEach(function(key) {
                    code = code.replace(new RegExp(key, "g"), map[key]);
                });
                var lines = code.split("\n").map(function(line) {
                    return line.trim();
                });
                var firstLine = lines.shift();
                return "".concat(firstLine, "\n").concat(lines.join(""));
            }

            function get1dExpression(parentLayer, childEffectName, globalEffectName, propertyPath, pseudos, compositionEnabled, guideEnabled) {
                if (guideEnabled === void(0)) {
                    guideEnabled = false;
                }
                var compAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(parentLayer.containingComp.name), ").layer(").concat(JSON.stringify(parentLayer.name), ")") : "thisComp.layer(".concat(JSON.stringify(parentLayer.name), ")"));
                var indexAdjust = (compositionEnabled ? "index".concat((guideEnabled ? " - 1" : "")) : "index - (parentLayer.index".concat((guideEnabled ? " + 1" : ""), ")"));
                var propertyPathString = "(".concat((propertyPath.map(function(str) {
                    return JSON.stringify(str);
                }).join)(")("), ")");
                return minifier(("// Mt. Mograph - Motion 4 (1D Expression)\nparentLayer = ".concat(compAccessor, ";\nglobalEffect = parentLayer(\"Effects\")(").concat(JSON.stringify(globalEffectName), ");\nparentProperty = parentLayer").concat(propertyPathString, ";\nchildEffect = effect(").concat(JSON.stringify(childEffectName), ");\nchildEnable = childEffect(\"").concat(pseudos.child.enable, "\");\nchildDelay = childEffect(\"").concat(pseudos.child.delay, "\") / 200;\nchildMagEnable = childEffect(\"").concat(pseudos.child.enableMag, "\");\nchildMag = childEffect(\"").concat(pseudos.child.mag, "\") / 100;\nchildSoftforceEnable = childEffect(\"").concat(pseudos.child.softforce, "\");\nchildSoftforceOriginalEase = childEffect(\"").concat(pseudos.child.softforceAmt, "\") / 100;\nchildCorrection = childEffect(\"").concat(pseudos.child.correction, "\");\nparentDelay = globalEffect(\"").concat(pseudos.parent.delay, "\") / 200;\nparentDragEnable = globalEffect(\"").concat(pseudos.parent.dragEnable, "\");\nparentDragSeed = globalEffect(\"").concat(pseudos.parent.dragSeed, "\") * 2;\nparentDragRange = globalEffect(\"").concat(pseudos.parent.dragRange, "\");\nparentScatterEnable = globalEffect(\"").concat(pseudos.parent.enableScatter, "\");\nparentScatterSeed = globalEffect(\"").concat(pseudos.parent.scatterSeed, "\") * 2;\nparentScatterX = globalEffect(\"").concat(pseudos.parent.x, "\");\nparentCorrection = globalEffect(\"").concat(pseudos.parent.correction, "\");\nseedRandom(parentDragSeed, true);\nif (childEnable == 1) {\ncalculatedDelay = parentDelay + childDelay;\nif (parentDragEnable == 1) {\n  if (parentDragRange[0] != 0 || parentDragRange[1] != 0) {\n    calculatedDelay = calculatedDelay + random(parentDragRange[0] / 200, parentDragRange[1] / 200);\n  }\n}\nrelativeDelay = calculatedDelay * (").concat)(indexAdjust, ");\nif (childSoftforceEnable == 1) {\n  relativeDelay = relativeDelay * childSoftforceOriginalEase;\n}\ncalculatedTime = time - relativeDelay;\nrelativeValue = parentProperty.valueAtTime(calculatedTime);\ncorrectionAndSeed = childCorrection[0];\nif (parentScatterEnable == 1) {\n  seedRandom(parentScatterSeed, true);\n  correctionAndSeed = [Math.floor(random(parentScatterX[0], parentScatterX[1]) * -1) + childCorrection[0]];\n}\nif (childMagEnable < 1) {\n  childMag = 1;\n}\n[(value + (value - correctionAndSeed)) + (relativeValue - parentCorrection) * childMag];\n} else {\nvalue;\n}"), {
                    parentLayer: "a",
                    globalEffect: "b",
                    parentProperty: "c",
                    childEffect: "d",
                    childEnable: "f",
                    childDelay: "g",
                    childMagEnable: "h",
                    childMag: "i",
                    childSoftforceEnable: "j",
                    childSoftforceOriginalEase: "k",
                    childCorrection: "l",
                    parentDelay: "m",
                    parentDragEnable: "n",
                    parentDragSeed: "o",
                    parentScatterEnable: "p",
                    parentScatterSeed: "q",
                    parentScatterX: "r",
                    parentCorrection: "s",
                    calculatedDelay: "t",
                    relativeDelay: "u",
                    calculatedTime: "v",
                    relativeValue: "w",
                    correctionAndSeed: "x",
                    parentDragRange: "y"
                }) + (((("\n//META{\"tool\": \"midas\", \"parentLayer\": ".concat)(JSON.stringify(parentLayer.name), ", \"composition\": \"").concat)(parentLayer.containingComp.name, "\", \"childEffectName\": \"").concat)(childEffectName, "\", \"globalEffectName\": \"").concat)(globalEffectName, "\"}ENDMETA");
            }

            function get2dExpression(parentLayer, childEffectName, globalEffectName, propertyPath, pseudos, compositionEnabled, guideEnabled) {
                if (guideEnabled === void(0)) {
                    guideEnabled = false;
                }
                var compAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(parentLayer.containingComp.name), ").layer(").concat(JSON.stringify(parentLayer.name), ")") : "thisComp.layer(".concat(JSON.stringify(parentLayer.name), ")"));
                var indexAdjust = (compositionEnabled ? "index".concat((guideEnabled ? " - 1" : "")) : "index - (parentLayer.index".concat((guideEnabled ? " + 1" : ""), ")"));
                var propertyPathString = "(".concat((propertyPath.map(function(str) {
                    return JSON.stringify(str);
                }).join)(")("), ")");
                return minifier(("// Mt. Mograph - Motion 4 (2D Expression)\nparentLayer = ".concat(compAccessor, ";\nglobalEffect = parentLayer(\"Effects\")(").concat(JSON.stringify(globalEffectName), ");\nparentProperty = parentLayer").concat(propertyPathString, ";\nchildEffect = effect(").concat(JSON.stringify(childEffectName), ");\nchildEnable = childEffect(\"").concat(pseudos.child.enable, "\");\nchildDelay = childEffect(\"").concat(pseudos.child.delay, "\") / 200;\nchildMagEnable = childEffect(\"").concat(pseudos.child.enableMag, "\");\nchildMagX = childEffect(\"").concat(pseudos.child.xMag, "\") / 100;\nchildMagY = childEffect(\"").concat(pseudos.child.yMag, "\") / 100;\nchildSoftforceEnable = childEffect(\"").concat(pseudos.child.softforce, "\");\nchildSoftforceOriginalEase = childEffect(\"").concat(pseudos.child.softforceAmt, "\") / 100;\nchildCorrection = childEffect(\"").concat(pseudos.child.correction, "\");\nparentDelay = globalEffect(\"").concat(pseudos.parent.delay, "\") / 200;\nparentDragEnable = globalEffect(\"").concat(pseudos.parent.dragEnable, "\");\nparentDragSeed = globalEffect(\"").concat(pseudos.parent.dragSeed, "\") * 2;\nparentDragRange = globalEffect(\"").concat(pseudos.parent.dragRange, "\");\nparentScatterEnable = globalEffect(\"").concat(pseudos.parent.enableScatter, "\");\nparentScatterSeed = globalEffect(\"").concat(pseudos.parent.scatterSeed, "\") * 2;\nparentScatterX = globalEffect(\"").concat(pseudos.parent.x, "\");\nparentScatterY = globalEffect(\"").concat(pseudos.parent.y, "\");\nparentCorrection = globalEffect(\"").concat(pseudos.parent.correction, "\");\nseedRandom(parentDragSeed, true);\nif (childEnable == 1) {\ncalculatedDelay = parentDelay + childDelay;\nif (parentDragEnable == 1) {\n  if (parentDragRange[0] != 0 || parentDragRange[1] != 0) {\n    calculatedDelay = calculatedDelay + random(parentDragRange[0] / 200, parentDragRange[1] / 200);\n  }\n}\nrelativeDelay = calculatedDelay * (").concat)(indexAdjust, ");\nif (childSoftforceEnable == 1) {\n  relativeDelay = relativeDelay * childSoftforceOriginalEase;\n}\ncalculatedTime = time - relativeDelay;\nrelativeValue = parentProperty.valueAtTime(calculatedTime);\ncorrectionAndSeed = [childCorrection[0], childCorrection[1]];\nif (parentScatterEnable == 1) {\n  seedRandom(parentScatterSeed, true);\n  r1 = [Math.floor(random(parentScatterX[0], parentScatterX[1]) * -1) + childCorrection[0]];\n  r2 = [Math.floor(random(parentScatterY[0], parentScatterY[1]) * -1) + childCorrection[1]];\n  correctionAndSeed = [r1, r2];\n}\nif (\n  parentScatterX.value[0] === parentScatterY.value[0]\n  && parentScatterX.value[1] === parentScatterY.value[1]\n  && !(\n    parentScatterX.value[0] === 0\n    && parentScatterX.value[1] === 0\n    && parentScatterY.value[0] === 0\n    && parentScatterY.value[1] === 0\n  )\n  && parentScatterEnable == 1\n) {\n  correctionAndSeed = [correctionAndSeed[0], correctionAndSeed[0]];\n} else {\n  correctionAndSeed = [correctionAndSeed[0], correctionAndSeed[1]];\n}\nif (childMagEnable < 1) {\n  childMagX = 1;\n  childMagY = 1;\n}\n[\n  (value[0] + (value[0] - correctionAndSeed[0])) + (relativeValue[0] - parentCorrection[0]) * childMagX,\n  (value[1] + (value[1] - correctionAndSeed[1])) + (relativeValue[1] - parentCorrection[1]) * childMagY\n];\n} else {\nvalue;\n}"), {
                    parentLayer: "a",
                    globalEffect: "b",
                    parentProperty: "c",
                    childEffect: "d",
                    ml_index: "e",
                    childEnable: "f",
                    childDelay: "g",
                    childMagEnable: "h",
                    childMag: "i",
                    childSoftforceEnable: "j",
                    childSoftforceOriginalEase: "k",
                    childCorrection: "l",
                    parentDelay: "m",
                    parentDragEnable: "n",
                    parentDragSeed: "o",
                    parentScatterEnable: "p",
                    parentScatterSeed: "q",
                    parentScatterX: "r",
                    parentCorrection: "s",
                    calculatedDelay: "t",
                    relativeDelay: "u",
                    calculatedTime: "v",
                    relativeValue: "w",
                    correctionAndSeed: "x",
                    parentScatterY: "aa",
                    childMagX: "bb",
                    childMagY: "cc",
                    parentDragRange: "dd"
                }) + (((("\n//META{\"tool\": \"midas\", \"parentLayer\": ".concat)(JSON.stringify(parentLayer.name), ", \"composition\": ").concat)(JSON.stringify(parentLayer.containingComp.name), ", \"childEffectName\": ").concat)(JSON.stringify(childEffectName), ", \"globalEffectName\": ").concat)(JSON.stringify(globalEffectName), "}ENDMETA");
            }

            function get3dExpression(parentLayer, childEffectName, globalEffectName, propertyPath, pseudos, compositionEnabled, guideEnabled) {
                if (guideEnabled === void(0)) {
                    guideEnabled = false;
                }
                var compAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(parentLayer.containingComp.name), ").layer(").concat(JSON.stringify(parentLayer.name), ")") : "thisComp.layer(".concat(JSON.stringify(parentLayer.name), ")"));
                var indexAdjust = (compositionEnabled ? "index".concat((guideEnabled ? " - 1" : "")) : "index - (parentLayer.index".concat((guideEnabled ? " + 1" : ""), ")"));
                var propertyPathString = "(".concat((propertyPath.map(function(str) {
                    return JSON.stringify(str);
                }).join)(")("), ")");
                return minifier(("// Mt. Mograph - Motion 4 (3D Expression)\nparentLayer = ".concat(compAccessor, ";\nglobalEffect =  parentLayer(\"Effects\")(").concat(JSON.stringify(globalEffectName), ");\nparentProperty = parentLayer").concat(propertyPathString, ";\nchildEffect = effect(").concat(JSON.stringify(childEffectName), ");\n\nchildEnable = childEffect(\"").concat(pseudos.child.enable, "\");\nchildDelay = childEffect(\"").concat(pseudos.child.delay, "\") / 200;\nchildMagEnable = childEffect(\"").concat(pseudos.child.enableMag, "\");\nchildMagX = childEffect(\"").concat(pseudos.child.xMag, "\") / 100;\nchildMagY = childEffect(\"").concat(pseudos.child.yMag, "\") / 100;\nchildMagZ = childEffect(\"").concat(pseudos.child.zMag, "\") / 100;\nchildSoftforceEnable = childEffect(\"").concat(pseudos.child.softforce, "\");\nchildSoftforceOriginalEase = childEffect(\"").concat(pseudos.child.softforceAmt, "\") / 100;\nchildCorrection = childEffect(\"").concat(pseudos.child.correction, "\");\n\nparentDelay = globalEffect(\"").concat(pseudos.parent.delay, "\") / 200;\nparentDragEnable = globalEffect(\"").concat(pseudos.parent.dragEnable, "\");\nparentDragSeed = globalEffect(\"").concat(pseudos.parent.dragSeed, "\") * 2;\nparentDragRange = globalEffect(\"").concat(pseudos.parent.dragRange, "\");\nparentScatterEnable = globalEffect(\"").concat(pseudos.parent.enableScatter, "\");\nparentScatterSeed = globalEffect(\"").concat(pseudos.parent.scatterSeed, "\") * 2;\nparentScatterX = globalEffect(\"").concat(pseudos.parent.x, "\");\nparentScatterY = globalEffect(\"").concat(pseudos.parent.y, "\");\nparentScatterZ = globalEffect(\"").concat(pseudos.parent.z, "\");\nparentCorrection = globalEffect(\"").concat(pseudos.parent.correction, "\");\n\nseedRandom(parentDragSeed, true);\nif (childEnable == 1) {\ncalculatedDelay = parentDelay + childDelay;\nif (parentDragEnable == 1) {\n  if (parentDragRange[0] != 0 || parentDragRange[1] != 0) {\n    calculatedDelay = calculatedDelay + random(parentDragRange[0] / 200, parentDragRange[1] / 200);\n  }\n}\nrelativeDelay = calculatedDelay * (").concat)(indexAdjust, ");\nif (childSoftforceEnable == 1) {\n  relativeDelay = relativeDelay * childSoftforceOriginalEase;\n}\ncalculatedTime = time - relativeDelay;\nrelativeValue = parentProperty.valueAtTime(calculatedTime);\n\ncorrectionAndSeed = [childCorrection[0], childCorrection[1], childCorrection[2]];\n\nif (parentScatterEnable == 1) {\n  seedRandom(parentScatterSeed, true);\n  r1 = Math.floor(random(parentScatterX[0], parentScatterX[1]) * -1) + childCorrection[0];\n  r2 = Math.floor(random(parentScatterY[0], parentScatterY[1]) * -1) + childCorrection[1];\n  r3 = Math.floor(random(parentScatterZ[0], parentScatterZ[1]) * -1) + childCorrection[2];\n  correctionAndSeed = [r1, r2, r3];\n}\n\nif (\n  parentScatterX.value[0] === parentScatterY.value[0]\n  && parentScatterX.value[1] === parentScatterY.value[1]\n  && !(\n    parentScatterX.value[0] === 0\n    && parentScatterX.value[1] === 0\n    && parentScatterY.value[0] === 0\n    && parentScatterY.value[1] === 0\n  )\n  && parentScatterEnable == 1\n) {\n  correctionAndSeed = [correctionAndSeed[0], correctionAndSeed[0], correctionAndSeed[0]];\n} else {\n  correctionAndSeed = [correctionAndSeed[0], correctionAndSeed[1], correctionAndSeed[2]];\n}\nif (childMagEnable < 1) {\n  childMagX = 1;\n  childMagY = 1;\n  childMagZ = 1;\n}\nf3 = 0;\ntry {\n  f3 = (value[2] + (value[2] - correctionAndSeed[2])) + (relativeValue[2] - parentCorrection[2]) * childMagZ;\n} catch (err) {\n}\n[\n  (value[0] + (value[0] - correctionAndSeed[0])) + (relativeValue[0] - parentCorrection[0]) * childMagX,\n  (value[1] + (value[1] - correctionAndSeed[1])) + (relativeValue[1] - parentCorrection[1]) * childMagY,\n  f3 || 0\n];\n} else {\nvalue;\n}"), {
                    parentLayer: "a",
                    globalEffect: "b",
                    parentProperty: "c",
                    childEffect: "d",
                    ml_index: "e",
                    childMagEnable: "h",
                    childEnable: "f",
                    childDelay: "g",
                    childMag: "i",
                    childSoftforceEnable: "j",
                    childSoftforceOriginalEase: "k",
                    childCorrection: "l",
                    parentDelay: "m",
                    parentDragEnable: "n",
                    parentDragSeed: "o",
                    parentScatterEnable: "p",
                    parentScatterSeed: "q",
                    parentScatterX: "r",
                    parentCorrection: "s",
                    calculatedDelay: "t",
                    relativeDelay: "u",
                    calculatedTime: "v",
                    relativeValue: "w",
                    correctionAndSeed: "x",
                    f1: "y",
                    f2: "z",
                    parentScatterY: "aa",
                    childMagX: "bb",
                    childMagY: "cc",
                    f3: "dd",
                    childMagZ: "ee",
                    parentScatterZ: "ff",
                    parentDragRange: "gg"
                }) + (((("\n//META{\"tool\": \"midas\", \"parentLayer\": ".concat)(JSON.stringify(parentLayer.name), ", \"composition\": ").concat)(JSON.stringify(parentLayer.containingComp.name), ", \"childEffectName\": ").concat)(JSON.stringify(childEffectName), ", \"globalEffectName\": ").concat)(JSON.stringify(globalEffectName), "}ENDMETA");
            }

            function getColorExpression() {
                return "value; // Mt. Mograph - Motion 4 (Color Expression)";
            }

            function getGlobalDelayExpression(effectGroupPseudo, effectName, pseudo, dimension) {
                var postFix = "00";
                if (dimension === 1 || dimension === 4) {
                    postFix += "19"
                }
                if (dimension === 2) {
                    postFix += "15"
                }
                if (dimension === 3) {
                    postFix += "21"
                }
                return minifier(((((((((("// Mt. Mograph - Motion 4 (Global Delay Expression)\ntry {\nglobal_midas = effect(\"".concat)(effectGroupPseudo, "\");\nchild_out = effect(").concat)(JSON.stringify(effectName), ")(\"").concat)(pseudo, "-").concat)(postFix, "\");\nenable_global_delay = global_midas(\"").concat)(effectGroupPseudo, "-0002\");\nglobal_delay_amt = global_midas(\"").concat)(effectGroupPseudo, "-0003\");\nenable_global_drag = global_midas(\"").concat)(effectGroupPseudo, "-0006\");\nglobal_drag_seed = global_midas(\"").concat)(effectGroupPseudo, "-0007\");\nglobal_drag_range = global_midas(\"").concat)(effectGroupPseudo, "-0008\");\nseedRandom(global_drag_seed, true);\nif (child_out < 1) {\n  if (enable_global_delay == 1) {\n    global_delay_amt;\n  } else if (enable_global_drag == 1) {\n    global_delay_amt = random(global_delay_amt);\n    if (global_drag_range[0] != 0 || global_drag_range[1] != 0) {\n      global_delay_amt = random(global_drag_range[0], global_drag_range[1]);\n    } else {\n      global_delay_amt = random(global_delay_amt);\n    }\n    global_delay_amt;\n  } else {\n    value;\n  }\n} else {\n  value;\n}\n} catch (e$$4) {\nvalue;\n}"), {
                    global_midas: "a",
                    child_out: "b",
                    enable_global_delay: "c",
                    global_delay_amt: "d",
                    enable_global_drag: "e",
                    global_drag_seed: "f",
                    global_drag_range: "g"
                });
            }

            function getGlobalColorExpression(parentLayer, effectGroupPseudo, pseudos, compositionEnabled, guideEnabled) {
                var compAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(parentLayer.containingComp.name), ").layer(").concat(JSON.stringify(parentLayer.name), ")") : "thisComp.layer(".concat(JSON.stringify(parentLayer.name), ")"));
                var indexAdjust = (compositionEnabled ? "index".concat((guideEnabled ? " - 1" : "")) : "index - (parentLayer.index".concat((guideEnabled ? " + 1" : ""), ")"));
                return minifier("// Mt. Mograph - Motion 4 (Global Color Expression)\nparentLayer = ".concat(compAccessor, ";\nindex_adjust = ").concat(indexAdjust, ";\nglobalEffect = parentLayer(\"ADBE Effect Parade\")(\"").concat(effectGroupPseudo, "\");\nenable_color = globalEffect(\"").concat(effectGroupPseudo, "-0011\");\ncolor_seed = globalEffect(\"").concat(effectGroupPseudo, "-0012\");\ncolor_cycle = globalEffect(\"").concat(effectGroupPseudo, "-0013\") / 100;\nif (enable_color == 1) {\n(color_seed * index_adjust) * color_cycle;\n} else {\n0;\n}"), {
                    parentLayer: "a",
                    index_adjust: "b",
                    globalEffect: "c",
                    enable_color: "d",
                    color_seed: "e",
                    color_cycle: "f"
                });
            }

            function getGlobalStrokeExpression(parentLayer, effectGroupPseudo, compositionEnabled) {
                var compAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(parentLayer.containingComp.name), ").layer(").concat(JSON.stringify(parentLayer.name), ")") : "thisComp.layer(".concat(JSON.stringify(parentLayer.name), ")"));
                return minifier("// Mt. Mograph - Motion 4 (Global Stroke Expression)\nparentLayer =  ".concat(compAccessor, ";\nglobalEffect = parentLayer(\"ADBE Effect Parade\")(\"").concat(exports.DELAY_PARENT_EFFECT_NAME, "\");\nenable_color = globalEffect(\"").concat(effectGroupPseudo, "-0011\");\nif (enable_color == 1) {\nparentLayer(\"ADBE Root Vectors Group\")(\"ADBE Vector Group\")(\"ADBE Vectors Group\")(\"ADBE Vector Graphic - Stroke\")(\"ADBE Vector Stroke Color\");\n} else {\nvalue;\n}"), {
                    parentLayer: "a",
                    globalEffect: "b",
                    enable_color: "c"
                });
            }

            function getGlobalFillExpression(parentLayer, effectGroupPseudo, compositionEnabled) {
                var compAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(parentLayer.containingComp.name), ").layer(").concat(JSON.stringify(parentLayer.name), ")") : "thisComp.layer(".concat(JSON.stringify(parentLayer.name), ")"));
                return minifier((("// Mt. Mograph - Motion 4 (Global Fill Expression)\nparentLayer = ".concat(compAccessor, ";\nglobalEffect = parentLayer(\"ADBE Effect Parade\")(\"").concat(exports.DELAY_PARENT_EFFECT_NAME, "\");\nenable_color = globalEffect(\"").concat(effectGroupPseudo, "-0011\");\nif (enable_color == 1) {\ntry {\n  parentLayer(\"ADBE Effect Parade\")(\"Pseudo/").concat)(effectGroupPseudo, "\")(\"Pseudo/").concat)(effectGroupPseudo, "-0018\");\n} catch (err) {\n  try {\n    parentLayer(\"ADBE Root Vectors Group\")(\"ADBE Vector Group\")(\"ADBE Vectors Group\")(\"ADBE Vector Graphic - Fill\")(\"ADBE Vector Fill Color\");\n  } catch (err) {\n    value;\n  }\n}\n} else {\nvalue;\n}"), {
                    parentLayer: "a",
                    globalEffect: "b",
                    enable_color: "c"
                });
            }

            function getTwoDMagExpression(effectName) {
                return minifier("// Mt. Mograph - Motion 4 (2D Mag Expression)\nproperty = effect(".concat(JSON.stringify(effectName), ");\nallowMirror = property(\"Pseudo/jN8ec962dboGZ-0005\");\nmirrorVal = property(\"Pseudo/jN8ec962dboGZ-0008\");\nif (allowMirror == 1) {\nmirrorVal;\n} else {\nvalue;\n}"), {
                    property: "a",
                    allowMirror: "b",
                    mirrorVal: "c"
                });
            }

            function getThreeDMagExpression(effectName) {
                return minifier("// Mt. Mograph - Motion 4 (3D Mag Expression)\nproperty = effect(".concat(JSON.stringify(effectName), ");\nallowMirror = property(\"Pseudo/AM3c44d406eG2-0005\");\nmirrorVal = property(\"Pseudo/AM3c44d406eG2-0009\");\nif (allowMirror == 1) {\nmirrorVal;\n} else {\nvalue;\n}"), {
                    property: "a",
                    allowMirror: "b",
                    mirrorVal: "c"
                });
            }
            var expressionForDimension = {
                "1": get1dExpression,
                "2": get2dExpression,
                "3": get3dExpression,
                "4": getColorExpression
            };

            function getAdjustedValueForProperty(composition, property) {
                var propertyPath = utils_1.toPropertyPath(true)(property);
                var layerName = propertyPath.shift();
                var textLayer = composition.layers.addText("midas_temp_value_getter");
                textLayer.enabled = false;
                var propertyPathString = "(".concat((propertyPath.map(function(str) {
                    return JSON.stringify(str);
                }).join)(")("), ")");
                textLayer.sourceText.expression = "thisComp.layer(".concat(JSON.stringify(layerName), ")").concat(propertyPathString, ".value");
                var value = textLayer.sourceText.value.text.split(",").map(function(i) {
                    return Number(i);
                });
                textLayer.remove();
                return value;
            }

            function getMagExpressionsForDimension(dimension, effectName, pseudos) {
                if (dimension === 2) {
                    var twoDExpression = getTwoDMagExpression(effectName);
                    return "var twoDExpression = ".concat(JSON.stringify(twoDExpression), ";\neffectGroup.property(\"").concat(pseudos.xMag, "\").expression = twoDExpression;\neffectGroup.property(\"").concat(pseudos.yMag, "\").expression = twoDExpression;");
                } else {
                    if (dimension === 3) {
                        var threeDExpression = getThreeDMagExpression(effectName);
                        return "var threeDExpression = ".concat(JSON.stringify(threeDExpression), ";\neffectGroup.property(\"").concat(pseudos.xMag, "\").expression = threeDExpression;\neffectGroup.property(\"").concat(pseudos.yMag, "\").expression = threeDExpression;\neffectGroup.property(\"").concat(pseudos.zMag, "\").expression = threeDExpression;");
                    }
                }
                return "";
            }

            function toEffectName(property) {
                if (property.parentProperty instanceof MaskPropertyGroup) {
                    property = property.parentProperty;
                }
                return utils_1.getUniqueName([property.parentProperty.name], "".concat(property.name, " ")).trim();
            }
            exports.toEffectName = toEffectName;

            function addDelay(parentLayer, childLayers, properties, keyframesEnabled, shyEnabled, compositionEnabled, useClothEffects, guideEnabled) {
                if (keyframesEnabled === void(0)) {
                    keyframesEnabled = false;
                }
                if (shyEnabled === void(0)) {
                    shyEnabled = false;
                }
                if (compositionEnabled === void(0)) {
                    compositionEnabled = true;
                }
                if (useClothEffects === void(0)) {
                    useClothEffects = false;
                }
                if (guideEnabled === void(0)) {
                    guideEnabled = false;
                }
                var basePseudo = (useClothEffects ? pseudos.cloth : pseudos.standard);
                var masterFn = utils_1.genfun("function applyEffectsToMaster(parentLayer) {");
                masterFn("ensureEffect(parentLayer, DELAY_PARENT_EFFECT_NAME, '".concat(basePseudo, "')"));
                var childFn = utils_1.genfun("function applyEffectsToChild(childLayer) {");
                var globalColorExpression = getGlobalColorExpression(parentLayer, basePseudo, pseudos[4].child, compositionEnabled, guideEnabled);
                var globalStrokeExpression = getGlobalStrokeExpression(parentLayer, basePseudo, compositionEnabled);
                var globalFillExpression = getGlobalFillExpression(parentLayer, basePseudo, compositionEnabled);
                childFn(((("\n// add color effect group\nconst colorEffectGroup = ensureEffect(childLayer, DELAY_CHILD_EFFECT_NAME, '".concat(pseudos[4].child.prefix, "')\ncolorEffectGroup.property('").concat(pseudos[4].child.color, "').expression = ").concat(JSON.stringify(globalColorExpression), "\n// add stroke / fill expressions\nif (childLayer instanceof ShapeLayer) {\n\tsetPropertyAtPath(childLayer, [\"ADBE Root Vectors Group\", \"ADBE Vector Group\", \"ADBE Vectors Group\", \"ADBE Vector Graphic - Stroke\", \"ADBE Vector Stroke Color\"], 'expression', ").concat)(JSON.stringify(globalStrokeExpression), ")\n  ").concat)((useClothEffects ? "" : "setPropertyAtPath(childLayer, [\"ADBE Root Vectors Group\", \"ADBE Vector Group\", \"ADBE Vectors Group\", \"ADBE Vector Graphic - Fill\", \"ADBE Vector Fill Color\"], 'expression', ".concat(JSON.stringify(globalFillExpression), ")")), "\n}\n").concat)((shyEnabled && !compositionEnabled ? "childLayer.shy = true;" : "")));
                var names = [];
                properties.forEach(function(property) {
                    if (property instanceof PropertyGroup || property instanceof MaskPropertyGroup || property.matchName.indexOf("ADBE Vector Shape") > -1 || !property.canVaryOverTime) {
                        return;
                    }
                    var effectName = toEffectName(property);
                    while (names.indexOf(effectName) > -1) {
                        effectName += ">";
                    }
                    names.push(effectName);
                    var safePropertyPath = utils_1.toPropertyPath(false)(property);
                    var dimension = null;
                    if (utils_1.isOneDProperty(property)) {
                        dimension = 1;
                    } else if (utils_1.isTwoDProperty(property)) {
                        dimension = 2;
                    } else {
                        if (utils_1.isThreeDProperty(property)) {
                            dimension = 3;
                        }
                    }
                    if (dimension === null) {
                        return;
                    }
                    var dimensionString = "" + dimension;
                    var pseudosForDimension = pseudos[dimensionString];
                    var parentPseudos = pseudosForDimension.parent;
                    var globalEffectName = exports.DELAY_PARENT_PREFIX + effectName;
                    var globalDelayExpression = getGlobalDelayExpression(basePseudo, globalEffectName, parentPseudos.prefix, dimension);
                    var adjustedValue = JSON.stringify(getAdjustedValueForProperty(parentLayer.containingComp, property));
                    var wiggleExpression = minifier("// Mt. Mograph - Motion 4 (Wiggle Expression)\nvar tl_parade = thisLayer(\"ADBE Effect Parade\");\nvar tl_dynEnable = tl_parade(\"".concat(globalEffectName, "\")(\"").concat(parentPseudos.dynEnable, "\");\nvar tl_dynFreq = tl_parade(\"").concat(globalEffectName, "\")(\"").concat(parentPseudos.dynFreq, "\");\nvar tl_dynAmount = tl_parade(\"").concat(globalEffectName, "\")(\"").concat(parentPseudos.dynAmount, "\");\nvar tl_dynOffset = value;\nif (tl_dynEnable > 0) {\nseedRandom(time * tl_dynFreq);\ntl_dynOffset = wiggle(0, tl_dynAmount);\n}\ntl_dynOffset;"), {
                        tl_parade: "a",
                        tl_dynEnable: "b",
                        tl_dynFreq: "c",
                        tl_dynAmount: "d",
                        tl_dynOffset: "e"
                    });
                    var propertyPathString = ".property(".concat((safePropertyPath.map(function(str) {
                        return JSON.stringify(str);
                    }).join)(").property("), ")");
                    masterFn((("\n// add parent property effect\nvar effect = ensureEffect(parentLayer, ".concat(JSON.stringify(globalEffectName), ", '").concat(parentPseudos.prefix, "')\n// set the expression\neffect.property('").concat(parentPseudos.delay, "').expression = ").concat(JSON.stringify(globalDelayExpression), ";\n// set the correction value\neffect.property('").concat(parentPseudos.correction, "')\n  .setValue(").concat(adjustedValue, ")\nvar prop = parentLayer").concat(propertyPathString, "\nif (prop.expression === '') {\n  prop.expression = ").concat)(JSON.stringify(wiggleExpression), ";\n}\n").concat)((keyframesEnabled ? "prop.setValueAtTime(parentLayer.containingComp.time, prop.value);" : "")));
                    var childEffectName = exports.DELAY_CHILD_PREFIX + effectName;
                    var expression = expressionForDimension[dimensionString](parentLayer, childEffectName, globalEffectName, safePropertyPath, pseudosForDimension, compositionEnabled, guideEnabled);
                    childFn("\nvar property = childLayer".concat(propertyPathString, "\nvar value = getAdjustedValueForProperty(parentLayer.containingComp, property)\nvar effectGroup = ensureEffect(childLayer, ").concat(JSON.stringify(childEffectName), ", '").concat(pseudosForDimension.child.prefix, "')\neffectGroup.property('").concat(pseudosForDimension.child.correction, "')\n  .setValue(value)\nvar property = childLayer").concat(propertyPathString, "\nproperty.expression = ").concat(JSON.stringify(expression), ";\n").concat(getMagExpressionsForDimension(dimension, childEffectName, pseudosForDimension.child)));
                });
                masterFn("}");
                var applyMasterEffects = masterFn.toFunction({
                    DELAY_PARENT_EFFECT_NAME: exports.DELAY_PARENT_EFFECT_NAME,
                    ensureEffect: utils_1.ensureEffect
                });
                childFn("}");
                var applyChildEffects = childFn.toFunction({
                    DELAY_CHILD_EFFECT_NAME: exports.DELAY_CHILD_EFFECT_NAME,
                    ensureEffect: utils_1.ensureEffect,
                    parentLayer: parentLayer,
                    setPropertyAtPath: utils_1.setPropertyAtPath,
                    getAdjustedValueForProperty: getAdjustedValueForProperty
                });
                applyMasterEffects(parentLayer);
                childLayers.forEach(function(childLayer) {
                    applyChildEffects(childLayer);
                });
            }
            exports.addDelay = addDelay;

            function findParentLayer(selectedLayers) {
                return utils_1.arrayFilter(selectedLayers, function(selectedLayer) {
                    return selectedLayer.selectedProperties.length > 0;
                })[0];
            }

            function layerIsMidasParent(layer) {
                return !(!layer.property("ADBE Effect Parade").property(exports.DELAY_PARENT_EFFECT_NAME));
            }

            function createGuideLayerFrom(layer) {
                var copy = layer.duplicate();
                var selectedPropertiesGetter = utils_1.propertiesToGetter(layer.selectedProperties);
                selectedPropertiesGetter(copy).forEach(function(property) {
                    property.selected = true;
                });
                return copy;
            }

            function runDelay(composition, keyframesEnabled, compositionEnabled, shyEnabled, name, guideEnabled) {
                utils_1.fast(function() {
                    var names = [];
                    var selectedLayers = composition.selectedLayers;
                    selectedLayers.forEach(function(selectedLayer, i) {
                        if (names.indexOf(selectedLayer.name) > -1) {
                            selectedLayer.name += "" + i + 1;
                        }
                        names.push(selectedLayer.name);
                    });
                    var lowestIndex = utils_1.getLowestIndex(selectedLayers);
                    var parentLayer = findParentLayer(selectedLayers);
                    if (!layerIsMidasParent(parentLayer)) {
                        if (guideEnabled) {
                            parentLayer = createGuideLayerFrom(parentLayer);
                            parentLayer.guideLayer = true;
                        }
                        parentLayer.label = 2;
                        var originalName = parentLayer.name;
                        parentLayer.name = utils_1.getUniqueNameFromLayers(composition.layers, exports.DELAY_PREFIX + name || parentLayer.name);
                        app.project.autoFixExpressions(originalName, parentLayer.name);
                        if (parentLayer.index !== lowestIndex && guideEnabled || compositionEnabled) {
                            var destination = composition.layer(lowestIndex);
                            if (destination instanceof AVLayer && destination.hasTrackMatte) {
                                destination = composition.layer(lowestIndex - 1);
                            }
                            parentLayer.moveBefore(destination);
                        }
                    }
                    var childLayers = utils_1.arrayFilter(selectedLayers, function(layer) {
                        return layer.name !== parentLayer.name;
                    });
                    var selectedPropertiesGetter = utils_1.propertiesToGetter(parentLayer.selectedProperties);
                    var properties = parentLayer.selectedProperties;
                    childLayers.forEach(function(childLayer) {
                        selectedPropertiesGetter(childLayer).forEach(function(property) {
                            while (property && property instanceof Property && property.canVaryOverTime && property.numKeys != 0) {
                                property.removeKey(1);
                            }
                        });
                    });
                    addDelay(parentLayer, childLayers, properties, keyframesEnabled, shyEnabled, compositionEnabled, false, guideEnabled);
                    if (compositionEnabled) {
                        var childLayerIndexes = childLayers.map(function(layer) {
                            return layer.index;
                        });
                        var preCompositionName = "".concat(name || parentLayer.name, " - children");
                        var existingComp = utils_1.findProjectItemByName(preCompositionName);
                        if (existingComp) {
                            preCompositionName = "".concat(utils_1.getUniqueNameFromLayers(composition.layers, name || parentLayer.name), " - children");
                        }
                        composition.layers.precompose(childLayerIndexes, preCompositionName, true);
                        if (shyEnabled) {
                            var preComposition = composition.layer(preCompositionName);
                            preComposition.shy = true;
                        }
                    }
                    if (shyEnabled) {
                        composition.hideShyLayers = true;
                    }
                    utils_1.deselectAll(composition);
                    parentLayer.selected = true;
                    selectedPropertiesGetter(parentLayer).forEach(function(property) {
                        if (!property || !isValid(property)) {
                            return;
                        }
                        property.selected = true;
                    });
                }, composition.selectedLayers.length < 4);
            }

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayers(composition, 2);
                var selectedProperties = utils_1.getSelectedPropertiesOnComposition(composition);
                var selectedPropertiesAreOnSingleLayer = true;
                try {
                    for (var selectedProperties_1 = __values(selectedProperties), selectedProperties_1_1 = selectedProperties_1.next(); !selectedProperties_1_1.done; selectedProperties_1_1 = selectedProperties_1.next()) {
                        var property = selectedProperties_1_1.value;
                        var layer = utils_1.getLayerForProperty(property);
                        if (lastLayer !== undefined && lastLayer !== layer) {
                            selectedPropertiesAreOnSingleLayer = false;
                            break;
                        }
                        lastLayer = layer;
                    }
                } catch (e_1_1) {
                    e_1 = {
                        error: e_1_1
                    };
                } finally {
                    try {
                        if (selectedProperties_1_1 && !selectedProperties_1_1.done && _a = selectedProperties_1["return"]) {
                            _a.call(selectedProperties_1)
                        }
                    } finally {
                        if (e_1) {
                            throw e_1.error
                        }
                    }
                }
                if (!selectedPropertiesAreOnSingleLayer) {
                    throw utils_1.WrappedError(new Error("Not all selected properties are on the same layer"), errors_1.NOT_ALL_SELECTED_PROPERTIES_ARE_ON_SAME_LAYER)
                }
                return;
            }
            exports.check = check;

            function run(name, keyframesEnabled, compositionEnabled, shyEnabled, guideEnabled) {
                var composition = utils_1.getComposition();
                check();
                utils_1.loadEffects();
                app.beginUndoGroup("Motion - Delay");
                runDelay(composition, keyframesEnabled, compositionEnabled, shyEnabled, name, guideEnabled);
                app.endUndoGroup();
                return {
                    success: true
                };
            }
            exports.run = run;
        },
        "./build/aeft/tools/disablestrokefill.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __values = this && this.__values || function(o) {
                    var s = typeof Symbol === "function" && Symbol.iterator;
                    var m = s && o[s];
                    var i = 0;
                    if (m) {
                        return m.call(o);
                    }
                    if (o && typeof o.length === "number") {
                        return {
                            next: function() {
                                if (o && i >= o.length) {
                                    o = void(0)
                                }
                                return {
                                    value: o && o[i++],
                                    done: !o
                                };
                            }
                        };
                    }
                    throw new TypeError((s ? "Object is not iterable." : "Symbol.iterator is not defined."))
                };
            exports.__esModule = true;
            exports.disableStrokeFill = exports.run = exports.check = void(0);
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var color_1 = __webpack_require__("./build/aeft/tools/color.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = composition.selectedLayers;
                if (selectedLayers.length > 0) {
                    try {
                        for (var selectedLayers_1 = __values(selectedLayers), selectedLayers_1_1 = selectedLayers_1.next(); !selectedLayers_1_1.done; selectedLayers_1_1 = selectedLayers_1.next()) {
                            var selectedLayer = selectedLayers_1_1.value;
                            if (selectedLayer instanceof ShapeLayer || selectedLayer instanceof TextLayer) {
                                return;
                            }
                        }
                    } catch (e_1_1) {
                        e_1 = {
                            error: e_1_1
                        };
                    } finally {
                        try {
                            if (selectedLayers_1_1 && !selectedLayers_1_1.done && _a = selectedLayers_1["return"]) {
                                _a.call(selectedLayers_1)
                            }
                        } finally {
                            if (e_1) {
                                throw e_1.error
                            }
                        }
                    }
                    throw utils_1.WrappedError(new Error("No selected layer is ShapeLayer or TextLayer"), errors_1.NO_SELECTED_LAYER_IS_SHAPELAYER_OR_TEXTLAYER)
                }
            }
            exports.check = check;

            function run(type) {
                if (type === void(0)) {
                    type = "fill";
                }
                app.beginUndoGroup("Disable stroke or fill");
                disableStrokeFill(type);
                app.endUndoGroup();
            }
            exports.run = run;

            function disableStrokeFill(type) {
                if (type === void(0)) {
                    type = "fill";
                }
                var composition = utils_1.getComposition();
                if (composition && composition instanceof CompItem) {
                    if (composition.selectedLayers.length > 0) {
                        composition.selectedLayers.map(function(layer) {
                            if (layer instanceof ShapeLayer) {
                                if (type === "fill") {
                                    var fills = color_1.findProperties(layer.property("ADBE Root Vectors Group"), "ADBE Vector Fill Color");
                                    var allFillsAreDeselected_1 = utils_1.arrayFilter(fills, function(property) {
                                        return property.parentProperty.parentProperty.parentProperty.selected === false;
                                    }).length === fills.length;
                                    fills.forEach(function(property) {
                                        if (!allFillsAreDeselected_1 && !property.parentProperty.parentProperty.parentProperty.selected) {
                                            return;
                                        }
                                        property.parentProperty.enabled = false;
                                    });
                                } else {
                                    var strokes = color_1.findProperties(layer.property("ADBE Root Vectors Group"), "ADBE Vector Stroke Color");
                                    var allStrokesAreDeselected_1 = utils_1.arrayFilter(strokes, function(property) {
                                        return property.parentProperty.parentProperty.parentProperty.selected === false;
                                    }).length === strokes.length;
                                    strokes.forEach(function(property) {
                                        if (!allStrokesAreDeselected_1 && !property.parentProperty.parentProperty.parentProperty.selected) {
                                            return;
                                        }
                                        property.parentProperty.enabled = false;
                                    });
                                }
                            } else {
                                if (layer instanceof TextLayer) {
                                    var textProperty = layer.property("ADBE Text Properties").property("ADBE Text Document");
                                    var textDocument = textProperty.value;
                                    if (type === "fill") {
                                        textDocument.applyFill = false;
                                    } else {
                                        textDocument.applyStroke = false;
                                    }
                                    textProperty.setValue(textDocument);
                                }
                            }
                        });
                    } else {
                        if (app.activeViewer !== null && app.activeViewer.views.length > 0) {
                            app.activeViewer.views[0].options.checkerboards = true;
                        }
                    }
                }
            }
            exports.disableStrokeFill = disableStrokeFill;
        },
        "./build/aeft/tools/dynamics.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.runDynamics = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var errors_1 = __webpack_require__("./build/aeft/errors.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayer(composition);
                for (var j = 0; j < composition.selectedProperties.length; j += 1) {
                    var selectedProperty = composition.selectedProperties[j];
                    if (selectedProperty.canVaryOverTime) {
                        return;
                    }
                }
                throw utils_1.WrappedError(new Error("No selected properties are keyframeable"), errors_1.NO_SELECTED_PROPERTIES_ARE_KEYFRAMEABLE)
            }
            exports.check = check;

            function minifier(code, map, disable) {
                if (disable === void(0)) {
                    disable = false;
                }
                if (disable) {
                    return code;
                }
                Object.keys(map).forEach(function(key) {
                    code = code.replace(new RegExp(key, "g"), map[key]);
                });
                var lines = code.split("\n").map(function(line) {
                    return line.trim();
                });
                var firstLine = lines.shift();
                return "".concat(firstLine, "\n").concat(lines.join(""));
            }
            var pseudos = {
                "1": {
                    pseudo: ffxMap_1["default"].dynamics1d.pseudo,
                    enable: ffxMap_1["default"].dynamics1d.enable,
                    type: ffxMap_1["default"].dynamics1d.type,
                    frequency: ffxMap_1["default"].dynamics1d.frequency,
                    amount: ffxMap_1["default"].dynamics1d.amount,
                    seed: ffxMap_1["default"].dynamics1d.seed,
                    getExpression: function(name, controllerLayer, isSame) {
                        var pseudo = pseudos[1];
                        return minifier("// Mt. Mograph - Motion 4 (1D Dynamics Expression)\n        var controllerLayer = ".concat((!isSame ? "thisComp.layer(".concat(JSON.stringify(controllerLayer.name), ")") : "thisLayer"), "(\"ADBE Effect Parade\");\n        var effectProperty = controllerLayer(").concat(JSON.stringify(name), ");\n        var enable = effectProperty(\"").concat(pseudo.enable, "\");\n        var wiggleType = effectProperty(\"").concat(pseudo.type, "\");\n        var frequency = effectProperty(\"").concat(pseudo.frequency, "\");\n        var amount = effectProperty(\"").concat(pseudo.amount, "\");\n        var seedValue = effectProperty(\"").concat(pseudo.seed, "\");\n        var newValue = value;\n        if (enable > 0) {\n          if (wiggleType == 1) {\n            seedRandom(seedValue * 1000);\n            newValue = wiggle(frequency, amount, 1, 1, time);\n          } else if (wiggleType == 2) {\n            seedRandom(seedValue);\n            var times = thisComp.duration * frequency;\n            var progress = (time / (thisComp.duration + thisComp.frameDuration));\n            newValue = wiggle(frequency, amount, 1, 1, Math.floor(times * progress));\n          }\n        }\n        newValue;"), {
                            controllerLayer: "a",
                            effectProperty: "b",
                            enable: "c",
                            wiggleType: "d",
                            frequency: "e",
                            amount: "f",
                            newValue: "g"
                        }, true) + ((("\n//META{\"tool\": \"dynamics\", \"controllerLayer\": ".concat)(JSON.stringify(controllerLayer.name), ", \"name\": \"").concat)(name, "\", \"effectIsOnThisLayer\": ").concat)(isSame, "}ENDMETA");
                    }
                },
                "2": {
                    pseudo: ffxMap_1["default"].dynamics2d.pseudo,
                    enable: ffxMap_1["default"].dynamics2d.enable,
                    type: ffxMap_1["default"].dynamics2d.type,
                    frequency: ffxMap_1["default"].dynamics2d.frequency,
                    amount: ffxMap_1["default"].dynamics2d.amount,
                    seperationEnable: ffxMap_1["default"].dynamics2d.seperation,
                    seperationX: ffxMap_1["default"].dynamics2d.seperationX,
                    seperationY: ffxMap_1["default"].dynamics2d.seperationY,
                    seed: ffxMap_1["default"].dynamics2d.seed,
                    getExpression: function(name, controllerLayer, isSame) {
                        var pseudo = pseudos[2];
                        return minifier("// Mt. Mograph - Motion 4 (2D Dynamics Expression)\n        var controllerLayer = ".concat((!isSame ? "thisComp.layer(".concat(JSON.stringify(controllerLayer.name), ")") : "thisLayer"), "(\"ADBE Effect Parade\");\n        var effectProperty = controllerLayer(").concat(JSON.stringify(name), ");\n        var enable = effectProperty(\"").concat(pseudo.enable, "\");\n        var wiggleType = effectProperty(\"").concat(pseudo.type, "\");\n        var frequency = effectProperty(\"").concat(pseudo.frequency, "\");\n        var amount = effectProperty(\"").concat(pseudo.amount, "\");\n        var seperationEnabled = effectProperty(\"").concat(pseudo.seperationEnable, "\");\n        var seperationX = effectProperty(\"").concat(pseudo.seperationX, "\");\n        var seperationY = effectProperty(\"").concat(pseudo.seperationY, "\");\n        var seedValue = effectProperty(\"").concat(pseudo.seed, "\");\n        var newValue;\n        if (enable > 0) {\n          if (wiggleType == 1) {\n            seedRandom(seedValue * 1000);\n            if (seperationEnabled > 0) {\n              if (seperationX.value === seperationY.value) {\n                wiggleVal = wiggle(frequency, seperationX, 1, 1, time)[0];\n                newValue = [\n                  wiggleVal,\n                  wiggleVal\n                ];\n              } else {\n                newValue = [\n                  wiggle(frequency, seperationX, 1, 1, time)[0],\n                  wiggle(frequency, seperationY, 1, 1, time)[1]\n                ];\n              }\n            } else {\n              newValue = wiggle(frequency, amount, 1, 1, time);\n            }\n          } else if (wiggleType == 2) {\n            seedRandom(seedValue);\n            var times = thisComp.duration * frequency;\n            var progress = (time / (thisComp.duration + thisComp.frameDuration));\n            var timeVal = Math.floor(times * progress);\n            if (seperationEnabled) {\n              if (seperationX.value === seperationY.value) {\n                wiggleVal = wiggle(frequency, seperationX, 1, 1, timeVal)[0];\n                newValue = [\n                  wiggleVal,\n                  wiggleVal\n                ];\n              } else {\n                newValue = [\n                  wiggle(frequency, seperationX, 1, 1, timeVal)[0],\n                  wiggle(frequency, seperationY, 1, 1, timeVal)[1]\n                ];\n              }\n            } else {\n              newValue = wiggle(frequency, amount, 1, 1, timeVal);\n            }\n          }\n        }\n        newValue || value;"), {
                            controllerLayer: "a",
                            effectProperty: "b",
                            enable: "c",
                            wiggleType: "d",
                            frequency: "e",
                            amount: "f",
                            newValue: "g",
                            seperationEnabled: "h",
                            seperationX: "i",
                            seperationY: "j"
                        }, true) + ((("\n//META{\"tool\": \"dynamics\", \"controllerLayer\": ".concat)(JSON.stringify(controllerLayer.name), ", \"name\": \"").concat)(name, "\", \"effectIsOnThisLayer\": ").concat)(isSame, "}ENDMETA");
                    }
                },
                "3": {
                    pseudo: ffxMap_1["default"].dynamics3d.pseudo,
                    enable: ffxMap_1["default"].dynamics3d.enable,
                    type: ffxMap_1["default"].dynamics3d.type,
                    frequency: ffxMap_1["default"].dynamics3d.frequency,
                    amount: ffxMap_1["default"].dynamics3d.amount,
                    seperationEnable: ffxMap_1["default"].dynamics3d.seperation,
                    seperationX: ffxMap_1["default"].dynamics3d.seperationX,
                    seperationY: ffxMap_1["default"].dynamics3d.seperationY,
                    seperationZ: ffxMap_1["default"].dynamics3d.seperationZ,
                    seed: ffxMap_1["default"].dynamics3d.seed,
                    getExpression: function(name, controllerLayer, isSame) {
                        var pseudo = pseudos[3];
                        return minifier("// Mt. Mograph - Motion 4 (3D Dynamics Expression)\n        var controllerLayer = ".concat((!isSame ? "thisComp.layer(".concat(JSON.stringify(controllerLayer.name), ")") : "thisLayer"), "(\"ADBE Effect Parade\");\n        var effectProperty = controllerLayer(").concat(JSON.stringify(name), ");\n        var enable = effectProperty(\"").concat(pseudo.enable, "\");\n        var wiggleType = effectProperty(\"").concat(pseudo.type, "\");\n        var frequency = effectProperty(\"").concat(pseudo.frequency, "\");\n        var amount = effectProperty(\"").concat(pseudo.amount, "\");\n        var seperationEnabled = effectProperty(\"").concat(pseudo.seperationEnable, "\");\n        var seperationX = effectProperty(\"").concat(pseudo.seperationX, "\");\n        var seperationY = effectProperty(\"").concat(pseudo.seperationY, "\");\n        var seperationZ = effectProperty(\"").concat(pseudo.seperationZ, "\");\n        var seedValue = effectProperty(\"").concat(pseudo.seed, "\");\n        var newValue;\n        if (enable > 0) {\n          if (wiggleType == 1) {\n            seedRandom(seedValue * 1000);\n            if (seperationEnabled > 0) {\n\t\t\t\t\t\t\tif (seperationX.value === seperationY.value && effectProperty === controllerLayer(\"[d] Scale\")) {\n                wiggleVal = wiggle(frequency, seperationX, 1, 1, time)[0];\n                newValue = [\n                  wiggleVal,\n                  wiggleVal\n                ];\n              } else {\n                newValue = [\n                  wiggle(frequency, seperationX, 1, 1, time)[0],\n                  wiggle(frequency, seperationY, 1, 1, time)[1]\n                ];\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tif (value.length === 3) {\n\t\t\t\t\t\t\t\tnewValue.push(wiggle(frequency, seperationZ, 1, 1, time)[2]);\n\t\t\t\t\t\t\t}\t\n            } else {\n              newValue = wiggle(frequency, amount, 1, 1, time);\n            }\n          } else if (wiggleType == 2) {\n            seedRandom(seedValue);\n            var times = thisComp.duration * frequency;\n            var progress = (time / (thisComp.duration + thisComp.frameDuration));\n            var timeVal = Math.floor(times * progress);\n            if (seperationEnabled > 0) {\n\t\t\t\tnewValue = [\n\t\t\t\t\twiggle(frequency, seperationX, 1, 1, timeVal)[0],\n\t\t\t\t\twiggle(frequency, seperationY, 1, 1, timeVal)[1]\n\t\t\t\t];\n\t\t\t\tif (value.length === 3) {\n\t\t\t\t\tnewValue.push(wiggle(frequency, seperationZ, 1, 1, timeVal)[2]);\n\t\t\t\t}\n            } else {\n              newValue = wiggle(frequency, amount, 1, 1, timeVal);\n            }\n          }\n        }\n        newValue || value;"), {
                            controllerLayer: "a",
                            effectProperty: "b",
                            enable: "c",
                            wiggleType: "d",
                            frequency: "e",
                            amount: "f",
                            newValue: "g",
                            seperationEnabled: "h",
                            seperationX: "i",
                            seperationY: "j",
                            seperationZ: "k"
                        }, true) + ((("\n//META{\"tool\": \"dynamics\", \"controllerLayer\": ".concat)(JSON.stringify(controllerLayer.name), ", \"name\": \"").concat)(name, "\", \"effectIsOnThisLayer\": ").concat)(isSame, "}ENDMETA");
                    }
                }
            };

            function runDynamics(layers, composition, alt) {
                var selectedProperties = [];
                var layersWithSelectedProps = 0;
                layers.forEach(function(layer) {
                    var propertiesGetters = (utils_1.arrayFilter(layer.selectedProperties, function(p) {
                        return p instanceof Property && p.canSetExpression;
                    }).map)(utils_1.propertyToGetter);
                    var propsOnLayer = 0;
                    propertiesGetters.forEach(function(getter) {
                        var property = getter(layer);
                        if (property instanceof PropertyGroup || property instanceof MaskPropertyGroup || property.matchName.indexOf("ADBE Vector Shape") > -1 || !("canVaryOverTime" in property)) {
                            return;
                        }
                        propsOnLayer += 1;
                        selectedProperties.push(property);
                    });
                    if (propsOnLayer > 0) {
                        layersWithSelectedProps += 1;
                    }
                });
                if (layersWithSelectedProps > 1) {
                    layers.forEach(function(layer) {
                        var controllerLayer = layer;
                        var propertiesGetters = (utils_1.arrayFilter(layer.selectedProperties, function(p) {
                            return p instanceof Property && p.canSetExpression;
                        }).map)(utils_1.propertyToGetter);
                        if (layer instanceof CameraLayer || layer instanceof LightLayer) {
                            var controllerLayerName_1 = "[d] ".concat(layer.name, " controller");
                            controllerLayer = composition.layer(controllerLayerName_1);
                            if (!controllerLayer) {
                                utils_1.restoreSelectionAfter(function() {
                                    controllerLayer = composition.layers.addNull();
                                    controllerLayer.name = controllerLayerName_1;
                                });
                            }
                        }
                        propertiesGetters.forEach(function(getter) {
                            var property = getter(layer);
                            if (property instanceof PropertyGroup || property instanceof MaskPropertyGroup || property.matchName.indexOf("ADBE Vector Shape") > -1 || !("canVaryOverTime" in property)) {
                                return;
                            }
                            var name = utils_1.getUniqueName(utils_1.propertyGroupToArray(controllerLayer.property("ADBE Effect Parade")).map(function(property) {
                                return property.name;
                            }), "[d] ".concat(property.name));
                            if (utils_1.isOneDProperty(property)) {
                                pseudo = pseudos[1];
                            } else if (utils_1.isTwoDProperty(property)) {
                                pseudo = pseudos[2];
                            } else if (utils_1.isThreeDProperty(property) || utils_1.isColorProperty(property)) {
                                pseudo = pseudos[3];
                            } else {
                                return;
                            }
                            utils_1.ensureEffect(controllerLayer, name, pseudo.pseudo);
                            if (alt) {
                                var seedProperty = utils_1.ensureEffect(controllerLayer, name, pseudo.pseudo).property(pseudo.seed);
                                seedProperty.setValue((Math.random() * 10).toFixed(1));
                            }
                            property = getter(layer);
                            var expression = pseudo.getExpression(name, controllerLayer, controllerLayer === layer);
                            property.expression = expression;
                        });
                    });
                } else {
                    layers.forEach(function(layer) {
                        var controllerLayer = layer;
                        var propertiesGetters = selectedProperties.map(utils_1.propertyToGetter);
                        if (layer instanceof CameraLayer || layer instanceof LightLayer) {
                            var controllerLayerName_2 = "[d] ".concat(layer.name, " controller");
                            controllerLayer = composition.layer(controllerLayerName_2);
                            if (!controllerLayer) {
                                utils_1.restoreSelectionAfter(function() {
                                    controllerLayer = composition.layers.addNull();
                                    controllerLayer.name = controllerLayerName_2;
                                });
                            }
                        }
                        propertiesGetters.forEach(function(getter) {
                            var property = getter(layer);
                            var name = utils_1.getUniqueName(utils_1.propertyGroupToArray(controllerLayer.property("ADBE Effect Parade")).map(function(property) {
                                return property.name;
                            }), "[d] ".concat(property.name));
                            if (utils_1.isOneDProperty(property)) {
                                pseudo = pseudos[1];
                            } else if (utils_1.isTwoDProperty(property)) {
                                pseudo = pseudos[2];
                            } else if (utils_1.isThreeDProperty(property) || utils_1.isColorProperty(property)) {
                                pseudo = pseudos[3];
                            } else {
                                return;
                            }
                            utils_1.ensureEffect(controllerLayer, name, pseudo.pseudo);
                            if (alt) {
                                var seedProperty = utils_1.ensureEffect(controllerLayer, name, pseudo.pseudo).property(pseudo.seed);
                                seedProperty.setValue((Math.random() * 10).toFixed(1));
                            }
                            property = getter(layer);
                            var expression = pseudo.getExpression(name, controllerLayer, controllerLayer === layer);
                            property.expression = expression;
                        });
                    });
                }
            }
            exports.runDynamics = runDynamics;

            function run(alt) {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                utils_1.undoable("Motion 4 - Dynamics", function() {
                    return utils_1.fast(function() {
                        return runDynamics(composition.selectedLayers, composition, alt);
                    });
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/easein.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedProperties = utils_1.getSelectedPropertiesOnComposition(composition, 1);
                var propertiesHaveKeyframes = false;
                for (var j = 0; j < selectedProperties.length; j += 1) {
                    var selectedProperty = selectedProperties[j];
                    if (selectedProperty instanceof PropertyGroup) {
                        continue;
                    }
                    if (selectedProperty.canVaryOverTime && selectedProperty.selectedKeys.length > 0) {
                        propertiesHaveKeyframes = true;
                    }
                }
                if (!propertiesHaveKeyframes) {
                    throw utils_1.WrappedError(new Error("Selected properties do not have at least 1 keyframe"), errors_1.NOT_ENOUGH_SELECTED_KEYFRAMES_ON_SELECTED_PROPERTIES)
                }
                return {
                    composition: composition,
                    selectedProperties: selectedProperties
                };
            }
            exports.check = check;

            function run(number) {
                if (number < 0.1) {
                    number = 0.1;
                }
                app.beginUndoGroup("Ease In");
                var composition = utils_1.getComposition();
                for (var i = 0; i < composition.selectedLayers.length; i += 1) {
                    var selectedLayer = composition.selectedLayers[i];
                    for (var j = 0; j < selectedLayer.selectedProperties.length; j += 1) {
                        var selectedProperty = selectedLayer.selectedProperties[j];
                        if (selectedProperty.canVaryOverTime) {
                            for (var k = 0; k < selectedProperty.selectedKeys.length; k += 1) {
                                var easeIn = new KeyframeEase(0, number);
                                var firstTemporalEase = selectedProperty.keyOutTemporalEase(selectedProperty.selectedKeys[k])[0];
                                var influenceAdjusted = firstTemporalEase.influence;
                                if (influenceAdjusted < 0.1) {
                                    influenceAdjusted = 0.1;
                                }
                                var easeOut = new KeyframeEase(firstTemporalEase.speed, influenceAdjusted);
                                switch (selectedProperty.propertyValueType) {
                                    case PropertyValueType.ThreeD:
                                        selectedProperty.setTemporalEaseAtKey(selectedProperty.selectedKeys[k], [easeIn, easeIn, easeIn], [easeOut, easeOut, easeOut]);
                                        break;
                                    case PropertyValueType.TwoD:
                                        selectedProperty.setTemporalEaseAtKey(selectedProperty.selectedKeys[k], [easeIn, easeIn], [easeOut, easeOut]);
                                        break;
                                    default:
                                        selectedProperty.setTemporalEaseAtKey(selectedProperty.selectedKeys[k], [easeIn], [easeOut]);
                                        break;
                                }
                            }
                        }
                    }
                }
                app.endUndoGroup();
                return JSON.stringify({
                    success: true
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/easekey.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var errors_1 = __webpack_require__("./build/aeft/errors.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedProperties = utils_1.getSelectedPropertiesOnComposition(composition, 1);
                var propertiesHaveKeyframes = false;
                for (var j = 0; j < selectedProperties.length; j += 1) {
                    var selectedProperty = selectedProperties[j];
                    if (selectedProperty instanceof PropertyGroup) {
                        continue;
                    }
                    if (selectedProperty.canVaryOverTime && selectedProperty.selectedKeys.length > 0) {
                        propertiesHaveKeyframes = true;
                    }
                }
                if (!propertiesHaveKeyframes) {
                    throw utils_1.WrappedError(new Error("Selected properties do not have at least 1 keyframe"), errors_1.NOT_ENOUGH_SELECTED_KEYFRAMES_ON_SELECTED_PROPERTIES)
                }
                return {
                    composition: composition,
                    selectedProperties: selectedProperties
                };
            }
            exports.check = check;

            function setKeyframeInterpolation(type, prop, key) {
                switch (type) {
                    case "auto-bezier":
                        prop.setTemporalContinuousAtKey(key, true);
                        prop.setTemporalAutoBezierAtKey(key, true);
                        prop.setInterpolationTypeAtKey(key, KeyframeInterpolationType.BEZIER);
                        break;
                    case "hold":
                        prop.setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
                        break;
                    case "linear":
                        prop.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
                }
            }

            function run(easeKeyType) {
                app.beginUndoGroup("Ease Keyframe");
                var composition = utils_1.getComposition();
                for (var i = 0; i < composition.selectedLayers.length; i += 1) {
                    var selectedLayer = composition.selectedLayers[i];
                    for (var j = 0; j < selectedLayer.selectedProperties.length; j += 1) {
                        var selectedProperty = selectedLayer.selectedProperties[j];
                        if (selectedProperty.canVaryOverTime) {
                            for (var k = 0; k < selectedProperty.selectedKeys.length; k += 1) {
                                setKeyframeInterpolation(easeKeyType, selectedProperty, selectedProperty.selectedKeys[k]);
                            }
                        }
                    }
                }
                app.endUndoGroup();
                return JSON.stringify({
                    success: true
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/easeout.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedProperties = utils_1.getSelectedPropertiesOnComposition(composition, 1);
                var propertiesHaveKeyframes = false;
                for (var j = 0; j < selectedProperties.length; j += 1) {
                    var selectedProperty = selectedProperties[j];
                    if (selectedProperty instanceof PropertyGroup) {
                        continue;
                    }
                    if (selectedProperty.canVaryOverTime && selectedProperty.selectedKeys.length > 0) {
                        propertiesHaveKeyframes = true;
                    }
                }
                if (!propertiesHaveKeyframes) {
                    throw utils_1.WrappedError(new Error("Selected properties do not have at least 1 keyframe"), errors_1.NOT_ENOUGH_SELECTED_KEYFRAMES_ON_SELECTED_PROPERTIES)
                }
                return {
                    composition: composition,
                    selectedProperties: selectedProperties
                };
            }
            exports.check = check;

            function run(number) {
                if (number < 0.1) {
                    number = 0.1;
                }
                app.beginUndoGroup("Ease Out");
                var composition = utils_1.getComposition();
                for (var i = 0; i < composition.selectedLayers.length; i += 1) {
                    var selectedLayer = composition.selectedLayers[i];
                    for (var j = 0; j < selectedLayer.selectedProperties.length; j += 1) {
                        var selectedProperty = selectedLayer.selectedProperties[j];
                        if (selectedProperty.canVaryOverTime) {
                            for (var k = 0; k < selectedProperty.selectedKeys.length; k += 1) {
                                var easeOut = new KeyframeEase(0, number);
                                var firstTemporalEase = selectedProperty.keyInTemporalEase(selectedProperty.selectedKeys[k])[0];
                                var influenceAdjusted = firstTemporalEase.influence;
                                if (influenceAdjusted < 0.1) {
                                    influenceAdjusted = 0.1;
                                }
                                var easeIn = new KeyframeEase(firstTemporalEase.speed, influenceAdjusted);
                                switch (selectedProperty.propertyValueType) {
                                    case PropertyValueType.ThreeD:
                                        selectedProperty.setTemporalEaseAtKey(selectedProperty.selectedKeys[k], [easeIn, easeIn, easeIn], [easeOut, easeOut, easeOut]);
                                        break;
                                    case PropertyValueType.TwoD:
                                        selectedProperty.setTemporalEaseAtKey(selectedProperty.selectedKeys[k], [easeIn, easeIn], [easeOut, easeOut]);
                                        break;
                                    default:
                                        selectedProperty.setTemporalEaseAtKey(selectedProperty.selectedKeys[k], [easeIn], [easeOut]);
                                        break;
                                }
                            }
                        }
                    }
                }
                app.endUndoGroup();
                return JSON.stringify({
                    success: true
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/easepick.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var easeout_1 = __webpack_require__("./build/aeft/tools/easeout.js");
            var easein_1 = __webpack_require__("./build/aeft/tools/easein.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var errors_1 = __webpack_require__("./build/aeft/errors.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedProperties = utils_1.getSelectedPropertiesOnComposition(composition, 1);
                var propertiesHaveKeyframes = false;
                for (var j = 0; j < selectedProperties.length; j += 1) {
                    var selectedProperty = selectedProperties[j];
                    if (selectedProperty instanceof PropertyGroup) {
                        continue;
                    }
                    if (selectedProperty.canVaryOverTime && selectedProperty.selectedKeys.length > 0) {
                        propertiesHaveKeyframes = true;
                    }
                }
                if (!propertiesHaveKeyframes) {
                    throw utils_1.WrappedError(new Error("Selected properties do not have at least 1 keyframe"), errors_1.NOT_ENOUGH_SELECTED_KEYFRAMES_ON_SELECTED_PROPERTIES)
                }
                return {
                    composition: composition,
                    selectedProperties: selectedProperties
                };
            }
            exports.check = check;

            function run(easeOutVal, easeInVal) {
                easeout_1.run(easeOutVal);
                easein_1.run(easeInVal);
                return JSON.stringify({
                    success: true
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/echo.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var delay_1 = __webpack_require__("./build/aeft/tools/delay.js");
            var MIDAS_PREFIX = "[m] ";

            function check() {
                var composition = utils_1.getComposition();
                var layers = utils_1.getSelectedLayers(composition, 1);
                utils_1.selectedLayersAreAV(layers);
            }
            exports.check = check;

            function run(name, duplicateCount, keyframesEnabled, compositionEnabled, shyEnabled) {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                utils_1.loadEffects();
                utils_1.undoable("Motion 4 - Echo", function() {
                    return utils_1.fast(function() {
                        return runDuplicate(composition, selectedLayers, compositionEnabled, keyframesEnabled, shyEnabled, duplicateCount, name);
                    });
                });
            }
            exports.run = run;

            function delayDuplicate(parentLayer, originalLayer, properties, duplicateCount, keyframesEnabled, shyEnabled, compositionEnabled) {
                var copies = [];
                var unmodifiedOriginalLayerName = originalLayer.name;
                originalLayer.name = "".concat(originalLayer.name, "_1");
                copies.push(originalLayer);
                for (var i = 0; i < properties.length; i += 1) {
                    var property = properties[i];
                    if (property.canVaryOverTime) {
                        while (property.numKeys !== 0) {
                            property.removeKey(1);
                        }
                    }
                }
                delay_1.addDelay(parentLayer, [originalLayer], properties, keyframesEnabled, shyEnabled, compositionEnabled, false, true);
                for (var i = 1; i < duplicateCount; i += 1) {
                    var copy = originalLayer.duplicate();
                    copy.name = "".concat(unmodifiedOriginalLayerName, "_").concat(i + 1);
                    copy.moveAfter(copies[copies.length - 1]);
                    copies.push(copy);
                }
                return copies;
            }

            function simpleDuplicate(originalLayer, duplicateCount, compositionEnabled, shyEnabled) {
                var lastCopy = originalLayer;
                var copies = [];
                for (var i = 0; i < duplicateCount; i += 1) {
                    var copy = originalLayer.duplicate();
                    copy.name = "".concat(originalLayer.name, "_").concat(i + 1);
                    var shapeProperty = utils_1.getPropertyAtPath(copy, ["ADBE Root Vectors Group", "ADBE Vector Group", "ADBE Vectors Group", "ADBE Vector Shape - Group", "ADBE Vector Shape"]);
                    if (shapeProperty) {
                        while (shapeProperty.numKeys !== 0) {
                            shapeProperty.removeKey(1);
                        }
                        var compAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(originalLayer.containingComp.name), ").layer(").concat(JSON.stringify(originalLayer.name), ")") : "thisComp.layer(".concat(JSON.stringify(originalLayer.name), ")"));
                        var propertyPath = utils_1.toPropertyPath(false)(shapeProperty);
                        shapeProperty.expression = "".concat(compAccessor, "(\"").concat(propertyPath.join("\")(\""), "\")");
                    }
                    copy.moveAfter(lastCopy);
                    copies.push(copy);
                    lastCopy = copy;
                    if (!compositionEnabled && shyEnabled) {
                        copy.shy = true;
                    }
                }
                return copies;
            }

            function someSelectedPropertiesAreKeyframeable(composition) {
                var selectedProperties = composition.selectedProperties;
                for (var j = 0; j < selectedProperties.length; j += 1) {
                    var selectedProperty = selectedProperties[j];
                    if (selectedProperty.canVaryOverTime) {
                        return true;
                    }
                }
                return false;
            }

            function runDuplicate(composition, selectedLayers, compositionEnabled, keyframesEnabled, shyEnabled, duplicateCount, name) {
                if (someSelectedPropertiesAreKeyframeable(composition)) {
                    var parentLayers = [];
                    var propertyGetterForLayer_1 = [];
                    var collectedLayerNames = [];
                    var collectedCopies_1 = [];
                    for (var i = 0; i < selectedLayers.length; i += 1) {
                        var properties = (selectedLayers[i]).selectedProperties;
                        propertyGetterForLayer_1[i] = utils_1.propertiesToGetter(properties);
                        properties.forEach(function(property) {
                            if (!property || !isValid(property)) {
                                return;
                            }
                            property.expressionEnabled = false;
                        });
                    }
                    var _loop_1 = function(i) {
                        var selectedLayer = selectedLayers[i];
                        collectedLayerNames.push(selectedLayer.name);
                        if (selectedLayer instanceof AVLayer && selectedLayer.source instanceof CompItem) {
                            selectedLayer.name = "".concat(selectedLayer.name, " 1");
                        }
                        utils_1.restoreSelectionAfter(function() {
                            parentLayer = selectedLayer.duplicate();
                            if (name) {
                                var namePostfix = (i === 0 ? "" : " ".concat(i));
                                var customName = utils_1.getUniqueNameFromLayers(composition.layers, MIDAS_PREFIX + "".concat(name).concat(namePostfix));
                                parentLayer.name = customName;
                            } else {
                                var uniqueName = utils_1.getUniqueNameFromLayers(composition.layers, MIDAS_PREFIX + selectedLayer.name);
                                parentLayer.name = uniqueName;
                            }
                        });
                        parentLayers.push(parentLayer);
                        collectedCopies_1[i] = delayDuplicate(parentLayer, selectedLayer, propertyGetterForLayer_1[i](selectedLayer), duplicateCount, keyframesEnabled, shyEnabled, compositionEnabled);
                        (collectedCopies_1[i]).forEach(function(copy) {
                            var shapeProperty = utils_1.getPropertyAtPath(copy, ["ADBE Root Vectors Group", "ADBE Vector Group", "ADBE Vectors Group", "ADBE Vector Shape - Group", "ADBE Vector Shape"]);
                            if (shapeProperty) {
                                var compAccessor = (compositionEnabled ? "comp(".concat(JSON.stringify(parentLayer.containingComp.name), ").layer(").concat(JSON.stringify(parentLayer.name), ")") : "thisComp.layer(".concat(JSON.stringify(parentLayer.name), ")"));
                                var propertyPath = utils_1.toPropertyPath(false)(shapeProperty);
                                shapeProperty.expression = "".concat(compAccessor, "(\"").concat(propertyPath.join("\")(\""), "\")");
                            }
                        });
                        selectedLayer.selected = false;
                    };
                    for (var i = 0; i < selectedLayers.length; i += 1) {
                        _loop_1(i);
                    }
                    parentLayers.forEach(function(parentLayer, i) {
                        var properties = propertyGetterForLayer_1[i](parentLayer);
                        properties.forEach(function(property) {
                            if (!property || !isValid(property)) {
                                return;
                            }
                            property.expressionEnabled = true;
                            property.selected = true;
                        });
                        parentLayer.guideLayer = true;
                        parentLayer.label = 2;
                        parentLayer.selected = true;
                        parentLayer.moveBefore(selectedLayers[i]);
                    });
                    if (compositionEnabled) {
                        parentLayers.forEach(function(parentLayer, i) {
                            var preCompositionName = "".concat(parentLayer.name, "-children");
                            utils_1.restoreSelectionAfter(function() {
                                var childLayerIndexes = (collectedCopies_1[i]).map(function(childLayer) {
                                    return childLayer.index;
                                });
                                parentLayer.containingComp.layers.precompose(childLayerIndexes, preCompositionName, true);
                            });
                            if (shyEnabled) {
                                var precomp = composition.layer(preCompositionName);
                                precomp.selected = false;
                                precomp.shy = true;
                            }
                        });
                    }
                    if (shyEnabled) {
                        composition.hideShyLayers = true;
                    }
                } else {
                    var copiesForLayer_1 = [];
                    for (var i = 0; i < selectedLayers.length; i += 1) {
                        var originalLayer = selectedLayers[i];
                        copiesForLayer_1.push(simpleDuplicate(originalLayer, duplicateCount, compositionEnabled, shyEnabled));
                    }
                    if (compositionEnabled) {
                        selectedLayers.forEach(function(selectedLayer, i) {
                            var preCompositionName = "".concat(selectedLayer.name, " - children");
                            utils_1.restoreSelectionAfter(function() {
                                var childLayerIndexes = (copiesForLayer_1[i]).map(function(childLayer) {
                                    return childLayer.index;
                                });
                                selectedLayer.containingComp.layers.precompose(childLayerIndexes, preCompositionName, true);
                            });
                            if (shyEnabled) {
                                var precomp = composition.layer(preCompositionName);
                                precomp.selected = false;
                                precomp.shy = true;
                            }
                        });
                    }
                    if (shyEnabled) {
                        composition.hideShyLayers = true;
                    }
                }
            }
        },
        "./build/aeft/tools/excite.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.test = exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayer = utils_1.getSelectedLayer(composition);
                utils_1.getSelectedPropertiesOnLayer(selectedLayer, 1);
            }
            exports.check = check;

            function run() {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Excite");
                utils_1.fast(function() {
                    var selectedLayers = composition.selectedLayers;
                    var presetName = "";
                    var layerPropertyGetters = selectedLayers.map(function(selectedLayer) {
                        return {
                            layer: selectedLayer,
                            propertyGetters: (utils_1.arrayFilter(selectedLayer.selectedProperties, function(p) {
                                return p instanceof Property && p.canSetExpression && utils_1.isOneDProperty(p) || utils_1.isTwoDProperty(p) || utils_1.isThreeDProperty(p);
                            }).map)(utils_1.propertyToGetter)
                        };
                    });
                    layerPropertyGetters.forEach(function(_a) {
                        var selectedLayer = _a.layer;
                        var propertyGetters = _a.propertyGetters;
                        propertyGetters.forEach(function(pg) {
                            var selectedProperty = pg(selectedLayer);
                            var parentName = "";
                            try {
                                var firstParent = selectedProperty.parentProperty;
                                parentMatchName = firstParent.matchName;
                                parentName = firstParent.name;
                                currentName = selectedProperty.name;
                            } catch (err) {

                            }
                            if (parentMatchName === "ADBE Transform Group") {
                                presetName = "Excite - " + currentName;
                            } else {
                                presetName = "Excite - " + parentName + " - " + currentName;
                            }
                            if (presetName.length > 30) {
                                presetName = presetName.substr(0, 30);
                            }
                            var exciteExp = (((((((("\n\t\t\t\ttry {\n\t\t\t\t\tenable = effect(\"".concat)(presetName, "\")(\"").concat)(ffxMap_1["default"].excite.enable, "\")\n\t\t\t\t\tif (enable == 0) {\n\t\t\t\t\t\tvalue\n\t\t\t\t\t} else {\n\t\t\t\t\t\tamp = effect(\"").concat)(presetName, "\")(\"").concat)(ffxMap_1["default"].excite.overshoot, "\") / 2.5\n\t\t\t\t\t\tfreq = effect(\"").concat)(presetName, "\")(\"").concat)(ffxMap_1["default"].excite.bounce, "\") / 20\n\t\t\t\t\t\tdecay = effect(\"").concat)(presetName, "\")(\"").concat)(ffxMap_1["default"].excite.friction, "\") / 20\n\t\t\t\t\t\tn = 0,\n\t\t\t\t\t\t0 < numKeys\n\t\t\t\t\t\t\t&& (n = nearestKey(time).index, key(n).time > time && n--),\n\t\t\t\t\t\t\tt = 0 === n ? 0 : time - key(n).time,\n\t\t\t\t\t\t\t0 < n\n\t\t\t\t\t\t\t\t? (v = velocityAtTime(key(n).time - thisComp.frameDuration / 10),\n\t\t\t\t\t\t\t\tvalue + v / 100 * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t)\n\t\t\t\t\t\t\t) : value;\n\t\t\t\t\t}\n\t\t\t\t} catch (err) {\n\t\t\t\t\tvalue = value; \n\t\t\t\t}");
                            if (selectedProperty.canSetExpression) {
                                selectedProperty.expression = exciteExp;
                            }
                            var effectPropertyGroup = selectedLayer.property("ADBE Effect Parade");
                            if (effectPropertyGroup.property(presetName) !== null) {
                                return;
                            }
                            var exciteEffect = effectPropertyGroup.addProperty(ffxMap_1["default"].excite.pseudo);
                            exciteEffect.name = presetName;
                            var exciteEnable = exciteEffect.property(ffxMap_1["default"].excite.enable);
                            exciteEnable.setValue(1);
                            var exciteOvershoot = exciteEffect.property(ffxMap_1["default"].excite.overshoot);
                            exciteOvershoot.expression = "clamp(value, 0,100);";
                            exciteOvershoot.setValue(20);
                            var exciteBounce = exciteEffect.property(ffxMap_1["default"].excite.bounce);
                            exciteBounce.expression = "clamp(value, 0,100);";
                            exciteBounce.setValue(40);
                            var exciteFriction = exciteEffect.property(ffxMap_1["default"].excite.friction);
                            exciteFriction.expression = "clamp(value, 0,100);";
                            exciteFriction.setValue(40);
                        });
                    });
                }, composition.selectedLayers.length < 4);
                app.endUndoGroup();
            }
            exports.run = run;

            function test() {
                var composition = app.project.items.addComp("Excite Test", 500, 500, 1, 10, 30);
                composition.openInViewer();
                var solid1 = composition.layers.addSolid([0, 1, 0], "Solid 1", 200, 200, 1, 10);
                solid1.name = "Solid 1";
                solid1.rotation.selected = true;
                run();
            }
            exports.test = test;
        },
        "./build/aeft/tools/falloff.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayer = utils_1.getSelectedLayer(composition);
                utils_1.getSelectedPropertiesOnLayer(selectedLayer, 1);
            }
            exports.check = check;
            var minifyMap = {
                controllerLayer: "a",
                effectorPosition: "b",
                inversion: "c",
                falloff: "d",
                outerRing: "f",
                innerRing: "g",
                samplePoint: "h",
                distance: "i",
                distanceSq: "j",
                multiplier: "k",
                variableX: "l",
                variableY: "m",
                variableZ: "n",
                scaleValue: "o"
            };

            function minifier(code, map) {
                Object.keys(map).forEach(function(key) {
                    code = code.replace(new RegExp(key, "g"), map[key]);
                });
                var lines = code.split("\n").map(function(line) {
                    return line.trim();
                });
                var firstLine = lines.shift();
                return "".concat(firstLine, "\n").concat(lines.join(""));
            }

            function findOrCreateController(composition) {
                var foundControllers = utils_1.arrayFilter(composition.selectedLayers, function(sl) {
                    return sl.name.indexOf(">>Controller") > -1;
                });
                if (foundControllers.length === 0 || composition.selectedLayers.length === 1 && foundControllers.length === 1) {
                    var controllerLayerName = utils_1.getUniqueNameFromLayers(composition.layers, ">>Controller");
                    controllerLayer = composition.layers.addShape();
                    controllerLayer.name = controllerLayerName;
                    controllerLayer.guideLayer = true;
                    var outerCircle = controllerLayer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
                    outerCircle.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
                    outerCircle.property("ADBE Vectors Group").property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([300, 300]);
                    outerCircle.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
                    outerCircle.property("ADBE Vectors Group").property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Color").setValue([0.65, 1, 0.3, 1]);
                    outerCircle.name = "outerCircle";
                    var middleCircle = controllerLayer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
                    middleCircle.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
                    middleCircle.property("ADBE Vectors Group").property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([300, 300]);
                    middleCircle.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
                    middleCircle.property("ADBE Vectors Group").property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Color").setValue([1, 0.03, 0.03, 1]);
                    middleCircle.name = "middleCircle";
                    var controlLayer = controllerLayer("ADBE Effect Parade").addProperty(ffxMap_1["default"].falloff.pseudo);
                    controlLayer.property(ffxMap_1["default"].falloff.falloff).setValue(50);
                    controlLayer.property(ffxMap_1["default"].falloff.falloff).expression = "value > 100 ? 100 : value;";
                    controlLayer.name = "Falloff Master";
                    middleCircle.property("ADBE Vectors Group").property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").expression = "temp = thisComp.layer(\"" + controllerLayer.name + "\").effect(\"Falloff Master\")(\"" + ffxMap_1["default"].falloff.falloff + "\");\n" + "[temp * 3, temp * 3];";
                    controllerLayer.property("ADBE Transform Group").property("ADBE Scale").expression = "temp = Math.abs(transform.scale[0]);\n[temp, temp]";
                } else {
                    controllerLayer = foundControllers[0];
                }
                return controllerLayer;
            }
            var nameCounts = {};

            function getUniquePropertyName(property) {
                try {
                    var firstParent = property.parentProperty;
                    parentMatchName = firstParent.matchName;
                    parentName = firstParent.name;
                    currentName = property.name;
                } catch (err) {

                }
                if (parentMatchName === "ADBE Transform Group") {
                    presetName = "Falloff - " + currentName;
                } else {
                    presetName = "Falloff - " + currentName + " - " + parentName;
                }
                if (!nameCounts.hasOwnProperty(presetName)) {
                    nameCounts[presetName] = 0;
                } else {
                    nameCounts[presetName] = nameCounts[presetName] + 1;
                    presetName = presetName + " " + nameCounts[presetName];
                }
                return presetName;
            }

            function applyExpression(property, controllerLayer, modifierName) {
                switch (property.propertyValueType) {
                    case PropertyValueType.OneD:
                        var modifierControl = controllerLayer("ADBE Effect Parade").property(modifierName);
                        if (!modifierControl) {
                            modifierControl = controllerLayer("ADBE Effect Parade").addProperty(ffxMap_1["default"].falloff1d.pseudo);
                            modifierControl.name = modifierName;
                            modifierControl.property(ffxMap_1["default"].falloff1d.x).setValue(0);
                        }
                        property.expression = minifier(((("// Mt. Mograph - Motion 4 (Falloff Expression)\n      controllerLayer = thisComp.layer(\"".concat(controllerLayer.name, "\");\n      effectorPosition = controllerLayer.position.value;\n      inversion = controllerLayer.effect(\"Falloff Master\")(\"").concat(ffxMap_1["default"].falloff.invert, "\");\n      isEnabled = controllerLayer.effect(\"Falloff Master\")(\"").concat(ffxMap_1["default"].falloff.enable, "\");\n      if (isEnabled == 0) {\n        value;\n      } else {\n        falloff = controllerLayer.effect(\"Falloff Master\")(\"").concat)(ffxMap_1["default"].falloff.falloff, "\").value / 100;\n        scaleValue = controllerLayer.scale.value[0] / 100;\n        outerRing = (scaleValue * 300) / 2;\n        innerRing = (outerRing * falloff);\n        samplePoint = thisLayer.toWorld(thisLayer.anchorPoint);\n        dx = effectorPosition[0] - samplePoint[0];\n        dy = effectorPosition[1] - samplePoint[1];\n        distanceSq = dx * dx + dy * dy;\n        distance = Math.sqrt(distanceSq);\n        var multiplier;\n        if (distance > outerRing) {\n          multiplier = 0;\n        } else if (distance < innerRing) {\n          multiplier = 1;\n        } else {\n          multiplier = 1 - (distance - innerRing) / (outerRing - innerRing);\n        }\n        variableX = controllerLayer.effect(\"").concat)(modifierName, "\")(\"").concat)(ffxMap_1["default"].falloff1d.x, "\") * -1;\n        if (inversion > 0) {\n          value - (variableX * (1 - multiplier));\n        } else {\n          value - (variableX * multiplier);\n        }\n      }"), minifyMap);
                        break;
                    case PropertyValueType.TwoD:
                    case PropertyValueType.TwoD_SPATIAL:
                        var modifierControl = controllerLayer("ADBE Effect Parade").property(modifierName);
                        if (!modifierControl) {
                            modifierControl = controllerLayer("ADBE Effect Parade").addProperty(ffxMap_1["default"].falloff2d.pseudo);
                            modifierControl.name = modifierName;
                            modifierControl.property(ffxMap_1["default"].falloff2d.x).setValue(0);
                            modifierControl.property(ffxMap_1["default"].falloff2d.y).setValue(0);
                        }
                        property.expression = minifier(((((("// Mt. Mograph - Motion 4 (Falloff Expression)\n      controllerLayer = thisComp.layer(\"".concat(controllerLayer.name, "\");\n      effectorPosition = controllerLayer.position.value;\n      inversion = controllerLayer.effect(\"Falloff Master\")(\"").concat(ffxMap_1["default"].falloff.invert, "\");\n      isEnabled = controllerLayer.effect(\"Falloff Master\")(\"").concat(ffxMap_1["default"].falloff.enable, "\");\n      if (isEnabled == 0) {\n        value;\n      } else {\n        falloff = controllerLayer.effect(\"Falloff Master\")(\"").concat)(ffxMap_1["default"].falloff.falloff, "\").value / 100;\n        scaleValue = controllerLayer.scale.value[0] / 100;\n        outerRing = (scaleValue * 300) / 2;\n        innerRing = (outerRing * falloff);\n        samplePoint = thisLayer.toWorld(thisLayer.anchorPoint);\n        dx = effectorPosition[0] - samplePoint[0];\n        dy = effectorPosition[1] - samplePoint[1];\n        distanceSq = dx * dx + dy * dy;\n        distance = Math.sqrt(distanceSq);\n        var multiplier;\n        if (distance > outerRing) {\n          multiplier = 0;\n        } else if (distance < innerRing) {\n          multiplier = 1;\n        } else {\n          multiplier = 1 - (distance - innerRing) / (outerRing - innerRing);\n        }\n        variableX = controllerLayer.effect(\"").concat)(modifierName, "\")(\"").concat)(ffxMap_1["default"].falloff2d.x, "\") * -1;\n        variableY = controllerLayer.effect(\"").concat)(modifierName, "\")(\"").concat)(ffxMap_1["default"].falloff2d.y, "\") * -1;\n        if (inversion > 0) {\n          [value[0] - (variableX * (1 - multiplier)), value[1] - (variableY * (1 - multiplier))];\n        } else {\n          [value[0] - (variableX * multiplier), value[1] - (variableY * multiplier)];\n        }\n      }"), minifyMap);
                        break;
                    case PropertyValueType.ThreeD:
                    case PropertyValueType.ThreeD_SPATIAL:
                        var modifierControl = controllerLayer("ADBE Effect Parade").property(modifierName);
                        if (!modifierControl) {
                            modifierControl = controllerLayer("ADBE Effect Parade").addProperty(ffxMap_1["default"].falloff3d.pseudo);
                            modifierControl.name = modifierName;
                            modifierControl.property(ffxMap_1["default"].falloff3d.x).setValue(0);
                            modifierControl.property(ffxMap_1["default"].falloff3d.y).setValue(0);
                            modifierControl.property(ffxMap_1["default"].falloff3d.z).setValue(0);
                        }
                        property.expression = minifier(((((((("// Mt. Mograph - Motion 4 (Falloff Expression)\n      controllerLayer = thisComp.layer(\"".concat(controllerLayer.name, "\");\n      effectorPosition = controllerLayer.position.value;\n      inversion = controllerLayer.effect(\"Falloff Master\")(\"").concat(ffxMap_1["default"].falloff.invert, "\");\n      isEnabled = controllerLayer.effect(\"Falloff Master\")(\"").concat(ffxMap_1["default"].falloff.enable, "\");\n      if (isEnabled == 0) {\n        value;\n      } else {\n        falloff = controllerLayer.effect(\"Falloff Master\")(\"").concat)(ffxMap_1["default"].falloff.falloff, "\").value / 100;\n        scaleValue = controllerLayer.scale.value[0] / 100;\n        outerRing = (scaleValue * 300) / 2;\n        innerRing = (outerRing * falloff);\n        samplePoint = thisLayer.toWorld(thisLayer.anchorPoint);\n        dx = effectorPosition[0] - samplePoint[0];\n        dy = effectorPosition[1] - samplePoint[1];\n        distanceSq = dx * dx + dy * dy;\n        distance = Math.sqrt(distanceSq);\n        var multiplier;\n        if (distance > outerRing) {\n          multiplier = 0;\n        } else if (distance < innerRing) {\n          multiplier = 1;\n        } else {\n          multiplier = 1 - (distance - innerRing) / (outerRing - innerRing);\n        }\n        variableX = controllerLayer.effect(\"").concat)(modifierName, "\")(\"").concat)(ffxMap_1["default"].falloff3d.x, "\") * -1;\n        variableY = controllerLayer.effect(\"").concat)(modifierName, "\")(\"").concat)(ffxMap_1["default"].falloff3d.y, "\") * -1;\n        variableZ = controllerLayer.effect(\"").concat)(modifierName, "\")(\"").concat)(ffxMap_1["default"].falloff3d.z, "\") * -1;\n        if (inversion > 0) {\n          result = [\n            value[0] - (variableX * (1 - multiplier)),\n            value[1] - (variableY * (1 - multiplier))\n          ];\n          if (value.length === 3) {\n            result.push(value[2] - (variableZ * (1 - multiplier)));\n          }\n          result;\n        } else {\n          result = [\n            value[0] - (variableX * multiplier),\n            value[1] - (variableY * multiplier)\n          ];\n          if (value.length === 3) {\n            result.push(value[2] - (variableZ * multiplier));\n          }\n          result;\n        }\n      }"), minifyMap);
                        break;
                    case PropertyValueType.COLOR:
                        var modifierControl = controllerLayer("ADBE Effect Parade").property(modifierName);
                        if (!modifierControl) {
                            modifierControl = controllerLayer("ADBE Effect Parade").addProperty(ffxMap_1["default"].falloffcolor.pseudo);
                            modifierControl.name = modifierName;
                        }
                        property.expression = minifier((((((("// Mt. Mograph - Motion 4 (Falloff Expression)\n      if (time < 0) {\n        value;\n      } else {\n        controllerLayer = thisComp.layer(\"".concat)(controllerLayer.name, "\");\n        effectorPosition = controllerLayer.position.value;\n        inversion = controllerLayer.effect(\"Falloff Master\")(\"").concat)(ffxMap_1["default"].falloff.invert, "\");\n        isEnabled = controllerLayer.effect(\"Falloff Master\")(\"").concat)(ffxMap_1["default"].falloff.enable, "\");\n        if (isEnabled == 0) {\n          value;\n        } else {\n          falloff = controllerLayer.effect(\"Falloff Master\")(\"").concat)(ffxMap_1["default"].falloff.falloff, "\").value / 100;\n          scaleValue = controllerLayer.scale.value[0] / 100;\n          newColor = controllerLayer.effect(\"").concat)(modifierName, "\")(\"").concat)(ffxMap_1["default"].falloffcolor.color, "\");\n          outerRing = (scaleValue * 300) / 2;\n          innerRing = (outerRing * falloff);\n          samplePoint = thisLayer.toWorld(thisLayer.anchorPoint);\n          dx = effectorPosition[0] - samplePoint[0];\n          dy = effectorPosition[1] - samplePoint[1];\n          distanceSq = dx * dx + dy * dy;\n          distance = Math.sqrt(distanceSq);\n          var multiplier;\n          if (distance > outerRing) {\n            multiplier = 0;\n          } else if (distance < innerRing) {\n            multiplier = 1;\n          } else {\n            multiplier = 1 - (distance - innerRing) / (outerRing - innerRing);\n          }\n          currentColor = thisProperty.valueAtTime(-1);\n          [\n            currentColor[0] + ((newColor[0] - currentColor[0]) * (inversion > 0 ? 1 - multiplier : multiplier)),\n            currentColor[1] + ((newColor[1] - currentColor[1]) * (inversion > 0 ? 1 - multiplier : multiplier)),\n            currentColor[2] + ((newColor[2] - currentColor[2]) * (inversion > 0 ? 1 - multiplier : multiplier)),\n            1,\n          ]\n        }\n      }"), minifyMap);
                        break;
                }
            }

            function falloff(composition) {
                if (!(composition instanceof CompItem)) {
                    return;
                }
                nameCounts = {};
                var selectedLayers = composition.selectedLayers.slice(0);
                var selectedProperties = utils_1.arrayFilter(composition.selectedProperties, function(property) {
                    return property instanceof Property && property.canSetExpression;
                });
                var useGlobalProperties = utils_1.arrayFilter(selectedLayers, function(sl) {
                    return sl.selectedProperties.length > 0;
                }).length === 1;
                utils_1.restoreSelectionAfter(function() {
                    controllerLayer = findOrCreateController(composition);
                });
                utils_1.fast(function() {
                    var propertyNamesMap = {};
                    (utils_1.arrayFilter(selectedLayers, function(l) {
                        return l !== controllerLayer;
                    }).forEach)(function(selectedLayer) {
                        var layerSelectedProperties = utils_1.arrayFilter(selectedLayer.selectedProperties, function(property) {
                            return property instanceof Property && property.canSetExpression;
                        });
                        var propertiesGetter = utils_1.propertiesToGetter((useGlobalProperties ? selectedProperties : layerSelectedProperties));
                        var properties = utils_1.arrayFilter(propertiesGetter(selectedLayer), function(property) {
                            return utils_1.isProperty(property);
                        });
                        properties.forEach(function(property) {
                            if (propertyNamesMap.hasOwnProperty(property.name)) {
                                modifierName = propertyNamesMap[property.name];
                            } else {
                                modifierName = getUniquePropertyName(property);
                                if (useGlobalProperties) {
                                    propertyNamesMap[property.name] = modifierName;
                                }
                            }
                            applyExpression(property, controllerLayer, modifierName);
                        });
                    });
                    utils_1.deselectAll(composition);
                    controllerLayer.selected = true;
                }, composition.selectedLayers.length < 4);
            }

            function run() {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Falloff");
                falloff(composition);
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/flip.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __read = this && this.__read || function(o, n) {
                    var m = typeof Symbol === "function" && o[Symbol.iterator];
                    if (!m) {
                        return o;
                    }
                    var i = m.call(o);
                    var ar = [];
                    try {
                        while (n === void(0) || n-- > 0 && !(r = i.next()).done) {
                            ar.push(r.value)
                        }
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            if (r && !r.done && m = i["return"]) {
                                m.call(i)
                            }
                        } finally {
                            if (e) {
                                throw e.error
                            }
                        }
                    }
                    return ar;
                };
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayers(composition, 1);
            }
            exports.check = check;

            function run(degree, group) {
                app.beginUndoGroup("Flip");
                var composition = utils_1.getComposition();
                var vertical = degree === 0 || degree === 45;
                var oddDegrees = degree === 45 || degree === 135;
                if (group) {
                    var min_1 = [Infinity, Infinity];
                    var max_1 = [-Infinity, -Infinity];
                    var selectedLayers_1 = composition.selectedLayers.slice(0);
                    var parentIndexes_1 = [];
                    selectedLayers_1.forEach(function(layer, i) {
                        if (layer.parent) {
                            parentIndexes_1.push([i, layer.parent]);
                            layer.parent = null;
                        }
                    });
                    selectedLayers_1.forEach(function(layer) {
                        if (layer.parent) {
                            return;
                        }
                        if (!layer.property("Position")) {
                            return;
                        }
                        var position = layer.property("Position").value;
                        if (position[0] < min_1[0]) {
                            min_1[0] = position[0];
                        }
                        if (position[1] < min_1[1]) {
                            min_1[1] = position[1];
                        }
                        if (position[0] > max_1[0]) {
                            max_1[0] = position[0];
                        }
                        if (position[1] > max_1[1]) {
                            max_1[1] = position[1];
                        }
                    });
                    var averagePosition = [((max_1[0] - min_1[0]) / 2) + min_1[0], ((max_1[1] - min_1[1]) / 2) + min_1[1]];
                    var parentLayer_1 = composition.layers.addNull();
                    parentLayer_1.name = "MOTION TEMP NULL CONTROL";
                    var positionProperty = parentLayer_1.property("Position");
                    positionProperty.setValue(averagePosition);
                    parentLayer_1.anchorPoint.setValue([parentLayer_1.source.width / 2, parentLayer_1.source.height / 2]);
                    selectedLayers_1.forEach(function(layer) {
                        if (layer.name === "MOTION TEMP NULL CONTROL") {
                            return;
                        }
                        layer.parent = parentLayer_1;
                    });
                    var scaleProperty = parentLayer_1.property("Scale");
                    if (vertical) {
                        scaleProperty.setValue([-100, 100]);
                    } else {
                        scaleProperty.setValue([100, -100]);
                    }
                    if (oddDegrees) {
                        var rotateProperty = parentLayer_1.property("Rotation");
                        rotateProperty.setValue(rotateProperty.value + 90);
                    }
                    parentLayer_1.remove();
                    parentIndexes_1.forEach(function(_a) {
                        var _b = __read(_a, 2);
                        var parentIndex = _b[0];
                        var parent = _b[1];
                        (selectedLayers_1[parentIndex]).parent = parent;
                    });
                    selectedLayers_1.forEach(function(layer) {
                        layer.selected = true;
                    });
                } else {
                    var selectedLayers = composition.selectedLayers.slice(0);
                    selectedLayers.forEach(function(layer) {
                        var scale = layer.property("Scale");
                        var rotate = layer.property("Rotation");
                        if (!scale || !rotate) {
                            return;
                        }
                        var parentLayer = composition.layers.addNull();
                        parentLayer.name = "MOTION TEMP NULL CONTROL";
                        var positionProperty = parentLayer.property("Position");
                        positionProperty.setValue(layer.position.value);
                        parentLayer.anchorPoint.setValue([parentLayer.source.width / 2, parentLayer.source.height / 2]);
                        var parent = layer.parent;
                        layer.parent = parentLayer;
                        var scaleProperty = parentLayer.property("Scale");
                        if (vertical) {
                            scaleProperty.setValue([-100, 100]);
                        } else {
                            scaleProperty.setValue([100, -100]);
                        }
                        if (oddDegrees) {
                            var rotateProperty = parentLayer.property("Rotation");
                            rotateProperty.setValue(rotateProperty.value + 90);
                        }
                        parentLayer.remove();
                        layer.parent = parent;
                        layer.selected = true;
                    });
                }
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/focus.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __values = this && this.__values || function(o) {
                    var s = typeof Symbol === "function" && Symbol.iterator;
                    var m = s && o[s];
                    var i = 0;
                    if (m) {
                        return m.call(o);
                    }
                    if (o && typeof o.length === "number") {
                        return {
                            next: function() {
                                if (o && i >= o.length) {
                                    o = void(0)
                                }
                                return {
                                    value: o && o[i++],
                                    done: !o
                                };
                            }
                        };
                    }
                    throw new TypeError((s ? "Object is not iterable." : "Symbol.iterator is not defined."))
                };
            exports.__esModule = true;
            exports.removeIndicator = exports.reindex = exports.poll = exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var unfocus_1 = __webpack_require__("./build/aeft/tools/unfocus.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(selector, focusMode, focusIndicator, includeChildren, unlockLayers) {
                if (includeChildren === void(0)) {
                    includeChildren = false;
                }
                if (unlockLayers === void(0)) {
                    unlockLayers = false;
                }
                app.beginUndoGroup("Focus");
                utils_1.restoreSelectionAfter(function() {
                    var _a = utils_1.getLayersForSelector(selector, false);
                    var layers = _a.layers;
                    var composition = _a.composition;
                    utils_1.fast(function() {
                        unfocus_1.doUnfocus(composition);
                        utils_1.setCompositionState(composition);
                        var allLayers = utils_1.collectionToArray(composition.layers);
                        allLayers.forEach(function(layer) {
                            utils_1.setLayerState(layer);
                            var isIncluded = layers.indexOf(layer) !== -1 || includeChildren && selector.type === "selected" && layerHasSelectedParent(layer) || includeChildren && selector.type === "focus" && layerParentHasAnyTag(layer, selector.tags);
                            var layerIsTrackMatte = utils_1.isAVLayer(layer) && layer.isTrackMatte;
                            if (unlockLayers) {
                                layer.locked = false;
                            }
                            if (focusMode === "timeline" || focusMode === "both") {
                                layer.shy = !isIncluded;
                            }
                            if (focusMode === "viewer" || focusMode === "both") {
                                if (focusMode === "viewer" && !composition.hideShyLayers) {
                                    layer.shy = false;
                                }
                                layer.enabled = !layerIsTrackMatte && isIncluded;
                            }
                        });
                        composition.hideShyLayers = true;
                        if (focusIndicator) {
                            addIndicator(composition);
                        }
                    }, utils_1.collectionToArray(composition.layers).length < 4);
                });
                app.endUndoGroup();
            }
            exports.run = run;

            function poll() {
                var composition = utils_1.getComposition();
                return {
                    compositionId: composition.id,
                    tagsAndCounts: utils_1.getCompositionTags(composition),
                    tagsAndColors: utils_1.getCompositionTagColors(composition)
                };
            }
            exports.poll = poll;

            function layerHasSelectedParent(layer) {
                var search = layer;
                while (search) {
                    if (search.selected === true) {
                        return true;
                    }
                    search = search.parent;
                }
                return false;
            }

            function layerParentHasAnyTag(layer, tags) {
                var search = layer;
                while (search) {
                    try {
                        for (var _b = e_1 = void(0), __values(utils_1.getLayerTags(search)), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var tag = _c.value;
                            if (tags.indexOf(tag) !== -1) {
                                return true;
                            }
                        }
                    } catch (e_1_1) {
                        e_1 = {
                            error: e_1_1
                        };
                    } finally {
                        try {
                            if (_c && !_c.done && _a = _b["return"]) {
                                _a.call(_b)
                            }
                        } finally {
                            if (e_1) {
                                throw e_1.error
                            }
                        }
                    }
                    search = search.parent;
                }
                return false;
            }

            function addIndicator(composition, color) {
                if (color === void(0)) {
                    color = [0, 0.5686274766922, 0.91764706373215, 1];
                }
                var padding = composition.width * 0.03960396;
                var width = composition.width - padding;
                var height = composition.height - padding;
                var borderRadius = width / 100;
                var indicator = composition.layers.addShape();
                indicator.name = "FOCUSED";
                var vectors = indicator.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
                vectors.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
                vectors.property("ADBE Vectors Group").property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size").setValue([width, height]);
                vectors.property("ADBE Vectors Group").property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Roundness").setValue(borderRadius);
                vectors.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
                vectors.name = "Focus Display";
                utils_1.getPropertyAtPath(indicator, ["ADBE Root Vectors Group", "ADBE Vector Group", "ADBE Vectors Group", "ADBE Vector Graphic - Stroke", "ADBE Vector Stroke Width"]).setValue(composition.width / 505);
                utils_1.getPropertyAtPath(indicator, ["ADBE Root Vectors Group", "ADBE Vector Group", "ADBE Vectors Group", "ADBE Vector Graphic - Stroke", "ADBE Vector Stroke Color"]).setValue(color);
                indicator.guideLayer = true;
                indicator.shy = true;
                indicator.locked = true;
                indicator.selected = false;
            }

            function indexTags(composition) {
                var tags = {};
                var colors = {};
                utils_1.collectionToArray(composition.layers).forEach(function(layer) {
                    utils_1.getLayerTags(layer).forEach(function(tag) {
                        tags[tag] = (tags.hasOwnProperty(tag) ? tags[tag] + 1 : 1);
                        colors[tag] = layer.label;
                    });
                });
                var tagsAndCounts = Object.keys(tags).map(function(t) {
                    return t + ";" + tags[t];
                });
                if (Object.keys(utils_1.getCompositionTagColors(composition)).length == 0) {
                    utils_1.setCompositionTagColors(composition, colors);
                }
                utils_1.compositionEnsureTags(composition, tagsAndCounts);
            }

            function reindex() {
                var composition = utils_1.getComposition();
                indexTags(composition);
            }
            exports.reindex = reindex;

            function removeIndicator(composition) {
                if (composition.layer("FOCUSED")) {
                    var indicator = composition.layer("FOCUSED");
                    indicator.locked = false;
                    indicator.remove();
                }
            }
            exports.removeIndicator = removeIndicator;
        },
        "./build/aeft/tools/focuscolor.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(tag, color, groupColor, selector) {
                app.beginUndoGroup("FocusColor");
                var composition = utils_1.getComposition();
                var currentTagsAndColors = utils_1.getCompositionTagColors(composition);
                currentTagsAndColors[tag] = color;
                utils_1.setCompositionTagColors(composition, currentTagsAndColors);
                if (groupColor) {
                    var layers = utils_1.getLayersForSelector(selector).layers;
                    layers.forEach(function(layer) {
                        layer.label = +color;
                    });
                }
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/focusrenametag.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(tag, renameTag) {
                app.beginUndoGroup("FocusRenameTag");
                var composition = utils_1.getComposition();
                var layers = utils_1.collectionToArray(composition.layers);
                var tagsAndCounts = {};
                layers.forEach(function(layer) {
                    var currentTags = utils_1.getLayerTags(layer);
                    if (currentTags.indexOf(tag) > -1) {
                        var nextTags = currentTags;
                        nextTags.splice(currentTags.indexOf(tag), 1, renameTag);
                        utils_1.setLayerTags(layer, nextTags);
                    }
                    utils_1.getLayerTags(layer).forEach(function(renameTag) {
                        tagsAndCounts[renameTag] = (tagsAndCounts.hasOwnProperty(renameTag) ? tagsAndCounts[renameTag] + 1 : 1);
                    });
                });
                utils_1.setCompositionTags(composition, tagsAndCounts);
                var currentTagsAndColors = utils_1.getCompositionTagColors(composition);
                currentTagsAndColors[renameTag] = currentTagsAndColors[tag];
                delete currentTagsAndColors[tag];
                utils_1.setCompositionTagColors(composition, currentTagsAndColors);
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/focustag.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __read = this && this.__read || function(o, n) {
                    var m = typeof Symbol === "function" && o[Symbol.iterator];
                    if (!m) {
                        return o;
                    }
                    var i = m.call(o);
                    var ar = [];
                    try {
                        while (n === void(0) || n-- > 0 && !(r = i.next()).done) {
                            ar.push(r.value)
                        }
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            if (r && !r.done && m = i["return"]) {
                                m.call(i)
                            }
                        } finally {
                            if (e) {
                                throw e.error
                            }
                        }
                    }
                    return ar;
                };
            var __spreadArray = this && this.__spreadArray || function(to, from, pack) {
                    if (pack || arguments.length === 2) {
                        for (var i = 0, l = from.length, ar; i < l; i++) {
                            if (ar || !(i in from)) {
                                if (!ar) {
                                    ar = Array.prototype.slice.call(from, 0, i)
                                }
                                ar[i] = from[i];
                            }
                        }
                    }
                    return to.concat(ar || Array.prototype.slice.call(from));
                };
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(tag, invert, allLayers) {
                app.beginUndoGroup("FocusTag");
                var composition = utils_1.getComposition();
                var layers = (allLayers ? utils_1.collectionToArray(composition.layers) : composition.selectedLayers);
                layers.forEach(function(layer) {
                    var currentTags = utils_1.getLayerTags(layer);
                    var nextTags = [];
                    if (invert) {
                        nextTags = utils_1.arrayFilter(currentTags, function(t) {
                            return t !== tag;
                        });
                    } else {
                        nextTags = (currentTags.indexOf(tag) !== -1 ? currentTags : __spreadArray(__spreadArray([], __read(currentTags), false), [tag], false));
                    }
                    utils_1.setLayerTags(layer, nextTags);
                });
                layers.forEach(function(l) {
                    return l.selected = true;
                });
                var tagsAndCounts = {};
                utils_1.collectionToArray(composition.layers).forEach(function(layer) {
                    utils_1.getLayerTags(layer).forEach(function(tag) {
                        tagsAndCounts[tag] = (tagsAndCounts.hasOwnProperty(tag) ? tagsAndCounts[tag] + 1 : 1);
                    });
                });
                utils_1.setCompositionTags(composition, tagsAndCounts);
                utils_1.ensureCompositionTagColors(composition, Object.keys(tagsAndCounts));
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/grab.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.test = exports.run = exports.check = void(0);
            var tap_1 = __webpack_require__("./build/aeft/tap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                var selectedProperties = utils_1.getSelectedPropertiesOnComposition(composition);
                return {
                    composition: composition,
                    selectedLayers: selectedLayers,
                    selectedProperties: selectedProperties
                };
            }
            exports.check = check;

            function run(selectorOverride) {
                if (selectorOverride === void(0)) {
                    selectorOverride = null;
                }
                var _a = check();
                var composition = _a.composition;
                var selectedLayers = _a.selectedLayers;
                var selectedProperties = _a.selectedProperties;
                app.beginUndoGroup("Motion - Grab");
                if (selectorOverride !== null) {
                    targetLayers = utils_1.getLayersForSelector(selectorOverride).layers;
                } else {
                    targetLayers = (selectedLayers.length === 1 ? utils_1.collectionToArray(composition.layers) : selectedLayers);
                }
                selectedProperties.forEach(function(property) {
                    var propertyPath = utils_1.propertyToPropertyPath(property);
                    targetLayers.forEach(function(targetLayer) {
                        var property = utils_1.getPropertyAtPath(targetLayer, propertyPath);
                        if (property && isValid(property)) {
                            property.selected = true;
                        }
                    });
                });
                app.endUndoGroup();
            }
            exports.run = run;

            function testGrabSingleSelectedLayer(tap) {
                utils_1.undoable("Grab - Test Setup", function() {
                    var composition = app.project.items.addComp("Grab Test Single", 500, 500, 1, 10, 30);
                    composition.openInViewer();
                    var solid1 = composition.layers.addSolid([0, 1, 0], "Solid 1", 200, 200, 1, 10);
                    solid1.name = "Solid 1";
                    solid2 = composition.layers.addSolid([0, 1, 0], "Solid 2", 200, 200, 1, 10);
                    solid2.name = "Solid 2";
                    solid3 = composition.layers.addSolid([0, 1, 0], "Solid 3", 200, 200, 1, 10);
                    solid3.name = "Solid 3";
                    solid1.selected = true;
                    solid1.transform.position.selected = true;
                    solid2.selected = false;
                    solid3.selected = false;
                });
                run();
                tap.test("grab - single selected layer", function(t) {
                    t.equals(solid2.transform.position.selected, true, "Solid 2's position property is selected");
                    t.equals(solid3.transform.position.selected, true, "Solid 3's position property is selected");
                });
            }

            function testGrabMultipleSelectedLayers(tap) {
                utils_1.undoable("Grab - Test Setup", function() {
                    var composition = app.project.items.addComp("Grab Test Multiple", 500, 500, 1, 10, 30);
                    composition.openInViewer();
                    var solid1 = composition.layers.addSolid([0, 1, 0], "Solid 1", 200, 200, 1, 10);
                    solid1.name = "Solid 1";
                    solid2 = composition.layers.addSolid([0, 1, 0], "Solid 2", 200, 200, 1, 10);
                    solid2.name = "Solid 2";
                    solid3 = composition.layers.addSolid([0, 1, 0], "Solid 3", 200, 200, 1, 10);
                    solid3.name = "Solid 3";
                    solid1.selected = true;
                    solid1.transform.position.selected = true;
                    solid2.selected = false;
                    solid3.selected = true;
                });
                run();
                tap.test("grab - multiple selected layers", function(t) {
                    t.equals(solid2.transform.position.selected, false, "Solid 2's position property is not selected");
                    t.equals(solid3.transform.position.selected, true, "Solid 3's position property is selected");
                });
            }

            function test(tap) {
                if (tap === void(0)) {
                    tap = new tap_1["default"]("/tmp/grab-test");
                }
                testGrabSingleSelectedLayer(tap);
                testGrabMultipleSelectedLayers(tap);
            }
            exports.test = test;
        },
        "./build/aeft/tools/importVideo.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                return {
                    composition: composition
                };
            }
            exports.check = check;

            function run(path, name, frameRate) {
                app.beginUndoGroup("Import Video");
                var comp = utils_1.getComposition();
                var folderName = "Motion 4 Videos";
                var importOptions = new ImportOptions(new File(path));
                importOptions.sequence = true;
                var footageItem = app.project.importFile(importOptions);
                comp.layers.add(footageItem);
                footageItem.name = utils_1.getUniqueNameFromLayers(comp.layers, name);
                footageItem.mainSource.conformFrameRate = frameRate;
                var folderItem = utils_1.findInCollection(app.project.items, function(item) {
                    return item instanceof FolderItem && item.name === folderName;
                });
                if (!folderItem) {
                    var imageFolderItem = app.project.items.addFolder(folderName);
                    imageFolderItem.label = 10;
                    folderItem = imageFolderItem;
                }
                footageItem.parentFolder = folderItem;
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/jump.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.test = exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayer = utils_1.getSelectedLayer(composition);
                utils_1.getSelectedPropertiesOnLayer(selectedLayer, 1);
            }
            exports.check = check;

            function run() {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Jump");
                utils_1.fast(function() {
                    var selectedLayers = composition.selectedLayers;
                    var layerPropertyGetters = selectedLayers.map(function(selectedLayer) {
                        return {
                            layer: selectedLayer,
                            propertyGetters: (utils_1.arrayFilter(selectedLayer.selectedProperties, function(p) {
                                return p instanceof Property && p.canSetExpression && utils_1.isOneDProperty(p) || utils_1.isTwoDProperty(p) || utils_1.isThreeDProperty(p);
                            }).map)(utils_1.propertyToGetter)
                        };
                    });
                    layerPropertyGetters.forEach(function(_a) {
                        var selectedLayer = _a.layer;
                        var propertyGetters = _a.propertyGetters;
                        propertyGetters.forEach(function(pg) {
                            var selectedProperty = pg(selectedLayer);
                            var parentName = "";
                            try {
                                var firstParent = selectedProperty.parentProperty;
                                parentMatchName = firstParent.matchName;
                                parentName = firstParent.name;
                                currentName = selectedProperty.name;
                            } catch (err) {

                            }
                            if (parentMatchName === "ADBE Transform Group") {
                                presetName = "Jump - " + currentName;
                            } else {
                                presetName = "Jump - " + parentName + " - " + currentName;
                            }
                            if (presetName.length > 30) {
                                presetName = presetName.substr(0, 30);
                            }
                            var jumpExp = "\n\t\t\t\t\t\t\t\tenable = effect(\"".concat(presetName, "\")(\"").concat(ffxMap_1["default"].jump.enable, "\");\n\t\t\t\t\t\t\t\telastic = (effect(\"").concat(presetName, "\")(\"").concat(ffxMap_1["default"].jump.stretch, "\")) / 100;\n\t\t\t\t\t\t\t\tgravity = (effect(\"").concat(presetName, "\")(\"").concat(ffxMap_1["default"].jump.gravity, "\")) * 100;\n\t\t\t\t\t\t\t\tjumpMax = effect(\"").concat(presetName, "\")(\"").concat(ffxMap_1["default"].jump.maxJumps, "\");\n\t\t\t\t\t\t\t\ton_off = effect(\"").concat(presetName, "\")(\"").concat(ffxMap_1["default"].jump.jump, "\");\n\t\t\t\t\t\t\t\tif (enable == 0) {\n\t\t\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\t\tn = 0;\n\t\t\t\t\t\t\t\t\t\tif (numKeys > 0) {\n\t\t\t\t\t\t\t\t\t\t\t\tn = nearestKey(time).index;\n\t\t\t\t\t\t\t\t\t\t\t\tif (key(n).time > time) {\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tn--;\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\tif (n > 0) {\n\t\t\t\t\t\t\t\t\t\t\t\tt = time - key(n).time;\n\t\t\t\t\t\t\t\t\t\t\t\tv = -velocityAtTime(key(n).time - 0.001) * elastic;\n\t\t\t\t\t\t\t\t\t\t\t\tvl = length(v);\n\t\t\t\t\t\t\t\t\t\t\t\tif (value instanceof Array) {\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tvu = (vl > 0) ? normalize(v) : [0, 0, 0];\n\t\t\t\t\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tvu = (v < 0) ? -1 : 1;\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t\ttCur = 0;\n\t\t\t\t\t\t\t\t\t\t\t\tsegDur = 2 * vl / gravity;\n\t\t\t\t\t\t\t\t\t\t\t\ttNext = segDur;\n\t\t\t\t\t\t\t\t\t\t\t\tnumberOfBounces = 1;\n\t\t\t\t\t\t\t\t\t\t\t\twhile (tNext < t && numberOfBounces <= jumpMax) {\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tvl *= elastic;\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tsegDur *= elastic;\n\t\t\t\t\t\t\t\t\t\t\t\t\t\ttCur = tNext;\n\t\t\t\t\t\t\t\t\t\t\t\t\t\ttNext += segDur;\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tnumberOfBounces++;\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t\tif (numberOfBounces <= jumpMax) {\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tdelta = t - tCur;\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tinOutExp = vu * delta * (vl - gravity * delta / 2);\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tif (on_off == 1) {\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tvalue = value - inOutExp;\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tvalue = value + inOutExp;\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tvalue = value;\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\t\t\t\tvalue = value;\n\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}");
                            if (selectedProperty.canSetExpression) {
                                selectedProperty.expression = jumpExp;
                            }
                            var effectPropertyGroup = selectedLayer.property("ADBE Effect Parade");
                            if (effectPropertyGroup.property(presetName) !== null) {
                                return;
                            }
                            var jumpEffect = effectPropertyGroup.addProperty(ffxMap_1["default"].jump.pseudo);
                            jumpEffect.name = presetName;
                            var jumpStretch = jumpEffect.property(ffxMap_1["default"].jump.stretch);
                            jumpStretch.setValue(60);
                            var jumpGravity = jumpEffect.property(ffxMap_1["default"].jump.gravity);
                            jumpGravity.setValue(8);
                            var jumpMaxJumps = jumpEffect.property(ffxMap_1["default"].jump.maxJumps);
                            jumpMaxJumps.setValue(8);
                            var jumpEnable = jumpEffect.property(ffxMap_1["default"].jump.enable);
                            jumpEnable.setValue(1);
                        });
                    });
                });
                app.endUndoGroup();
            }
            exports.run = run;

            function test() {
                var composition = app.project.items.addComp("Jump Test", 500, 500, 1, 10, 30);
                composition.openInViewer();
                var solid1 = composition.layers.addSolid([0, 1, 0], "Solid 1", 200, 200, 1, 10);
                solid1.name = "Solid 1";
                solid1.rotation.selected = true;
                run();
            }
            exports.test = test;
        },
        "./build/aeft/tools/nulllayer.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 0);
                return {
                    composition: composition,
                    selectedLayers: selectedLayers
                };
            }
            exports.check = check;

            function run(color) {
                var _a = check();
                var composition = _a.composition;
                var selectedLayers = _a.selectedLayers;
                app.beginUndoGroup("Motion - Null");
                utils_1.fast(function() {
                    var nullSize = 100;
                    var nullLayer = composition.layers.addNull();
                    nullLayer.name = utils_1.getUniqueNameFromLayers(composition.layers, "NULL");
                    var labelColor = +color;
                    if (isNaN(labelColor)) {
                        labelColor = utils_1.getLabelColor(color);
                    }
                    nullLayer.label = labelColor;
                    nullLayer.source.width = nullSize;
                    nullLayer.source.height = nullSize;
                    nullLayer.anchorPoint.setValue([nullLayer.source.width / 2, nullLayer.source.height / 2]);
                    if (selectedLayers.length > 0) {
                        var allLayersAre3d = true;
                        for (var i = 0; i < selectedLayers.length; i += 1) {
                            var currentLayer = selectedLayers[i];
                            currentLayer.parent = null;
                            if (currentLayer instanceof ShapeLayer || currentLayer instanceof TextLayer || currentLayer instanceof AVLayer && !currentLayer.threeDLayer) {
                                allLayersAre3d = false;
                            }
                        }
                        var xmin = void(0);
                        var xmax = void(0);
                        var ymin = void(0);
                        var ymax = void(0);
                        var zmin = Infinity;
                        var zmax = -Infinity;
                        var saveIn = void(0);
                        var newInpoint = composition.duration;
                        var saveOut = void(0);
                        var newOutpoint = 0;
                        xmin = xmax = selectedLayers[0].property("Position").value[0];
                        ymin = ymax = selectedLayers[0].property("Position").value[1];
                        for (var j = 0; j < selectedLayers.length; j += 1) {
                            var currentLayer = selectedLayers[j];
                            var xIn = currentLayer.property("Position").value[0];
                            if (xIn > xmax) {
                                xmax = xIn;
                            }
                            if (xIn < xmin) {
                                xmin = xIn;
                            }
                            var yIn = currentLayer.property("Position").value[1];
                            if (yIn > ymax) {
                                ymax = yIn;
                            }
                            if (yIn < ymin) {
                                ymin = yIn;
                            }
                            if (allLayersAre3d) {
                                var zIn = currentLayer.property("Position").value[2];
                                if (zIn > zmax) {
                                    zmax = zIn;
                                }
                                if (zIn < zmin) {
                                    zmin = zIn;
                                }
                            }
                            saveIn = (currentLayer.stretch < 0 ? currentLayer.outPoint : currentLayer.inPoint);
                            saveOut = (currentLayer.stretch < 0 ? currentLayer.inPoint : currentLayer.outPoint);
                            if (saveIn < newInpoint) {
                                newInpoint = saveIn;
                            }
                            if (saveOut > newOutpoint) {
                                newOutpoint = saveOut;
                            }
                        }
                        var xpos = ((xmax - xmin) / 2) + xmin;
                        var ypos = ((ymax - ymin) / 2) + ymin;
                        if (allLayersAre3d) {
                            nullLayer.threeDLayer = true;
                            var zpos = ((zmax - zmin) / 2) + zmin;
                            nullLayer.property("Position").setValue([xpos, ypos, zpos]);
                        } else {
                            nullLayer.property("Position").setValue([xpos, ypos]);
                        }
                        nullLayer.inPoint = newInpoint;
                        nullLayer.outPoint = newOutpoint;
                        for (var k = 0; k < selectedLayers.length; k += 1) {
                            (selectedLayers[k]).parent = nullLayer;
                        }
                        utils_1.moveLayerBeforeSelectedLayers(nullLayer, selectedLayers, composition);
                    }
                }, selectedLayers.length < 4);
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/orbit.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayer(composition);
            }
            exports.check = check;

            function run() {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Orbit");
                utils_1.fast(function() {
                    var selectedLayers = composition.selectedLayers;
                    var compHeight = composition.height;
                    for (var i = 0; i < selectedLayers.length; i += 1) {
                        var selectedLayer = selectedLayers[i];
                        var orbitName = selectedLayer.position.name;
                        var effectPropertyGroup = selectedLayer.property("ADBE Effect Parade");
                        if (effectPropertyGroup.property(orbitName) !== null) {
                            continue;
                        }
                        var orbitEffect = effectPropertyGroup.addProperty(ffxMap_1["default"].orbit.pseudo);
                        orbitEffect.name = orbitName;
                        var orbitSpeed = orbitEffect.property(ffxMap_1["default"].orbit.speed);
                        orbitSpeed.setValue(8);
                        var orbitDistance = orbitEffect.property(ffxMap_1["default"].orbit.distance);
                        orbitDistance.setValue(compHeight / 50);
                        var orbitReverse = orbitEffect.property(ffxMap_1["default"].orbit.reverse);
                        orbitReverse.setValue(1);
                        var orbitExp = "enable = effect(\"" + orbitName + "\")(\"" + ffxMap_1["default"].orbit.enable + "\");\n" + "if (enable == 0) { value; } else {\n" + "calibrate = effect(\"" + orbitName + "\")(\"" + ffxMap_1["default"].orbit.calibration + "\") / 57;\n" + "on_off = effect(\"" + orbitName + "\")(\"" + ffxMap_1["default"].orbit.reverse + "\");\n" + "d = effect(\"" + orbitName + "\")(\"" + ffxMap_1["default"].orbit.distance + "\") * 15;\n" + "s = effect(\"" + orbitName + "\")(\"" + ffxMap_1["default"].orbit.speed + "\") / 10;\n" + " \n" + "try {\n" + "\tL = effect(\"" + orbitName + "\")(\"" + ffxMap_1["default"].orbit.target + "\");\n" + "\tcenter = L.toWorld(L.anchorPoint);\n" + "} catch (err) {\n" + "\tcenter = value;\n" + "}\n" + "myTime = Math.max(0, time - inPoint);\n" + "if (on_off == 1) {\n" + "\tangle = (s * myTime * 2 * Math.PI) + calibrate;\n" + "} else {\n" + "\tangle = ((s * myTime * 2 * Math.PI) + calibrate) * -1;\n" + "}\n" + "value = center + [Math.sin(angle) / thisComp.pixelAspect, -Math.cos(angle)] * d;\n}";
                        selectedLayer.position.expression = orbitExp;
                    }
                }, composition.selectedLayers.length < 4);
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/parent.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayers(composition, 2);
            }
            exports.check = check;

            function runParent(layers, direction) {
                if (direction === void(0)) {
                    direction = false;
                }
                try {
                    var increment = (direction ? -1 : 1);
                    for (var i = 0; i < layers.length; i += 1) {
                        var layer = layers[i];
                        if (layers[i + increment]) {
                            layer.parent = null;
                        }
                    }
                    for (var j = 0; j < layers.length; j += 1) {
                        var layer = layers[j];
                        if (layers[j + increment]) {
                            layer.parent = layers[j + increment];
                        }
                    }
                } catch (err) {
                    layers.forEach(function(layer) {
                        layer.parent = null;
                    });
                    runParent(layers, direction);
                }
            }

            function run(direction) {
                if (direction === void(0)) {
                    direction = false;
                }
                var composition = utils_1.getComposition();
                var layers = composition.selectedLayers;
                utils_1.undoable("Motion 4 - Parent", function() {
                    return runParent(layers, direction);
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/pastecolor.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var color_1 = __webpack_require__("./build/aeft/tools/color.js");
            var disablestrokefill_1 = __webpack_require__("./build/aeft/tools/disablestrokefill.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(fill, stroke, fillEnabled, strokeEnabled, canPasteStroke) {
                utils_1.undoable("Motion 4 - Paste Color", function() {
                    if (canPasteStroke) {
                        if (strokeEnabled) {
                            color_1.runColor(stroke, "stroke");
                        } else {
                            disablestrokefill_1.disableStrokeFill("stroke");
                        }
                    }
                    if (fillEnabled) {
                        color_1.runColor(fill, "fill");
                    } else {
                        disablestrokefill_1.disableStrokeFill("fill");
                    }
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/pinplus.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayer = utils_1.getSelectedLayer(composition);
                if (!selectedLayer.property("ADBE Effect Parade").property("ADBE FreePin3")) {
                    throw utils_1.WrappedError(new Error("No puppet pins found"), errors_1.NO_PUPPET_PINS_FOUND)
                }
            }
            exports.check = check;

            function createPinController(composition, nullSize, layer, pinController, meshName, pin) {
                var myNull = composition.layers.addNull();
                myNull.label = 16;
                myNull.source.width = Math.round(nullSize / 2);
                myNull.source.height = Math.round(nullSize / 2);
                myNull.anchorPoint.setValue([Math.round(myNull.source.width / 2), Math.round(myNull.source.height / 2)]);
                myNull.name = layer.name + " - " + meshName + " - " + pin.name + " - NULL";
                myNull.inPoint = layer.inPoint;
                myNull.outPoint = layer.outPoint;
                var child = pin.property("ADBE FreePin3 PosPin Position");
                pos = [child.value[0], child.value[1]];
                if (layer instanceof AVLayer) {
                    pos = layer.sourcePointToComp(pos);
                    myNull.position.setValue(pos);
                    child.expression = "pinPos = thisComp.layer(\"" + myNull.name + "\").toWorld(thisComp.layer(\"" + myNull.name + "\").transform.anchorPoint); compPos = fromComp(pinPos)";
                } else {
                    myNull.position.setValue(pos);
                    child.expression = "pinPos = thisComp.layer(\"" + myNull.name + "\").toWorld(thisComp.layer(\"" + myNull.name + "\").transform.anchorPoint);";
                }
                myNull.parent = pinController;
                myNull.moveAfter(pinController);
            }

            function run(nullSize) {
                if (nullSize === void(0)) {
                    nullSize = 50;
                }
                var composition = utils_1.getComposition();
                app.beginUndoGroup("Pin +");
                composition.selectedLayers.forEach(function(layer) {
                    var pinController = composition.layers.addNull();
                    pinController.position.setValue(layer.position.value);
                    pinController.name = layer.name + " - CONTROL";
                    pinController.source.width = nullSize;
                    pinController.source.height = nullSize;
                    pinController.anchorPoint.setValue([Math.round(nullSize / 2), Math.round(nullSize / 2)]);
                    pinController.label = 8;
                    var mesh = layer.property("ADBE Effect Parade").property("ADBE FreePin3").property("ADBE FreePin3 ARAP Group").property("ADBE FreePin3 Mesh Group");
                    for (var t = 1; t <= mesh.numProperties; t += 1) {
                        var meshName = mesh.property(t).name;
                        var pins = mesh.property(t).property("Deform");
                        for (var n = 1; n <= pins.numProperties; n += 1) {
                            var pin = pins.property(n);
                            createPinController(composition, nullSize, layer, pinController, meshName, pin);
                        }
                    }
                    layer.locked = true;
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/rename.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __read = this && this.__read || function(o, n) {
                    var m = typeof Symbol === "function" && o[Symbol.iterator];
                    if (!m) {
                        return o;
                    }
                    var i = m.call(o);
                    var ar = [];
                    try {
                        while (n === void(0) || n-- > 0 && !(r = i.next()).done) {
                            ar.push(r.value)
                        }
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            if (r && !r.done && m = i["return"]) {
                                m.call(i)
                            }
                        } finally {
                            if (e) {
                                throw e.error
                            }
                        }
                    }
                    return ar;
                };
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                return {
                    selectedLayers: selectedLayers
                };
            }
            exports.check = check;

            function run(value) {
                var selectedLayers = check().selectedLayers;
                var _a = __read(value, 5);
                var name = _a[0];
                var prefix = _a[1];
                var suffix = _a[2];
                var serialize = _a[3];
                var seperator = _a[4];
                app.beginUndoGroup("Rename");
                selectedLayers.forEach(function(layer, i) {
                    var newName = "".concat((prefix ? prefix + seperator : "")).concat(name).concat((suffix ? seperator + suffix : "")).concat(seperator).concat(String(i + 1));
                    if (serialize === "before") {
                        newName = "".concat(String(i + 1)).concat(seperator).concat((prefix ? prefix + seperator : "")).concat(name).concat((suffix ? seperator + suffix : ""));
                    }
                    layer.name = newName;
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/reverse.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayers(composition, 2);
            }
            exports.check = check;

            function runReverse() {
                utils_1.fast(function(composition) {
                    if (!composition) {
                        return;
                    }
                    var selectedLayers = composition.selectedLayers;
                    var sortedSelection = selectedLayers.sort(function(l1, l2) {
                        if (l1.index < l2.index) {
                            return -1;
                        }
                        if (l1.index > l2.index) {
                            return 1;
                        }
                        return 0;
                    });
                    sortedSelection.forEach(function(layer, i) {
                        if (layer.locked) {
                            return;
                        }
                        if (i > 0) {
                            layer.moveBefore(sortedSelection[i - 1]);
                        }
                    });
                });
            }

            function run() {
                utils_1.undoable("Motion 4 - Reverser", runReverse);
            }
            exports.run = run;
        },
        "./build/aeft/tools/setcompduration.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(hours, minutes, seconds, frames) {
                utils_1.undoable("Motion 4 - Set Comp Duration", function() {
                    var composition = utils_1.getComposition();
                    var newDuration = (hours * 3600) + (minutes * 60) + seconds + (frames / composition.frameRate);
                    composition.duration = newDuration;
                    composition.workAreaStart = 0;
                    composition.workAreaDuration = composition.duration;
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/setcompfps.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(frameRate) {
                utils_1.undoable("Motion 4 - Set Comp FPS", function() {
                    var composition = utils_1.getComposition();
                    composition.frameRate = frameRate;
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/setcompname.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(name) {
                if (name === undefined || name === "") {
                    return;
                }
                utils_1.undoable("Motion 4 - Set Comp Name", function() {
                    var composition = utils_1.getComposition();
                    var newName = utils_1.getUniqueNameFromLayers(app.project.items, name);
                    var oldName = composition.name;
                    composition.name = newName;
                    app.project.autoFixExpressions(oldName, name);
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/setcompsize.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(width, height) {
                utils_1.undoable("Motion 4 - Set Comp Size", function() {
                    var composition = utils_1.getComposition();
                    var nullLayer = composition.layers.addNull();
                    nullLayer.threeDLayer = true;
                    if (utils_1.isThreeDProperty(nullLayer.position)) {
                        nullLayer.position.setValue([composition.width / 2, composition.height / 2, 0]);
                    }
                    for (var i = 1; i <= composition.numLayers; i += 1) {
                        var curLayer = composition.layer(i);
                        var wasLocked = curLayer.locked;
                        curLayer.locked = false;
                        if (curLayer != nullLayer && curLayer.parent == null) {
                            curLayer.parent = nullLayer;
                        }
                        curLayer.locked = wasLocked;
                    }
                    composition.width = width;
                    composition.height = height;
                    if (utils_1.isThreeDProperty(nullLayer.position)) {
                        nullLayer.position.setValue([composition.width / 2, composition.height / 2, 0]);
                    }
                    nullLayer.remove();
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/setstrokewidth.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var color_1 = __webpack_require__("./build/aeft/tools/color.js");

            function check() {
                var comp = utils_1.getComposition();
                utils_1.getSelectedLayers(comp, 1);
            }
            exports.check = check;

            function run(strokeWidth) {
                var composition = utils_1.getComposition();
                if (composition.selectedLayers.length > 0) {
                    composition.selectedLayers.map(function(layer) {
                        if (layer instanceof ShapeLayer) {
                            var selectedVectorGroups_1 = [];
                            layer.selectedProperties.forEach(function(prop) {
                                if (prop.matchName === "ADBE Vector Group") {
                                    selectedVectorGroups_1.push(prop);
                                }
                            });
                            selectedVectorGroups_1.forEach(function(prop) {
                                var sw = color_1.findProperties(prop, "ADBE Vector Stroke Width");
                                if (sw.length === 0) {
                                    color_1.addStrokePropToVectorGroup(prop);
                                }
                            });
                            var strokeWidths = color_1.findProperties(layer.property("ADBE Root Vectors Group"), "ADBE Vector Stroke Width");
                            var allStrokesAreDeselected_1 = utils_1.arrayFilter(strokeWidths, function(property) {
                                return property.parentProperty.parentProperty.parentProperty.selected === false;
                            }).length === strokeWidths.length;
                            strokeWidths.forEach(function(property) {
                                if (!allStrokesAreDeselected_1 && !property.parentProperty.parentProperty.parentProperty.selected) {
                                    return;
                                }
                                if (property.numKeys > 0) {
                                    property.parentProperty.enabled = true;
                                    property.setValueAtTime(composition.time, strokeWidth);
                                } else {
                                    property.parentProperty.enabled = true;
                                    property.setValue(strokeWidth);
                                }
                            });
                            if (strokeWidths.length === 0) {
                                var rootVectorsGroups = layer.property("ADBE Root Vectors Group");
                                var vectorGroup = rootVectorsGroups.property("ADBE Vector Group");
                                var stroke = color_1.addStrokePropToVectorGroup(vectorGroup);
                                stroke.property("ADBE Vector Stroke Width").setValue(strokeWidth);
                            }
                        } else {
                            if (layer instanceof TextLayer) {
                                var textProperty = layer.property("ADBE Text Properties").property("ADBE Text Document");
                                var textDocument = textProperty.value;
                                textDocument.applyStroke = true;
                                textDocument.strokeWidth = strokeWidth;
                                if (strokeWidth === 0) {
                                    textDocument.applyStroke = false;
                                }
                                textProperty.setValue(textDocument);
                            }
                        }
                    });
                }
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/shapes.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                return composition;
            }
            exports.check = check;

            function run(path, name) {
                var composition = check();
                app.beginUndoGroup("Motion - Shapes");
                var cleanName = name.charAt(0).toUpperCase() + name.slice(1);
                var importOptions = new ImportOptions(new File(path));
                var item = app.project.importFile(importOptions);
                var layer = composition.layers.add(item);
                layer.name = cleanName;
                layer.startTime = 0;
                var heightRatio = composition.height / layer.height;
                var widthRatio = composition.width / layer.width;
                var ratio = (widthRatio < heightRatio ? widthRatio : heightRatio);
                var scalingNumber = 33;
                layer.scale.setValue([ratio * scalingNumber, ratio * scalingNumber]);
                layer.selected = true;
                app.executeCommand(3973);
                var searchName = layer.name + " Outlines";
                layer.remove();
                item.remove();
                for (var i = 1; i <= composition.numLayers; i += 1) {
                    var compLayer = composition.layer(i);
                    if (compLayer.name === searchName) {
                        compLayer.name = utils_1.getUniqueNameFromLayers(composition.layers, cleanName);
                    }
                }
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/sort.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function itemHasIgnoredParentFolder(item, ignoreFoldersSearch) {
                var parentFolder = item.parentFolder;
                while (parentFolder) {
                    if (parentFolder.name.toLocaleLowerCase().indexOf(ignoreFoldersSearch) > -1) {
                        return true;
                    }
                    parentFolder = parentFolder.parentFolder;
                }
                return false;
            }

            function check() {

            }
            exports.check = check;

            function run(compositionFolder, audioFolder, videoFolder, imagesFolder, oldFolder, aiPsdFolder, nullsAndSolidsFolder, missingFolder, removeOldFolders, removeUnused, ignoredFolderNames) {
                app.beginUndoGroup("Sort");
                var ignoreFoldersSearch = ignoredFolderNames.toLocaleLowerCase();
                var compositionFolderItem = app.project.items.addFolder(compositionFolder);
                compositionFolderItem.label = 9;
                var audioFolderItem = app.project.items.addFolder(audioFolder);
                audioFolderItem.label = 13;
                var videoFolderItem = app.project.items.addFolder(videoFolder);
                videoFolderItem.label = 3;
                var imageFolderItem = app.project.items.addFolder(imagesFolder);
                imageFolderItem.label = 10;
                var vectorFolderItem = app.project.items.addFolder(aiPsdFolder);
                vectorFolderItem.label = 2;
                var solidFolderItem = app.project.items.addFolder(nullsAndSolidsFolder);
                solidFolderItem.label = 11;
                var missingFolderItem = app.project.items.addFolder(missingFolder);
                missingFolderItem.label = 1;
                var oldFolderItem = app.project.items.addFolder(oldFolder);
                oldFolderItem.label = 15;
                var ownFolders = [compositionFolderItem, audioFolderItem, videoFolderItem, imageFolderItem, vectorFolderItem, solidFolderItem, missingFolderItem, oldFolderItem];
                utils_1.collectionToArray(app.project.items).forEach(function(item) {
                    if (item.name.toLocaleLowerCase().indexOf(ignoreFoldersSearch) > -1) {
                        item.parentFolder = app.project.rootFolder;
                    } else if (itemHasIgnoredParentFolder(item, ignoreFoldersSearch)) {

                    } else if (item instanceof CompItem) {
                        item.parentFolder = app.project.rootFolder;
                        item.parentFolder = compositionFolderItem;
                        item.label = 9;
                    } else if (item instanceof FootageItem) {
                        if (item.footageMissing) {
                            item.parentFolder = app.project.rootFolder;
                            item.parentFolder = missingFolderItem;
                            item.label = 1;
                        } else if (item.name.substr(-3) === ".ai" || item.name.substr(-4) === ".psd") {
                            item.parentFolder = app.project.rootFolder;
                            item.parentFolder = vectorFolderItem;
                            item.label = 2;
                        } else if (item.mainSource instanceof SolidSource) {
                            item.parentFolder = app.project.rootFolder;
                            item.parentFolder = solidFolderItem;
                            item.label = 11;
                        } else if (item.mainSource.isStill) {
                            item.parentFolder = app.project.rootFolder;
                            item.parentFolder = imageFolderItem;
                            item.label = 10;
                        } else if (item.hasVideo) {
                            item.parentFolder = app.project.rootFolder;
                            item.parentFolder = videoFolderItem;
                            item.label = 3;
                        } else {
                            if (item.hasAudio) {
                                item.parentFolder = app.project.rootFolder;
                                item.parentFolder = audioFolderItem;
                                item.label = 13;
                            }
                        }
                    } else {
                        if (item instanceof FolderItem) {
                            if (item !== oldFolderItem && ownFolders.indexOf(item) === -1) {
                                item.parentFolder = app.project.rootFolder;
                                item.parentFolder = oldFolderItem;
                                item.label = 15;
                            }
                        }
                    }
                });
                if (compositionFolderItem.numItems < 1) {
                    compositionFolderItem.remove();
                }
                if (audioFolderItem.numItems < 1) {
                    audioFolderItem.remove();
                }
                if (videoFolderItem.numItems < 1) {
                    videoFolderItem.remove();
                }
                if (imageFolderItem.numItems < 1) {
                    imageFolderItem.remove();
                }
                if (solidFolderItem.numItems < 1) {
                    solidFolderItem.remove();
                }
                if (missingFolderItem.numItems < 1) {
                    missingFolderItem.remove();
                }
                if (vectorFolderItem.numItems < 1) {
                    vectorFolderItem.remove();
                }
                if (oldFolderItem.numItems < 1 || removeOldFolders) {
                    oldFolderItem.remove();
                }
                if (removeUnused) {
                    app.beginSuppressDialogs();
                    app.executeCommand(2109);
                    app.endSuppressDialogs(false);
                }
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/spin.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.test = exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayer(composition);
            }
            exports.check = check;

            function run(spinsPerSecond) {
                if (spinsPerSecond === void(0)) {
                    spinsPerSecond = 180;
                }
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Spin");
                utils_1.fast(function() {
                    var selectedLayers = composition.selectedLayers;
                    var effectName = "Spin";
                    for (var num = 0; num < selectedLayers.length; num += 1) {
                        var selectedLayer = selectedLayers[num];
                        var effectPropertyGroup = selectedLayer.property("ADBE Effect Parade");
                        if (effectPropertyGroup.property(effectName) !== null) {
                            continue;
                        }
                        var spinEffect = effectPropertyGroup.addProperty(ffxMap_1["default"].spin.pseudo);
                        spinEffect.name = effectName;
                        var spinsPerSecondProperty = spinEffect.property(ffxMap_1["default"].spin.spinsPerSecond);
                        spinsPerSecondProperty.setValue(spinsPerSecond);
                        var spinExp = "isReversed = effect(\"" + effectName + "\")(\"" + ffxMap_1["default"].spin.reverse + "\");\n" + "calibrate = effect(\"" + effectName + "\")(\"" + ffxMap_1["default"].spin.calibration + "\");\n" + "isEnabled = effect(\"" + effectName + "\")(\"" + ffxMap_1["default"].spin.enable + "\");\n" + " \n" + "if (isEnabled == 1) {\n" + "\tveloc = effect(\"" + effectName + "\")(\"" + ffxMap_1["default"].spin.spinsPerSecond + "\");\n" + "\tif (isReversed == 1) {\n" + "\t\tvalue = (rotation + (time - inPoint) * veloc) + calibrate;\n" + "\t} else {\n" + "\t\tvalue = ((rotation + (time - inPoint) * veloc) + calibrate) * -1;\n" + "\t}\n" + "} else { value = rotation }";
                        selectedLayer.rotation.expression = spinExp;
                    }
                }, composition.selectedLayers.length < 4);
                app.endUndoGroup();
            }
            exports.run = run;

            function test() {
                var composition = app.project.items.addComp("Spin Test", 500, 500, 1, 10, 30);
                composition.openInViewer();
                var solid1 = composition.layers.addSolid([0, 1, 0], "Solid 1", 200, 200, 1, 10);
                solid1.name = "Solid 1";
                solid1.rotation.selected = true;
                run();
            }
            exports.test = test;
        },
        "./build/aeft/tools/stare.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayer(composition);
            }
            exports.check = check;

            function run() {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Stare");
                utils_1.fast(function() {
                    var selectedLayers = composition.selectedLayers;
                    for (var i = 0; i < selectedLayers.length; i += 1) {
                        var selectedLayer = selectedLayers[i];
                        var effectName = "Stare";
                        if (selectedLayer.property("ADBE Effect Parade").property(effectName) !== null) {
                            continue;
                        }
                        var stareEffect = selectedLayer.property("ADBE Effect Parade").addProperty(ffxMap_1["default"].stare.pseudo);
                        stareEffect.name = effectName;
                        var stareExp = "calibrate = effect(\"" + effectName + "\")(\"" + ffxMap_1["default"].stare.calibration + "\");\n" + "on_off = effect(\"" + effectName + "\")(\"" + ffxMap_1["default"].stare.enable + "\");\n" + "if (on_off == 0) {\n\t\t\t\t\tvalue;\n\t\t\t\t} else {\n" + "try {\n" + "\tdiffx = position[0] - effect(\"" + effectName + "\")(\"" + ffxMap_1["default"].stare.target + "\")\n" + "\t\t.transform.position[0];\n" + "\tdiffy = position[1] - effect(\"" + effectName + "\")(\"" + ffxMap_1["default"].stare.target + "\")\n" + "\t\t.transform.position[1];\n" + "\tif (diffx === 0) {\n" + "\t\tdiffx = 1;\n" + "\t}\n" + "\tsign = 1 + (-1 * (diffx / Math.abs(diffx))) * 90;\n" + "\tradDegExp = 1 + radiansToDegrees(Math.atan(diffy / diffx));\n" + "\tvalue = radDegExp + sign + calibrate;\n" + "} catch (e) {\n" + "\tL = null;\n" + "}\n}";
                        selectedLayer.rotation.expression = stareExp;
                    }
                }, composition.selectedLayers.length < 4);
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/swapfillstroke.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __values = this && this.__values || function(o) {
                    var s = typeof Symbol === "function" && Symbol.iterator;
                    var m = s && o[s];
                    var i = 0;
                    if (m) {
                        return m.call(o);
                    }
                    if (o && typeof o.length === "number") {
                        return {
                            next: function() {
                                if (o && i >= o.length) {
                                    o = void(0)
                                }
                                return {
                                    value: o && o[i++],
                                    done: !o
                                };
                            }
                        };
                    }
                    throw new TypeError((s ? "Object is not iterable." : "Symbol.iterator is not defined."))
                };
            var __read = this && this.__read || function(o, n) {
                    var m = typeof Symbol === "function" && o[Symbol.iterator];
                    if (!m) {
                        return o;
                    }
                    var i = m.call(o);
                    var ar = [];
                    try {
                        while (n === void(0) || n-- > 0 && !(r = i.next()).done) {
                            ar.push(r.value)
                        }
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            if (r && !r.done && m = i["return"]) {
                                m.call(i)
                            }
                        } finally {
                            if (e) {
                                throw e.error
                            }
                        }
                    }
                    return ar;
                };
            var __spreadArray = this && this.__spreadArray || function(to, from, pack) {
                    if (pack || arguments.length === 2) {
                        for (var i = 0, l = from.length, ar; i < l; i++) {
                            if (ar || !(i in from)) {
                                if (!ar) {
                                    ar = Array.prototype.slice.call(from, 0, i)
                                }
                                ar[i] = from[i];
                            }
                        }
                    }
                    return to.concat(ar || Array.prototype.slice.call(from));
                };
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var color_1 = __webpack_require__("./build/aeft/tools/color.js");

            function getPropertyKeyframes(property) {
                var keyframeData = [];
                for (var i = property.numKeys; i > 0; i--) {
                    var keyIndex = property.nearestKeyIndex(i);
                    var keyTime = property.keyTime(keyIndex);
                    var keyValue = property.keyValue(keyIndex);
                    keyframeData.push([keyTime, keyValue, utils_1.getKeyframeProperties(property, keyIndex)]);
                    property.removeKey(keyIndex);
                }
                return keyframeData;
            }

            function setPropertyKeyframes(property, keyframeData) {
                for (var i = 0; i < keyframeData.length; i += 1) {
                    var newKey = property.addKey((keyframeData[i])[0]);
                    property.setValueAtKey(newKey, (keyframeData[i])[1]);
                    utils_1.setKeyframeProperties(property, (keyframeData[i])[2], newKey);
                }
            }

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                try {
                    for (var selectedLayers_1 = __values(selectedLayers), selectedLayers_1_1 = selectedLayers_1.next(); !selectedLayers_1_1.done; selectedLayers_1_1 = selectedLayers_1.next()) {
                        var selectedLayer = selectedLayers_1_1.value;
                        if (selectedLayer instanceof ShapeLayer || selectedLayer instanceof TextLayer) {
                            return;
                        }
                    }
                } catch (e_1_1) {
                    e_1 = {
                        error: e_1_1
                    };
                } finally {
                    try {
                        if (selectedLayers_1_1 && !selectedLayers_1_1.done && _a = selectedLayers_1["return"]) {
                            _a.call(selectedLayers_1)
                        }
                    } finally {
                        if (e_1) {
                            throw e_1.error
                        }
                    }
                }
                throw utils_1.WrappedError(new Error("No selected layer is ShapeLayer or TextLayer"), errors_1.NO_SELECTED_LAYER_IS_SHAPELAYER_OR_TEXTLAYER)
            }
            exports.check = check;

            function run(fill, stroke) {
                app.beginUndoGroup("Swap Fill & Stroke");
                var composition = utils_1.getComposition();
                composition.selectedLayers.forEach(function(layer) {
                    if (layer instanceof ShapeLayer) {
                        var propWithColors = color_1.findPropertyWithColors(layer.property("ADBE Root Vectors Group"));
                        if (propWithColors) {
                            var fillParentProp = propWithColors.property("ADBE Vector Graphic - Fill");
                            var strokeParentProp = propWithColors.property("ADBE Vector Graphic - Stroke");
                            if (fillParentProp === null || strokeParentProp === null) {
                                return;
                            }
                            var fillProp = fillParentProp.property("ADBE Vector Fill Color");
                            var strokeProp = strokeParentProp.property("ADBE Vector Stroke Color");
                            var fillKeyframes = getPropertyKeyframes(fillProp);
                            var strokeKeyframes = getPropertyKeyframes(strokeProp);
                            var fillEnabled = fillProp.parentProperty.enabled;
                            var strokeEnabled = strokeProp.parentProperty.enabled;
                            var strokeValue = strokeProp.value;
                            var fillValue = fillProp.value;
                            (strokeKeyframes.length > 0 ? setPropertyKeyframes(fillProp, strokeKeyframes) : color_1.setFillColorOnLayer(layer, strokeValue, true, strokeEnabled));
                            (fillKeyframes.length > 0 ? setPropertyKeyframes(strokeProp, fillKeyframes) : color_1.setStrokeColorOnLayer(layer, fillValue, true, fillEnabled));
                        }
                    } else if (layer instanceof TextLayer) {
                        var textProperty = layer.property("ADBE Text Properties").property("ADBE Text Document");
                        var textDocument = textProperty.value;
                        var fillEnabled = textDocument.applyFill;
                        var strokeEnabled = textDocument.applyStroke;
                        textDocument.applyFill = true;
                        textDocument.applyStroke = true;
                        textProperty.setValue(textDocument);
                        textDocument = textProperty.value;
                        var strokeValue = __spreadArray(__spreadArray([], __read(textDocument.strokeColor), false), [1], false);
                        var fillValue = __spreadArray(__spreadArray([], __read(textDocument.fillColor), false), [1], false);
                        color_1.setFillColorOnLayer(layer, strokeValue);
                        color_1.setStrokeColorOnLayer(layer, fillValue);
                        textDocument = textProperty.value;
                        textDocument.applyFill = strokeEnabled;
                        textDocument.applyStroke = fillEnabled;
                        textProperty.setValue(textDocument);
                    } else {
                        color_1.setFillColorOnLayer(layer, stroke);
                        color_1.setStrokeColorOnLayer(layer, fill);
                    }
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/texture.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.test = exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var tap_1 = __webpack_require__("./build/aeft/tap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function getPropertyGetterExpression(compRef, layerName, propertyPath) {
                return "".concat(compRef, ".layer(").concat(JSON.stringify(layerName), ").").concat(propertyPath);
            }

            function getMaskAnchorPointExpression(compRef, layerName) {
                return "".concat(compRef, ".layer(").concat(JSON.stringify(layerName), ").anchorPoint;");
            }

            function getMaskPositionExpression(compRef, layerName) {
                return "\n\t\tvar layer = ".concat(compRef, ".layer(").concat(JSON.stringify(layerName), ");\n\t\tlayer.toWorld(layer.anchorPoint)\n\t\t");
            }

            function getMaskRotationExpression(compRef, layerName) {
                return "\n\t\tvar layer = ".concat(compRef, ".layer(").concat(JSON.stringify(layerName), ");\n\t\tif (layer.hasParent) {\n\t\t\tvar v = layer.toWorldVec([1,0,0]);\n\t\t\tradiansToDegrees(Math.atan2(v[1],v[0]))\n\t\t} else {\n\t\t\tlayer.rotation;\n\t\t}\n\t\t");
            }

            function getMaskScaleExpression(compRef, layerName) {
                return "\n\t\tlayer = ".concat(compRef, ".layer(").concat(JSON.stringify(layerName), ");\n\t\tif (layer.hasParent) {\n\t\t\tsx = layer.scale[0]/100;\n\t\t\tsy = layer.scale[1]/100;\n\t\t\twhile (true){\n\t\t\t\tif (!layer.hasParent) break;\n\t\t\t\tlayer = layer.parent;\n\t\t\t\tsx *= layer.scale[0]/100;\n\t\t\t\tsy *= layer.scale[1]/100;\n\t\t\t}\n\t\t\t[sx,sy] * 100;\n\t\t} else {\n\t\t\tlayer.scale;\n\t\t}\n\t");
            }

            function getDynamicsExpression(compRef, layerName, effectPropertyName) {
                return (("// Mt. Mograph - Motion 4 (3D Dynamics Expression)\nvar controllerLayer = ".concat(compRef, ".layer(").concat(JSON.stringify(layerName), ");\nvar effectProperty = controllerLayer.effect(").concat(JSON.stringify(effectPropertyName), ");\nvar delayEnable = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.delayEnable), ");\nvar delayAmount = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.delayAmount), ");\nvar dynamicsEnable = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.dynamicsEnable), ");\nvar wiggleType = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.dynamicsType), ");\nvar frequency = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.dynamicsFrequency), ");\nvar amount = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.dynamicsAmount), ");\nvar seperationEnabled = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.seperationEnable), ");\nvar seperationX = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.seperationX), ");\nvar seperationY = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.seperationY), ");\nvar seperationZ = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.seperationZ), ");\nvar seedValue = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.dynamicsSeed), ");\nvar newValue;\nif (dynamicsEnable > 0) {\n\tif (wiggleType == 1) {\n\t\tseedRandom(time + (seedValue * 1000));\n\t\tif (seperationEnabled > 0) {\n\t\t\tnewValue = [\n\t\t\t\twiggle(frequency, seperationX)[0],\n\t\t\t\twiggle(frequency, seperationY)[1]\n\t\t\t];\n\t\t\tif (value.length === 3) {\n\t\t\t\tnewValue.push(wiggle(frequency, seperationZ)[2]);\n\t\t\t}\n\t\t} else {\n\t\t\tnewValue = wiggle(frequency, amount);\n\t\t}\n\t} else if (wiggleType == 2) {\n\t\tvar timeVal = Math.round((time + (seedValue * 1000)) * frequency) / frequency;\n\t\tif (seperationEnabled > 0) {\n\t\t\tnewValue = [\n\t\t\t\twiggle(frequency, seperationX, 3, 1, timeVal)[0],\n\t\t\t\twiggle(frequency, seperationY, 3, 1, timeVal)[1],\n\t\t\t];\n\t\t\tif (value.length === 3) {\n\t\t\t\tnewValue.push(wiggle(frequency, seperationZ, 3, 1, timeVal)[2]);\n\t\t\t}\n\t\t} else {\n\t\t\tnewValue = wiggle(frequency, amount, 3, 1, timeVal);\n\t\t}\n\t}\n}\nvar lastValue = (newValue || value) + effectProperty(").concat)(JSON.stringify(ffxMap_1["default"].texture.imagePosition), ");\nif (delayEnable > 0) {\n\tvar offsetTime = time - (delayAmount / 100);\n\tif (dynamicsEnable > 0) {\n\t\tlastValue = (lastValue - thisLayer.position) + controllerLayer.position.valueAtTime(offsetTime);\n\t} else {\n\t\tlastValue = effectProperty(").concat)(JSON.stringify(ffxMap_1["default"].texture.imagePosition), ") + controllerLayer.position.valueAtTime(offsetTime);\n\t}\n}\nlastValue;");
            }

            function getScaleExpression(compRef, layerName, effectPropertyName) {
                return "\nvar controllerLayer = ".concat(compRef, ".layer(").concat(JSON.stringify(layerName), ");\nvar effectProperty = controllerLayer.effect(").concat(JSON.stringify(effectPropertyName), ");\nvar delayEnable = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.delayEnable), ");\nvar delayAmount = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.delayAmount), ");\nvar scaleValue = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.imageScale), ");\nif (delayEnable > 0) {\n\tvar offsetTime = time - (delayAmount / 100);\n\tcontrollerLayer.scale.valueAtTime(offsetTime) * (scaleValue / 100);\n} else {\n\t[scaleValue, scaleValue];\n}");
            }

            function getRotationExpression(compRef, layerName, effectPropertyName) {
                return "\nvar controllerLayer = ".concat(compRef, ".layer(").concat(JSON.stringify(layerName), ");\nvar effectProperty = controllerLayer.effect(").concat(JSON.stringify(effectPropertyName), ");\nvar delayEnable = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.delayEnable), ");\nvar delayAmount = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.delayAmount), ");\nvar rotationValue = effectProperty(").concat(JSON.stringify(ffxMap_1["default"].texture.imageRotation), ");\nif (delayEnable > 0) {\n\tvar offsetTime = time - (delayAmount / 100);\n\tcontrollerLayer.rotation.valueAtTime(offsetTime) + rotationValue;\n} else {\n\trotationValue;\n}");
            }

            function check() {
                var composition = utils_1.getComposition();
                return {
                    composition: composition
                };
            }
            exports.check = check;

            function run(path, sortImages, compositionEnabled) {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 0);
                utils_1.loadEffects();
                app.beginUndoGroup("Texture");
                var footageItem = utils_1.findInCollection(app.project.items, function(item) {
                    return item instanceof FootageItem && !(!item.mainSource) && !(!item.mainSource.file) && item.mainSource.file.fsName === path;
                });
                var folderItem = utils_1.findInCollection(app.project.items, function(item) {
                    return item instanceof FolderItem && item.name === sortImages;
                });
                if (!footageItem) {
                    var importOptions = new ImportOptions(new File(path));
                    footageItem = app.project.importFile(importOptions);
                }
                if (!folderItem) {
                    var imageFolderItem = app.project.items.addFolder(sortImages);
                    imageFolderItem.label = 10;
                    folderItem = imageFolderItem;
                }
                footageItem.parentFolder = folderItem;
                if (selectedLayers.length === 0) {
                    var layer = composition.layers.add(footageItem);
                    var heightRatio = composition.height / layer.height;
                    var widthRatio = composition.width / layer.width;
                    var ratio = (widthRatio > heightRatio ? widthRatio : heightRatio);
                    var scalingNumber = 100;
                    layer.scale.setValue([ratio * scalingNumber, ratio * scalingNumber]);
                    layer.selected = false;
                } else {
                    var copies_1 = [];
                    var images_1 = [];
                    var originalNames_1 = [];
                    var copyNames_1 = [];
                    var effectPropertyNames_1 = [];
                    var copiesToPrecompose_1 = [];
                    var compRef_1 = "comp(".concat(JSON.stringify(composition.name), ")");
                    composition.selectedLayers.forEach(function(layer) {
                        var propertyGroup = layer.property("ADBE Effect Parade");
                        var effectProperty = propertyGroup.addProperty(ffxMap_1["default"].texture.pseudo);
                        effectProperty.name = utils_1.getUniqueName(utils_1.propertyGroupToArray(propertyGroup).map(function(item) {
                            return item.name;
                        }), "Texture ");
                        effectPropertyNames_1.push(effectProperty.name);
                        effectProperty.property(ffxMap_1["default"].texture.imagePosition).setValue([0, 0]);
                        var layerCopy = layer.duplicate();
                        var effectGroup = layerCopy.property("ADBE Effect Parade");
                        for (var i = effectGroup.numProperties; i >= 1; i--) {
                            if (effectGroup.property(i).name.indexOf("Texture") === 0) {
                                effectGroup.property(i).remove();
                            }
                        }
                        layerCopy.name = utils_1.getUniqueNameFromLayers(composition.layers, layer.name);
                        copyNames_1.push(layerCopy.name);
                        originalNames_1.push(layer.name);
                        if (compositionEnabled) {
                            var properties = utils_1.findAllPropertiesWithExpressions(layerCopy);
                            properties.forEach(function(prop) {
                                prop.expression = prop.expression.replace("thisComp", "comp(".concat(JSON.stringify(composition.name), ")"));
                            });
                        }
                        copies_1.push(layerCopy);
                        if (compositionEnabled && !(layerCopy instanceof ShapeLayer && layerCopy.hasTrackMatte)) {
                            copiesToPrecompose_1.push(layerCopy);
                        }
                    });
                    copies_1.forEach(function(layer, i) {
                        layer.name = "[t] " + copyNames_1[i];
                        if (!compositionEnabled && !(layer instanceof ShapeLayer && layer.hasTrackMatte)) {
                            layer.scale.expression = getPropertyGetterExpression(compRef_1, originalNames_1[i], "scale");
                            layer.rotation.expression = getPropertyGetterExpression(compRef_1, originalNames_1[i], "rotation");
                            layer.position.expression = getPropertyGetterExpression(compRef_1, originalNames_1[i], "position");
                            layer.anchorPoint.expression = getPropertyGetterExpression(compRef_1, originalNames_1[i], "anchorPoint");
                        } else {
                            layer.parent = null;
                            layer.scale.expression = getMaskScaleExpression(compRef_1, originalNames_1[i]);
                            layer.rotation.expression = getMaskRotationExpression(compRef_1, originalNames_1[i]);
                            layer.position.expression = getMaskPositionExpression(compRef_1, originalNames_1[i]);
                            layer.anchorPoint.expression = getMaskAnchorPointExpression(compRef_1, originalNames_1[i]);
                        }
                        var image = composition.layers.add(footageItem);
                        image.moveAfter(layer);
                        layer.enabled = false;
                        image.name = layer.name + " - Image";
                        image.transform.position.setValue(layer.position.value);
                        if (layer instanceof ShapeLayer && layer.hasTrackMatte) {
                            var mattedComp_1 = composition.layers.precompose([layer.index], utils_1.getUniqueNameFromLayers(composition.layers, layer.name + " [matted]"), true);
                            utils_1.collectionToArray(mattedComp_1.layers).forEach(function(layer) {
                                if (layer instanceof ShapeLayer && layer.isTrackMatte) {
                                    layer.parent = null;
                                    layer.scale.expression = getMaskScaleExpression(compRef_1, layer.name);
                                    layer.rotation.expression = getMaskRotationExpression(compRef_1, layer.name);
                                    layer.position.expression = getMaskPositionExpression(compRef_1, layer.name);
                                    layer.anchorPoint.expression = getMaskAnchorPointExpression(compRef_1, layer.name);
                                }
                            });
                            utils_1.collectionToArray(composition.layers).forEach(function(l) {
                                if (l.name === mattedComp_1.name) {
                                    l.locked = true;
                                    if (compositionEnabled) {
                                        copiesToPrecompose_1.push(l);
                                    }
                                }
                            });
                        }
                        image.trackMatteType = TrackMatteType.ALPHA;
                        image.locked = true;
                        copiesToPrecompose_1.push(image);
                        images_1.push(image);
                    });
                    images_1.forEach(function(image, i) {
                        image.position.expression = getDynamicsExpression(compRef_1, originalNames_1[i], effectPropertyNames_1[i]);
                        image.scale.expression = getScaleExpression(compRef_1, originalNames_1[i], effectPropertyNames_1[i]);
                        image.rotation.expression = getRotationExpression(compRef_1, originalNames_1[i], effectPropertyNames_1[i]);
                    });
                    var name_1 = utils_1.getUniqueNameFromLayers(app.project.items, "Texture ");
                    if (compositionEnabled) {
                        composition.layers.precompose(copiesToPrecompose_1.map(function(layer) {
                            return layer.index;
                        }), name_1, true);
                    }
                    utils_1.collectionToArray(composition.layers).forEach(function(l) {
                        if (l.name === name_1) {
                            l.locked = true;
                            l.selected = false;
                        }
                    });
                }
                app.endUndoGroup();
            }
            exports.run = run;

            function test(tap) {
                if (tap === void(0)) {
                    tap = new tap_1["default"]("/tmp/texture-test");
                }
                utils_1.undoable("Texture - Test Setup", function() {
                    composition = app.project.items.addComp("Texture Test", 500, 500, 1, 10, 30);
                    composition.openInViewer();
                    var shape1 = composition.layers.addShape();
                    shape1.name = "Shape 1";
                });
                var CEP_ID = "com.mtmograph.motion-next";
                if (!CEP_ID) {
                    var errorMessage = "Error during compilation, CEP_ID missing!";
                    alert(errorMessage);
                    throw new Error(errorMessage)
                }
                run("".concat(($.global[CEP_ID + ".meta"]).extensionPath, "/banner.jpg"), "textures", false);
                tap.test("texture - multiple selected layers", function(t) {
                    var layerNames = utils_1.collectionToArray(composition.layers).map(function(layer) {
                        return layer.name;
                    });
                    t.equals(layerNames[0], "[t] Shape 1", "The shape layer should be present");
                    t.equals(layerNames[1], "Texture", "The Texture composition should be present");
                });
            }
            exports.test = test;
        },
        "./build/aeft/tools/timeline.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run(workareaStart, workareaDuration) {
                var composition = utils_1.getComposition();
                app.beginUndoGroup("Set workarea");
                var currentWorkAreaEnd = composition.workAreaStart + composition.workAreaDuration;
                if (workareaStart >= currentWorkAreaEnd) {
                    composition.workAreaStart = 0;
                    composition.workAreaDuration = composition.duration;
                }
                composition.workAreaStart = workareaStart;
                composition.workAreaDuration = workareaDuration;
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/toggleenabled.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {

            }
            exports.check = check;

            function run(selector, invert) {
                if (invert === void(0)) {
                    invert = false;
                }
                app.beginUndoGroup("Toggle Visibility");
                var layers = utils_1.getLayersForSelector(selector, invert).layers;
                var enabledLayers = utils_1.arrayFilter(layers, function(layer) {
                    return layer.enabled;
                });
                var enabled = layers.length !== enabledLayers.length;
                layers.forEach(function(layer) {
                    layer.enabled = enabled;
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/togglelock.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {

            }
            exports.check = check;

            function run(selector, invert) {
                if (invert === void(0)) {
                    invert = false;
                }
                app.beginUndoGroup("Toggle Lock");
                var layers = utils_1.getLayersForSelector(selector, invert).layers;
                var lockedLayers = utils_1.arrayFilter(layers, function(layer) {
                    return layer.locked;
                });
                var locked = layers.length !== lockedLayers.length;
                layers.forEach(function(layer) {
                    layer.locked = locked;
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/toggleselected.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {

            }
            exports.check = check;

            function run(selector, invert) {
                if (invert === void(0)) {
                    invert = false;
                }
                app.beginUndoGroup("Toggle Selection");
                var layers = utils_1.getLayersForSelector(selector, invert).layers;
                var selectedLayers = utils_1.arrayFilter(layers, function(layer) {
                    return layer.selected;
                });
                var selected = layers.length !== selectedLayers.length;
                layers.forEach(function(layer) {
                    layer.selected = selected;
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/toggleshy.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {

            }
            exports.check = check;

            function run(selector, invert) {
                if (invert === void(0)) {
                    invert = false;
                }
                app.beginUndoGroup("Toggle Shy");
                var _a = utils_1.getLayersForSelector(selector, invert);
                var layers = _a.layers;
                var composition = _a.composition;
                var shyedLayers = utils_1.arrayFilter(layers, function(layer) {
                    return layer.shy;
                });
                var shy = layers.length !== shyedLayers.length;
                layers.forEach(function(layer) {
                    layer.shy = shy;
                });
                composition.hideShyLayers = true;
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/trace.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var utils_2 = __webpack_require__("./build/aeft/utils.js");
            var EFFECTS = "ADBE Effect Parade";
            var MERCURY = "CC Mr. Mercury";

            function addTracer(composition, layers, name) {
                var compositionWidth = composition.width;
                var compositionHeight = composition.height;
                var effectLayers = [];
                layers.forEach(function(layer) {
                    var effectLayerName = "[t] ".concat(layer.name);
                    utils_1.restoreSelectionAfter(function() {
                        var effectLayer = composition.layers.addSolid([1, 1, 1], effectLayerName, compositionWidth, compositionHeight, 1);
                        var effect = effectLayer(EFFECTS).addProperty(MERCURY);
                        effect.name = "Tracer";
                        effectLayers.push(effectLayer);
                        var traceLayerExpression = "// Mt. Mograph - Motion 4 (Tracer)\ntracePoint = comp(".concat(JSON.stringify(composition.name), ")\n.layer(").concat(JSON.stringify(layer.name), ");\ntracePoint.toWorld(tracePoint(\"ADBE Transform Group\")(\"ADBE Anchor Point\"));");
                        effect("CC Mr. Mercury-0003").expression = traceLayerExpression;
                        effect("CC Mr. Mercury-0001").setValue(0.01);
                        effect("CC Mr. Mercury-0002").setValue(0.01);
                        effect("CC Mr. Mercury-0004").setValue(0);
                        effect("CC Mr. Mercury-0005").setValue(0);
                        effect("CC Mr. Mercury-0006").setValue(54);
                        effect("CC Mr. Mercury-0007").setValue(2);
                        effect("CC Mr. Mercury-0008").setValue(2);
                        effect("CC Mr. Mercury-0009").setValue(0.2);
                        effect("CC Mr. Mercury-0010").setValue(1.2);
                        effect("CC Mr. Mercury-0011").setValue(8);
                        effect("CC Mr. Mercury-0014").setValue(0.01);
                        effect("CC Mr. Mercury-0015").setValue(0.01);
                    });
                });
                if (effectLayers.length === 0) {
                    return;
                }
                effectLayers.reverse().forEach(function(layer, i) {
                    if (effectLayers[i - 1]) {
                        layer.moveBefore(effectLayers[i - 1]);
                    }
                });
                var effectLayerIndexes = effectLayers.map(function(effectLayer) {
                    return effectLayer.index;
                });
                var compositionName = utils_1.getUniqueNameFromLayers(composition.layers, (name ? name : "Tracer"));
                composition.layers.precompose(effectLayerIndexes, compositionName, true);
                var highestIndex = utils_1.getHighestIndex(layers);
                var precomposition = composition.layer(1);
                precomposition.moveAfter(composition.layer(highestIndex));
                precomposition.locked = true;
            }

            function runTracer(name) {
                var composition = utils_1.getComposition();
                var selectedLayers = composition.selectedLayers;
                utils_2.fast(function() {
                    return addTracer(composition, selectedLayers, name);
                });
            }

            function check() {
                var composition = utils_1.getComposition();
                var layer = utils_1.getSelectedLayer(composition);
                utils_1.selectedLayersAreAV([layer]);
            }
            exports.check = check;

            function run(name) {
                if (name === void(0)) {
                    name = "Tracer";
                }
                utils_2.undoable("Motion 4 - Tracer", function() {
                    return runTracer(name);
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/trash.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayer(composition);
            }
            exports.check = check;

            function run() {
                var composition = utils_1.getComposition();
                app.beginUndoGroup("Trash");
                utils_1.fast(function() {
                    var layers = composition.selectedLayers;
                    for (var layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
                        var theLayer = layers[layerIndex];
                        var theProperty = theLayer.selectedProperties;
                        for (var propertyIndex = 0; propertyIndex < theProperty.length; propertyIndex += 1) {
                            var property = theProperty[propertyIndex];
                            if (!property.canSetExpression) {
                                continue;
                            }
                            property.expression = "";
                        }
                    }
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/trim.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayer(composition);
            }
            exports.check = check;

            function runTrim() {
                var composition = utils_1.getComposition();
                var layers = composition.selectedLayers;
                layers.forEach(function(layer) {
                    var vectorGroup = layer.property("ADBE Root Vectors Group");
                    if (vectorGroup) {
                        vectorGroup.addProperty("ADBE Vector Filter - Trim");
                    }
                });
            }

            function run() {
                utils_1.undoable("Motion 4 - Trim Paths", runTrim);
            }
            exports.run = run;
        },
        "./build/aeft/tools/unfocus.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.doUnfocus = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var focus_1 = __webpack_require__("./build/aeft/tools/focus.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function doUnfocus(composition) {
                try {
                    var hideShyLayers = utils_1.getCompositionState(composition).hideShyLayers;
                    composition.hideShyLayers = hideShyLayers;
                    focus_1.removeIndicator(composition);
                    utils_1.collectionToArray(composition.layers).forEach(function(layer) {
                        try {
                            var _a = utils_1.getLayerState(layer);
                            var locked = _a.locked;
                            var shy = _a.shy;
                            var enabled = _a.enabled;
                            var selected = _a.selected;
                            layer.shy = shy;
                            layer.enabled = enabled;
                            layer.locked = locked;
                            layer.selected = selected;
                            utils_1.delLayerState(layer);
                        } catch (err) {

                        }
                    });
                    utils_1.delCompositionState(composition);
                } catch (err) {

                }
            }
            exports.doUnfocus = doUnfocus;

            function run() {
                utils_1.fast(function(comp) {
                    doUnfocus(comp);
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/vector.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var EFFECTS = "ADBE Effect Parade";
            var LASER = "ADBE Laser";
            var LASER_START_POSITION = "ADBE Laser-0001";
            var LASER_END_POSITION = "ADBE Laser-0002";
            var LASER_LENGTH = "ADBE Laser-0003";
            var LASER_TIME = "ADBE Laser-0004";
            var LASER_STARTING_THICKNESS = "ADBE Laser-0005";
            var LASER_ENDING_THICKNESS = "ADBE Laser-0006";
            var LASER_SOFTNESS = "ADBE Laser-0007";
            var LASER_INSIDE_COLOR = "ADBE Laser-0008";
            var LASER_OUTSIDE_COLOR = "ADBE Laser-0009";
            var HUE = "ADBE Color Balance (HLS)";

            function getAnchorPointExpression(compositionName, layerName) {
                return "// Mt. Mograph - Vector\nlayer = comp(".concat(JSON.stringify(compositionName), ").layer(").concat(JSON.stringify(layerName), ")\nfromComp(layer.toComp(layer.anchorPoint))");
            }

            function createRopeLayer(composition, fromLayer, toLayer, compositionName) {
                var solidColor = [0, 0, 0];
                var solidName = utils_1.getUniqueNameFromLayers(composition.layers, "Vector");
                utils_1.restoreSelectionAfter(function() {
                    ropeLayer = composition.layers.addSolid(solidColor, solidName, composition.width, composition.height, 1, composition.duration);
                    var effect = utils_1.ensureProperty(ropeLayer, [EFFECTS, LASER]);
                    effect.name = "Vector";
                    effect.property(LASER_START_POSITION).expression = getAnchorPointExpression(composition.name, fromLayer.name);
                    effect.property(LASER_END_POSITION).expression = getAnchorPointExpression(composition.name, toLayer.name);
                    effect.property(LASER_INSIDE_COLOR).setValue([127, 127, 127]);
                    effect.property(LASER_INSIDE_COLOR).expression = "comp(\"".concat(composition.name, "\").layer(\"").concat(compositionName, "\")(\"ADBE Effect Parade\")(\"").concat(ffxMap_1["default"].vector.pseudo, "\")(\"").concat(ffxMap_1["default"].vector.color, "\")");
                    effect.property(LASER_OUTSIDE_COLOR).setValue([127, 127, 127]);
                    effect.property(LASER_STARTING_THICKNESS).expression = ((((("var effectProp = comp(\"".concat(composition.name, "\").layer(\"").concat(compositionName, "\")(\"ADBE Effect Parade\")(\"").concat(ffxMap_1["default"].vector.pseudo, "\");\n      var enable = effectProp(\"").concat(ffxMap_1["default"].vector.strokeVariationEnable, "\");\n      if (enable == 1) {\n        var base = effectProp(\"").concat)(ffxMap_1["default"].vector.strokeWidth, "\")\n        var minWidth = base + effectProp(\"").concat)(ffxMap_1["default"].vector.strokeVariationRangeStarting, "\").value[0];\n        var maxWidth = base + effectProp(\"").concat)(ffxMap_1["default"].vector.strokeVariationRangeStarting, "\").value[1];\n        seedRandom(effectProp(\"").concat)(ffxMap_1["default"].vector.strokeVariationSeed, "\"), true);\n        (random() * (maxWidth - minWidth)) + minWidth;\n      } else {\n        effectProp(\"").concat)(ffxMap_1["default"].vector.strokeWidth, "\");\n      }\n    ");
                    effect.property(LASER_ENDING_THICKNESS).expression = ((((("var effectProp = comp(\"".concat(composition.name, "\").layer(\"").concat(compositionName, "\")(\"ADBE Effect Parade\")(\"").concat(ffxMap_1["default"].vector.pseudo, "\");\n      var enable = effectProp(\"").concat(ffxMap_1["default"].vector.strokeVariationEnable, "\");\n      if (enable == 1) {\n        var base = effectProp(\"").concat)(ffxMap_1["default"].vector.strokeWidth, "\");\n        var minWidth = base + effectProp(\"").concat)(ffxMap_1["default"].vector.strokeVariationRangeEnding, "\").value[0];\n        var maxWidth = base + effectProp(\"").concat)(ffxMap_1["default"].vector.strokeVariationRangeEnding, "\").value[1];\n        seedRandom(effectProp(\"").concat)(ffxMap_1["default"].vector.strokeVariationSeed, "\"), true);\n        (random() * (maxWidth - minWidth)) + minWidth;\n      } else {\n        effectProp(\"").concat)(ffxMap_1["default"].vector.strokeWidth, "\");\n      }\n    ");
                    effect.property(LASER_TIME).expression = ((((("var effectProp = comp(\"".concat(composition.name, "\").layer(\"").concat(compositionName, "\")(\"ADBE Effect Parade\")(\"").concat(ffxMap_1["default"].vector.pseudo, "\");\n      var enable = effectProp(\"").concat(ffxMap_1["default"].vector.writeOnVariationEnable, "\");\n      if (enable == 1) {\n        var base = effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnTime, "\");\n        var minWidth = base + effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnVariationTime, "\").value[0];\n        var maxWidth = base + effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnVariationTime, "\").value[1];\n        seedRandom(effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnVariationSeed, "\"), true);\n        (random() * (maxWidth - minWidth)) + minWidth;\n      } else {\n        effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnTime, "\");\n      }\n    ");
                    effect.property(LASER_LENGTH).expression = ((((("var effectProp = comp(\"".concat(composition.name, "\").layer(\"").concat(compositionName, "\")(\"ADBE Effect Parade\")(\"").concat(ffxMap_1["default"].vector.pseudo, "\");\n      var enable = effectProp(\"").concat(ffxMap_1["default"].vector.writeOnVariationEnable, "\");\n      if (enable == 1) {\n        var base = effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnLength, "\");\n        var minWidth = base + effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnVariationLength, "\").value[0];\n        var maxWidth = base + effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnVariationLength, "\").value[1];\n        seedRandom(effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnVariationEnable, "\"), true);\n        (random() * (maxWidth - minWidth)) + minWidth;\n      } else {\n        effectProp(\"").concat)(ffxMap_1["default"].vector.writeOnLength, "\");\n      }\n    ");
                    effect.property(LASER_OUTSIDE_COLOR).expression = "comp(\"".concat(composition.name, "\").layer(\"").concat(compositionName, "\")(\"ADBE Effect Parade\")(\"").concat(ffxMap_1["default"].vector.pseudo, "\")(\"").concat(ffxMap_1["default"].vector.color, "\")");
                    effect.property(LASER_SOFTNESS).setValue([0]);
                    effect.property(LASER_LENGTH).setValue([1]);
                    var hueEffect = utils_1.ensureProperty(ropeLayer, [EFFECTS, HUE]);
                    hueEffect.name = "Vector Hue";
                    hueEffect.property(HUE + "-0001").expression = "parentLayer = comp(\"".concat(composition.name, "\").layer(\"").concat(compositionName, "\");\nindex_adjust = index - (parentLayer.index);\nglobalEffect = parentLayer(\"ADBE Effect Parade\")(\"").concat(ffxMap_1["default"].vector.pseudo, "\");\nenable_color = globalEffect(\"").concat(ffxMap_1["default"].vector.colorVariationEnable, "\");\ncolor_seed = globalEffect(\"").concat(ffxMap_1["default"].vector.colorVariationSeed, "\");\ncolor_cycle = globalEffect(\"").concat(ffxMap_1["default"].vector.colorVariationCycle, "\") / 100;\nif (enable_color == 1) {\n  (color_seed * index_adjust) * color_cycle;\n} else {\n  0;\n}");
                });
                return ropeLayer;
            }

            function addRope(composition, layers, connectionType) {
                var connections = [];
                var ropeLayers = [];
                if (layers.length < 2) {
                    return;
                }
                var compositionName = utils_1.getUniqueNameFromLayers(composition.layers, "Vector");
                layers.forEach(function(layer, i) {
                    switch (connectionType) {
                        case "CONNECT_ALL":
                            layers.forEach(function(otherLayer) {
                                if (layer === otherLayer || connections.indexOf(layer.name + "-" + otherLayer.name) > -1) {
                                    return;
                                }
                                var l = createRopeLayer(composition, layer, otherLayer, compositionName);
                                if (l !== undefined) {
                                    ropeLayers.push(l);
                                }
                                connections.push(layer.name + "-" + otherLayer.name);
                                connections.push(otherLayer.name + "-" + layer.name);
                            });
                            break;
                        case "CONNECT":
                            if (layers[i + 1]) {
                                var l = createRopeLayer(composition, layer, layers[i + 1], compositionName);
                                if (l !== undefined) {
                                    ropeLayers.push(l);
                                }
                            }
                            break;
                        case "CONNECT_AND_CLOSE":
                            if (layers[i + 1]) {
                                var l = createRopeLayer(composition, layer, layers[i + 1], compositionName);
                                if (l !== undefined) {
                                    ropeLayers.push(l);
                                }
                            } else {
                                var l = createRopeLayer(composition, layer, layers[0], compositionName);
                                if (l !== undefined) {
                                    ropeLayers.push(l);
                                }
                            }
                            break;
                    }
                });
                ropeLayers.reverse().forEach(function(layer, i) {
                    if (ropeLayers[i - 1]) {
                        layer.moveBefore(ropeLayers[i - 1]);
                    }
                });
                var ropeLayerIndexes = ropeLayers.map(function(ropeLayer) {
                    return ropeLayer.index;
                });
                composition.layers.precompose(ropeLayerIndexes, compositionName, true);
                var highestIndex = utils_1.getHighestIndex(layers);
                var precomposition = composition.layer(1);
                precomposition.moveAfter(composition.layer(highestIndex));
                var effect = precomposition.property("ADBE Effect Parade").addProperty(ffxMap_1["default"].vector.pseudo);
                effect.name = "Vector Controls";
            }

            function check() {
                var composition = utils_1.getComposition();
                var layers = utils_1.getSelectedLayers(composition, 1);
                utils_1.selectedLayersAreAV(layers);
            }
            exports.check = check;

            function run(connectionType) {
                if (connectionType === void(0)) {
                    connectionType = "CONNECT_ALL";
                }
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition);
                utils_1.loadEffects();
                utils_1.undoable("Motion 4 - Vector", function() {
                    return utils_1.fast(function() {
                        return addRope(composition, selectedLayers, connectionType);
                    });
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/vectorbreak.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __values = this && this.__values || function(o) {
                    var s = typeof Symbol === "function" && Symbol.iterator;
                    var m = s && o[s];
                    var i = 0;
                    if (m) {
                        return m.call(o);
                    }
                    if (o && typeof o.length === "number") {
                        return {
                            next: function() {
                                if (o && i >= o.length) {
                                    o = void(0)
                                }
                                return {
                                    value: o && o[i++],
                                    done: !o
                                };
                            }
                        };
                    }
                    throw new TypeError((s ? "Object is not iterable." : "Symbol.iterator is not defined."))
                };
            var __read = this && this.__read || function(o, n) {
                    var m = typeof Symbol === "function" && o[Symbol.iterator];
                    if (!m) {
                        return o;
                    }
                    var i = m.call(o);
                    var ar = [];
                    try {
                        while (n === void(0) || n-- > 0 && !(r = i.next()).done) {
                            ar.push(r.value)
                        }
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            if (r && !r.done && m = i["return"]) {
                                m.call(i)
                            }
                        } finally {
                            if (e) {
                                throw e.error
                            }
                        }
                    }
                    return ar;
                };
            var __spreadArray = this && this.__spreadArray || function(to, from, pack) {
                    if (pack || arguments.length === 2) {
                        for (var i = 0, l = from.length, ar; i < l; i++) {
                            if (ar || !(i in from)) {
                                if (!ar) {
                                    ar = Array.prototype.slice.call(from, 0, i)
                                }
                                ar[i] = from[i];
                            }
                        }
                    }
                    return to.concat(ar || Array.prototype.slice.call(from));
                };
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");
            var anchor = __webpack_require__("./build/aeft/tools/anchor.js");

            function check() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition, 1);
                try {
                    for (var selectedLayers_1 = __values(selectedLayers), selectedLayers_1_1 = selectedLayers_1.next(); !selectedLayers_1_1.done; selectedLayers_1_1 = selectedLayers_1.next()) {
                        var selectedLayer = selectedLayers_1_1.value;
                        if (selectedLayer instanceof ShapeLayer || selectedLayer instanceof AVLayer) {
                            return;
                        }
                    }
                } catch (e_1_1) {
                    e_1 = {
                        error: e_1_1
                    };
                } finally {
                    try {
                        if (selectedLayers_1_1 && !selectedLayers_1_1.done && _a = selectedLayers_1["return"]) {
                            _a.call(selectedLayers_1)
                        }
                    } finally {
                        if (e_1) {
                            throw e_1.error
                        }
                    }
                }
                throw utils_1.WrappedError(new Error("No selected layer is AVLayer or ShapeLayer"), errors_1.NO_SELECTED_LAYER_IS_SHAPELAYER_OR_AVLAYER)
            }
            exports.check = check;

            function looseFindLastPropertyGroup(layerOrPropertyGroup, name) {
                for (var i = layerOrPropertyGroup.numProperties; i > 0; i--) {
                    var propertyGroup = layerOrPropertyGroup.property(i);
                    if (propertyGroup instanceof PropertyGroup) {
                        if (propertyGroup.name.indexOf(name) > -1) {
                            return propertyGroup;
                        }
                        var search = looseFindLastPropertyGroup(propertyGroup, name);
                        if (search !== null) {
                            return search;
                        }
                    }
                }
                return null;
            }

            function createCopy(selectedLayer, propertyGroup, copies, targetProperty, parentGroup) {
                for (var i = propertyGroup.length; i > 0; i--) {
                    var copy = selectedLayer.duplicate();
                    copy.enabled = false;
                    copy.shy = true;
                    copy.moveAfter(selectedLayer);
                    copies.push(copy);
                    copy.name = selectedLayer.name + " - " + (propertyGroup[i - 1]).name;
                    if (targetProperty === "Group") {
                        var propertyGroupCopy = copy.property("ADBE Root Vectors Group");
                        for (var j = propertyGroupCopy.numProperties; j > 0; j--) {
                            if (j !== i) {
                                propertyGroupCopy.property(j).remove();
                            }
                        }
                    } else {
                        if (parentGroup !== undefined) {
                            var propertyPath = utils_1.toPropertyPath(false)(parentGroup);
                            var propertyGroupCopy = copy.property(propertyPath[0]).property(propertyPath[1]).property(propertyPath[2]);
                            for (var k = propertyGroupCopy.numProperties; k > 0; k--) {
                                if (k !== i) {
                                    var nestedProperty = propertyGroupCopy.property(k);
                                    if (nestedProperty.matchName === "ADBE Vector Shape - Group") {
                                        propertyGroupCopy.property(k).remove();
                                    }
                                }
                            }
                        }
                    }
                }
            }

            function runVectorBreak(composition, selectedLayers) {
                var compShy = composition.hideShyLayers;
                composition.hideShyLayers = true;
                var selectedLayersCopy = __spreadArray([], __read(selectedLayers), false);
                var copies = [];
                selectedLayers.forEach(function(layer) {
                    layer.selected = false;
                });
                selectedLayersCopy.forEach(function(selectedLayer) {
                    if (selectedLayer instanceof TextLayer) {
                        return;
                    }
                    if (selectedLayer instanceof AVLayer) {
                        selectedLayer.selected = true;
                        app.executeCommand(3973);
                        utils_1.collectionToArray(composition.layers).forEach(function(layer) {
                            if (layer.name.indexOf(selectedLayer.name.replace(".ai", "")) > -1 && layer.name.indexOf("Outlines") > -1) {
                                utils_1.propertyGroupToArray(layer.property("ADBE Root Vectors Group")).forEach(function(vec, i) {
                                    var copy = layer.duplicate();
                                    copy.enabled = false;
                                    copy.shy = true;
                                    copy.moveBefore(selectedLayer);
                                    copies.push(copy);
                                    copy.name = selectedLayer.name.replace(".ai", "") + " - " + vec.name;
                                    var propertyGroup = copy.property("ADBE Root Vectors Group");
                                    for (var j = propertyGroup.numProperties; j > 0; j--) {
                                        var property = propertyGroup.property(j);
                                        if (j !== (i + 1)) {
                                            property.remove();
                                        } else {
                                            var mergePath = looseFindLastPropertyGroup(property, "Merge Paths");
                                            if (mergePath) {
                                                var group = looseFindLastPropertyGroup(property, "Group");
                                                if (group) {
                                                    mergePath.remove();
                                                    var groupToRemove = looseFindLastPropertyGroup(property, "Group");
                                                    if (groupToRemove) {
                                                        groupToRemove.remove();
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });
                                layer.remove();
                            }
                        });
                    } else {
                        var vectorGroupLength_1 = 0;
                        var propertyGroup = utils_1.propertyGroupToArray(selectedLayer.property("ADBE Root Vectors Group"));
                        propertyGroup.forEach(function(property) {
                            if (property.matchName === "ADBE Vector Group") {
                                vectorGroupLength_1++
                            }
                        });
                        if (vectorGroupLength_1 === 1) {
                            var pathGroup = selectedLayer.property("ADBE Root Vectors Group").property("ADBE Vector Group");
                            for (var j = pathGroup.numProperties; j > 0; j--) {
                                var property = pathGroup.property(j);
                                if (property.matchName === "ADBE Vectors Group") {
                                    var groupProperty = property;
                                    var propertiesArray = utils_1.arrayFilter(utils_1.propertyGroupToArray(groupProperty), function(property) {
                                        return property.matchName === "ADBE Vector Shape - Group";
                                    });
                                    if (propertiesArray.length <= 1) {
                                        return;
                                    }
                                    createCopy(selectedLayer, propertiesArray, copies, "Path", groupProperty);
                                }
                            }
                        } else {
                            createCopy(selectedLayer, propertyGroup, copies, "Group");
                        }
                        selectedLayer.enabled = false;
                    }
                    selectedLayer.selected = false;
                });
                copies.forEach(function(copy) {
                    copy.selected = true;
                    copy.enabled = true;
                    copy.shy = false;
                });
                anchor.runAnchorOld(0.5, 0.5, false, false, false, false, false, false);
                composition.hideShyLayers = compShy;
            }

            function run() {
                var composition = utils_1.getComposition();
                var selectedLayers = utils_1.getSelectedLayers(composition);
                utils_1.undoable("Motion 4 - Vector Break", function() {
                    return runVectorBreak(composition, selectedLayers);
                });
            }
            exports.run = run;
        },
        "./build/aeft/tools/vignette.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var ffxMap_1 = __webpack_require__("./build/aeft/ffxMap.js");
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                utils_1.getComposition();
            }
            exports.check = check;

            function run() {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Vignette");
                utils_1.fast(function() {
                    var precompLayers = 1;
                    var compName = composition.name;
                    var compLayers = composition.layers;
                    var vignWidth = composition.width;
                    var vignHeight = composition.height;
                    var vignBase = composition.layers.addSolid([0, 0, 0], utils_1.getUniqueNameFromLayers(app.project.items, "Vignette BG"), vignWidth, vignHeight, composition.pixelAspect);
                    var vignAlpha = composition.layers.addShape();
                    vignAlpha.name = "Vignette Alpha";
                    var createCircle = vignAlpha.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
                    createCircle.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
                    createCircle.property("ADBE Vectors Group").property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([vignHeight, vignHeight]);
                    createCircle.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
                    createCircle.name = "Circle";
                    var createOval = vignAlpha.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
                    createOval.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
                    createOval.property("ADBE Vectors Group").property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([vignWidth, vignHeight]);
                    createOval.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
                    createOval.name = "Ellipse";
                    vignBase.trackMatteType = TrackMatteType.ALPHA_INVERTED;
                    vignAlpha.property("ADBE Effect Parade").addProperty("Fast Box Blur");
                    if (precompLayers) {
                        var precompose_layers = [];
                        precompose_layers[0] = vignBase.index;
                        precompose_layers[1] = vignAlpha.index;
                        var newPreCompName = utils_1.getUniqueNameFromLayers(app.project.items, "Vignette");
                        var vignetteBgName = vignBase.name;
                        var twoSidedPrecomp = compLayers.precompose(precompose_layers, newPreCompName, true);
                        var twoSidedLayer = composition.selectedLayers[0];
                        twoSidedLayer.collapseTransformation = true;
                        twoSidedLayer.blendingMode = BlendingMode.MULTIPLY;
                        twoSidedLayer.property("ADBE Transform Group").property("ADBE Opacity").setValue(85);
                        var lockPositionExp = "xValue = thisComp.width / 2;\nyValue = thisComp.height / 2;\n \ntransform.position = [xValue, yValue];";
                        var turnOnOff = "useColorOn = effect(\"" + ffxMap_1["default"].vignette.pseudo + "\")(\"" + ffxMap_1["default"].vignette.intensity + "\");\n" + "if (useColorOn == 0) {\n" + "value = 0;\n" + "} else {\n" + "value = value;\n" + "};";
                        twoSidedLayer.property("ADBE Transform Group").property("ADBE Position").expression = lockPositionExp;
                        if (twoSidedLayer("ADBE Effect Parade") !== null) {
                            if (twoSidedLayer("ADBE Effect Parade").canAddProperty(ffxMap_1["default"].vignette.pseudo)) {
                                var vignetteEffect = twoSidedLayer("ADBE Effect Parade").addProperty(ffxMap_1["default"].vignette.pseudo);
                                vignetteEffect.name = "Vignette";
                                vignetteEffect.property(ffxMap_1["default"].vignette.feather).setValue(224);
                                vignetteEffect.property(ffxMap_1["default"].vignette.feather).expression = "clamp(value, 0, 9999);";
                                vignetteEffect.property(ffxMap_1["default"].vignette.intensity).setValue(20);
                                vignetteEffect.property(ffxMap_1["default"].vignette.intensity).expression = "clamp(value, 0, 100);";
                                vignetteEffect.property(ffxMap_1["default"].vignette.scale).setValue(100);
                                vignetteEffect.property(ffxMap_1["default"].vignette.ellipse).setValue(1);
                            }
                        }
                        twoSidedLayer.name = newPreCompName;
                        twoSidedLayer.property("ADBE Transform Group").property("ADBE Opacity").expression = turnOnOff;
                        var opacityExp = "opacity = comp(\"" + compName + "\").layer(\"" + newPreCompName + "\").effect(\"" + ffxMap_1["default"].vignette.pseudo + "\")(\"" + ffxMap_1["default"].vignette.intensity + "\");\n";
                        var featherExp = "feather = comp(\"" + compName + "\").layer(\"" + newPreCompName + "\").effect(\"" + ffxMap_1["default"].vignette.pseudo + "\")(\"" + ffxMap_1["default"].vignette.feather + "\");\n";
                        var scaleExp = "re_scale = comp(\"" + compName + "\").layer(\"" + newPreCompName + "\").effect(\"" + ffxMap_1["default"].vignette.pseudo + "\")(\"" + ffxMap_1["default"].vignette.scale + "\");\n" + "[re_scale, re_scale];";
                        var positionExp = "newPos = comp(\"" + compName + "\").layer(\"" + newPreCompName + "\").effect(\"" + ffxMap_1["default"].vignette.pseudo + "\")(\"" + ffxMap_1["default"].vignette.position + "\");\n";
                        var useCircleExp = "on_off = comp(\"" + compName + "\").layer(\"" + newPreCompName + "\").effect(\"" + ffxMap_1["default"].vignette.pseudo + "\")(\"" + ffxMap_1["default"].vignette.ellipse + "\");\n" + "if (on_off == 0) {\n" + "value = 100;\n" + "} else {\n" + "value = 0;\n" + "};";
                        var useEllipseExp = "on_off = comp(\"" + compName + "\").layer(\"" + newPreCompName + "\").effect(\"" + ffxMap_1["default"].vignette.pseudo + "\")(\"" + ffxMap_1["default"].vignette.ellipse + "\");\n" + "if (on_off == 0) {\n" + "value = 0;\n" + "} else {\n" + "value = 100;\n" + "};";
                        twoSidedPrecomp.layer(vignetteBgName).property("ADBE Transform Group").property("ADBE Opacity").expression = opacityExp;
                        twoSidedPrecomp.layer("Vignette Alpha").property("ADBE Transform Group").property("ADBE Scale").expression = scaleExp;
                        twoSidedPrecomp.layer("Vignette Alpha").property("ADBE Transform Group").property("ADBE Position").expression = positionExp;
                        twoSidedPrecomp.layer("Vignette Alpha").property("ADBE Effect Parade").property("Fast Box Blur").property("Blur Radius").expression = featherExp;
                        twoSidedPrecomp.layer("Vignette Alpha").property("ADBE Root Vectors Group").property(1).property("ADBE Vector Transform Group").property("ADBE Vector Group Opacity").expression = useCircleExp;
                        twoSidedPrecomp.layer("Vignette Alpha").property("ADBE Root Vectors Group").property(2).property("ADBE Vector Transform Group").property("ADBE Vector Group Opacity").expression = useEllipseExp;
                    }
                });
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/tools/warp.js": function(__unused_webpack_module, exports, __webpack_require__) {
            exports.__esModule = true;
            exports.run = exports.check = void(0);
            var utils_1 = __webpack_require__("./build/aeft/utils.js");

            function check() {
                var composition = utils_1.getComposition();
                utils_1.getSelectedLayer(composition);
            }
            exports.check = check;

            function run() {
                var composition = utils_1.getComposition();
                utils_1.loadEffects();
                app.beginUndoGroup("Warp");
                utils_1.fast(function() {
                    var selectedLayers = composition.selectedLayers;
                    for (var num = 0; num < selectedLayers.length; num += 1) {
                        var selectedLayer = selectedLayers[num];
                        if (selectedLayer.property("ADBE Effect Parade").property("Warp Time") !== null) {
                            continue;
                        }
                        var effectPropertyGroup = selectedLayer.property("ADBE Effect Parade");
                        var addWarp = effectPropertyGroup.addProperty("ADBE Echo");
                        addWarp.name = "Warp Time";
                        addWarp.property("ADBE Echo-0001").setValue(-0.006);
                        addWarp.property("ADBE Echo-0002").setValue(16);
                        addWarp.property("ADBE Echo-0005").setValue(2);
                        var addEdgeSmooth = effectPropertyGroup.addProperty("ADBE Matte Choker");
                        addEdgeSmooth.name = "Edge Smooth";
                        addEdgeSmooth.property("ADBE Matte Choker-0001").setValue(24.5);
                        addEdgeSmooth.property("ADBE Matte Choker-0002").setValue(66);
                        var addObjectSmooth = effectPropertyGroup.addProperty("ADBE Simple Choker");
                        addObjectSmooth.name = "Object Crush";
                        addObjectSmooth.property("ADBE Simple Choker-0002").setValue(12);
                    }
                }, composition.selectedLayers.length < 4);
                app.endUndoGroup();
            }
            exports.run = run;
        },
        "./build/aeft/utils.js": function(__unused_webpack_module, exports, __webpack_require__) {
            var __read = this && this.__read || function(o, n) {
                    var m = typeof Symbol === "function" && o[Symbol.iterator];
                    if (!m) {
                        return o;
                    }
                    var i = m.call(o);
                    var ar = [];
                    try {
                        while (n === void(0) || n-- > 0 && !(r = i.next()).done) {
                            ar.push(r.value)
                        }
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            if (r && !r.done && m = i["return"]) {
                                m.call(i)
                            }
                        } finally {
                            if (e) {
                                throw e.error
                            }
                        }
                    }
                    return ar;
                };
            var __spreadArray = this && this.__spreadArray || function(to, from, pack) {
                    if (pack || arguments.length === 2) {
                        for (var i = 0, l = from.length, ar; i < l; i++) {
                            if (ar || !(i in from)) {
                                if (!ar) {
                                    ar = Array.prototype.slice.call(from, 0, i)
                                }
                                ar[i] = from[i];
                            }
                        }
                    }
                    return to.concat(ar || Array.prototype.slice.call(from));
                };
            var __values = this && this.__values || function(o) {
                    var s = typeof Symbol === "function" && Symbol.iterator;
                    var m = s && o[s];
                    var i = 0;
                    if (m) {
                        return m.call(o);
                    }
                    if (o && typeof o.length === "number") {
                        return {
                            next: function() {
                                if (o && i >= o.length) {
                                    o = void(0)
                                }
                                return {
                                    value: o && o[i++],
                                    done: !o
                                };
                            }
                        };
                    }
                    throw new TypeError((s ? "Object is not iterable." : "Symbol.iterator is not defined."))
                };
            exports.__esModule = true;
            exports.toPropertyPath = exports.test = exports.loadEffects = exports.layerForProperty = exports.safelyAddPoint = exports.safelySetPoint = exports.safelySetValue = exports.harvestPoint = exports.debugExpressionVariable = exports.debugGrid = exports.debugPoint = exports.debugBounds = exports.isOneTwoThreeDProperty = exports.isShapeProperty = exports.isNoValueProperty = exports.isColorProperty = exports.isThreeDProperty = exports.isTwoDProperty = exports.isOneDProperty = exports.isProperty = exports.isPropertyGroup = exports.isAVLayer = exports.layerToBounds = exports.moveLayerBeforeSelectedLayers = exports.getHighestIndex = exports.getLowestIndex = exports.getUniqueNameFromLayers = exports.getUniqueName = exports.ensureEffect = exports.undoable = exports.genfun = exports.clamp = exports.remap = exports.invLerp = exports.lerp = exports.propertyGroupToArray = exports.collectionToArray = exports.findInCollection = exports.setPropertyAtPath = exports.getPropertyAtPath = exports.propertyToPropertyPath = exports.getSelectedPropertyOnComposition = exports.getSelectedPropertiesOnComposition = exports.getSelectedPropertyOnLayer = exports.getSelectedPropertiesOnLayer = exports.selectedLayersAreAV = exports.getSelectedLayer = exports.getSelectedLayers = exports.getComposition = exports.WrappedError = void(0);
            exports.arrayFilter = exports.getLabelColor = exports.getEarliestTime = exports.setKeyframeProperties = exports.getKeyframeProperties = exports.findAllPropertiesWithExpressions = exports.getLayersForSelector = exports.findProjectItemByName = exports.delLayerState = exports.getLayerTags = exports.setLayerTags = exports.compositionEnsureTags = exports.ensureCompositionTagColors = exports.setCompositionTagColors = exports.setCompositionTags = exports.getCompositionTagColors = exports.getCompositionTags = exports.captureSnapshot = exports.getLayerState = exports.setLayerState = exports.delCompositionState = exports.getCompositionState = exports.setCompositionState = exports.delMarkerForSubstring = exports.getMarkerTimeForSubstring = exports.getMarkerForSubstring = exports.getMarkerForTime = exports.setMarker = exports.ensureProperty = exports.deselectAll = exports.tag = exports.restoreSelectionAfter = exports.layersToLooper = exports.getLayerForProperty = exports.prop = exports.compose = exports.propertiesToGetterFromComp = exports.propertiesToGetter = exports.layersToGetter = exports.fast = exports.filterByName = exports.propertyToGetterFromComp = exports.propertyToGetter = exports.layerToGetter = exports.toPropertyGetter = exports.toPrettyPropertyPath = void(0);
            var console_1 = __webpack_require__("./build/aeft/console.js");
            var errors_1 = __webpack_require__("./build/aeft/errors.js");
            var tap_1 = __webpack_require__("./build/aeft/tap.js");
            var FFX_FILES = ["mtmo-blend.ffx", "mtmo-burst.ffx", "mtmo-excite.ffx", "mtmo-forcefield.ffx", "mtmo-guides.ffx", "mtmo-jump.ffx", "mtmo-orbit.ffx", "mtmo-spin.ffx", "mtmo-stare.ffx", "mtmo-vignette.ffx", "midas_global_final.ffx", "midas-1d-child.ffx", "midas-1d-parent.ffx", "midas-2d-child.ffx", "midas-2d-parent.ffx", "midas-3d-child.ffx", "midas-3d-parent.ffx", "midas-animo-parent.ffx", "midas-cloth-parent.ffx", "midas-cloth-global.ffx", "1.1.0-midas-global.ffx", "1.1.0-midas-cloth-global.ffx", "1.1.0-midas-1d-parent.ffx", "1.1.0-midas-2d-parent.ffx", "1.1.0-midas-3d-parent.ffx", "1.1.1-midas-wiggle.ffx", "1.1.6-midas-animo.ffx", "m3-dyn-1d.ffx", "m3-dyn-2d.ffx", "m3-dyn-3d.ffx", "m3-texture.ffx", "m3-falloff-gen.ffx", "m3-falloff-1d.ffx", "m3-falloff-2d.ffx", "m3-falloff-3d.ffx", "m3-falloff-color.ffx", "m3-vector-parent.ffx"];

            function WrappedError(error, code) {
                if (code === void(0)) {
                    code = errors_1.FATAL_ERROR;
                }
                return {
                    name: "ExtendScriptError",
                    message: error.message,
                    code: code,
                    source: error.source,
                    line: error.line,
                    stack: $.stack
                };
            }
            exports.WrappedError = WrappedError;

            function getComposition() {
                if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
                    throw WrappedError(new Error("No active composition"), errors_1.NO_ACTIVE_COMPOSITION)
                }
                return app.project.activeItem;
            }
            exports.getComposition = getComposition;

            function getSelectedLayers(composition, minimum) {
                if (minimum === void(0)) {
                    minimum = 1;
                }
                if (composition.selectedLayers.length < minimum) {
                    throw WrappedError(new Error("Not enough selected layers (minimum: ".concat(minimum, ") in composition: ").concat(composition.name)), errors_1.NOT_ENOUGH_SELECTED_LAYERS)
                }
                return __spreadArray([], __read(composition.selectedLayers), false);
            }
            exports.getSelectedLayers = getSelectedLayers;

            function getSelectedLayer(composition) {
                return getSelectedLayers(composition, 1)[0];
            }
            exports.getSelectedLayer = getSelectedLayer;

            function selectedLayersAreAV(layers) {
                if (layers.every(function(layer) {
                    return isAVLayer(layer);
                })) {
                    return true;
                } else {
                    throw WrappedError(new Error("Invalid Layer Type Selected"), errors_1.INVALID_LAYER_TYPE)
                }
            }
            exports.selectedLayersAreAV = selectedLayersAreAV;

            function getSelectedPropertiesOnLayer(layer, minimum) {
                if (minimum === void(0)) {
                    minimum = 1;
                }
                if (layer.selectedProperties.length < minimum) {
                    throw WrappedError(new Error("选择的属性不够(最小值:".concat(minimum, ")在层上:").concat(layer.name)), errors_1.NOT_ENOUGH_SELECTED_PROPERTIES_ON_LAYER)
                }
                return __spreadArray([], __read(layer.selectedProperties), false);
            }
            exports.getSelectedPropertiesOnLayer = getSelectedPropertiesOnLayer;

            function getSelectedPropertyOnLayer(layer) {
                return getSelectedPropertiesOnLayer(layer, 1)[0];
            }
            exports.getSelectedPropertyOnLayer = getSelectedPropertyOnLayer;

            function getSelectedPropertiesOnComposition(composition, minimum) {
                if (minimum === void(0)) {
                    minimum = 1;
                }
                if (composition.selectedProperties.length < minimum) {
                    throw WrappedError(new Error("选择的属性不够(最小值:".concat(minimum, ")有关合成:").concat(composition.name)), errors_1.NOT_ENOUGH_SELECTED_PROPERTIES_ON_COMPOSITION)
                }
                return __spreadArray([], __read(composition.selectedProperties), false);
            }
            exports.getSelectedPropertiesOnComposition = getSelectedPropertiesOnComposition;

            function getSelectedPropertyOnComposition(composition) {
                return getSelectedPropertiesOnComposition(composition, 1)[0];
            }
            exports.getSelectedPropertyOnComposition = getSelectedPropertyOnComposition;

            function propertyToPropertyPath(property, includeLayer) {
                if (includeLayer === void(0)) {
                    includeLayer = false;
                }
                var propertyPath = [];
                var search = property;
                while (search) {
                    var parentProperty = search.parentProperty;
                    if (parentProperty || includeLayer) {
                        propertyPath.unshift((parentProperty && parentProperty.propertyType === PropertyType.INDEXED_GROUP ? search.name : search.matchName));
                    }
                    search = search.parentProperty;
                }
                return propertyPath;
            }
            exports.propertyToPropertyPath = propertyToPropertyPath;

            function getPropertyAtPath(layer, propertyPath) {
                var property = layer;
                var search = __spreadArray([], __read(propertyPath), false);
                while (search.length) {
                    var propertyName = search.shift();
                    try {
                        property = property.property(propertyName);
                    } catch (err) {
                        return undefined;
                    }
                }
                return property;
            }
            exports.getPropertyAtPath = getPropertyAtPath;

            function setPropertyAtPath(layerOrPoperty, path, key, value) {
                var property = layerOrPoperty;
                path = path.slice();
                while (name = path.shift()) {
                    if (property) {
                        property = property.property(name);
                    } else {
                        break;
                    }
                }
                if (property) {
                    property[key] = value
                }
            }
            exports.setPropertyAtPath = setPropertyAtPath;

            function findInCollection(items, finder) {
                for (var i = 1; i <= items.length; i += 1) {
                    var item = items[i];
                    if (finder(item)) {
                        return item;
                    }
                }
                return undefined;
            }
            exports.findInCollection = findInCollection;

            function collectionToArray(collection) {
                var items = [];
                for (var i = 1; i <= collection.length; i += 1) {
                    items.push(collection[i]);
                }
                return items;
            }
            exports.collectionToArray = collectionToArray;

            function propertyGroupToArray(propertyGroup) {
                var items = [];
                for (var i = 1; i <= propertyGroup.numProperties; i += 1) {
                    items.push(propertyGroup.property(i));
                }
                return items;
            }
            exports.propertyGroupToArray = propertyGroupToArray;

            function lerp(minimum, maximum, weighting) {
                return ((1 - weighting) * minimum) + (maximum * weighting);
            }
            exports.lerp = lerp;

            function invLerp(minimum, maximum, value) {
                return (value - minimum) / (maximum - minimum);
            }
            exports.invLerp = invLerp;

            function remap(inMin, inMax, outMin, outMax, weighting) {
                var value = invLerp(inMin, inMax, weighting);
                return lerp(outMin, outMax, value);
            }
            exports.remap = remap;

            function clamp(minimum, maximum, value) {
                return Math.min(Math.max(value, Math.min(minimum, maximum)), Math.max(minimum, maximum));
            }
            exports.clamp = clamp;

            function genfun() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i += 1) {
                    args[_i] = arguments[_i];
                }
                var lines = [];

                function line(src) {
                    lines.push(src);
                    return line;
                }
                line.toString = function() {
                    return lines.join("\n");
                };
                line.toFunction = function(scope) {
                    var src = ["return (".concat(line.toString(), ")")];
                    var keys = Object.keys(scope || {});
                    var vals = keys.map(function(key) {
                        return scope[key];
                    });
                    return Function.apply(void(0), __spreadArray([], __read(keys.concat(src)), false)).apply(void(0), __spreadArray([], __read(vals), false));
                };
                if (args.length) {
                    line(args[0])
                }
                return line;
            }
            exports.genfun = genfun;

            function undoable(name, cb) {
                app.beginUndoGroup(name);
                cb();
                app.endUndoGroup();
            }
            exports.undoable = undoable;

            function ensureEffect(layer, effectName, effectGroupPseudo) {
                var effectsProperty = layer.property("ADBE Effect Parade");
                var effectGroup = effectsProperty.property(effectName);
                if (!effectGroup) {
                    effectGroup = effectsProperty.addProperty(effectGroupPseudo);
                    effectGroup.name = effectName;
                }
                return effectGroup;
            }
            exports.ensureEffect = ensureEffect;

            function getUniqueName(currentNames, prefix) {
                var postfix = 0;
                while (!result) {
                    var test_1 = prefix + (postfix === 0 ? "" : " " + postfix);
                    if (currentNames.indexOf(test_1) === -1) {
                        result = test_1;
                    } else {
                        postfix++;
                    }
                }
                return result;
            }
            exports.getUniqueName = getUniqueName;

            function getUniqueNameFromLayers(layers, prefix) {
                return getUniqueName(collectionToArray(layers).map(function(layer) {
                    return layer.name;
                }), prefix);
            }
            exports.getUniqueNameFromLayers = getUniqueNameFromLayers;

            function getLowestIndex(layers) {
                var indexes = layers.map(function(layer) {
                    return layer.index;
                });
                return Math.min.apply(Math.min, indexes);
            }
            exports.getLowestIndex = getLowestIndex;

            function getHighestIndex(layers) {
                var indexes = layers.map(function(layer) {
                    return layer.index;
                });
                return Math.max.apply(Math.max, indexes);
            }
            exports.getHighestIndex = getHighestIndex;

            function moveLayerBeforeSelectedLayers(layer, selectedLayers, composition) {
                var lowestIndex = getLowestIndex(selectedLayers);
                var firstLayer = composition.layer(lowestIndex - 1);
                var nextLayer = composition.layer(lowestIndex);
                var isTrackMatte = firstLayer && firstLayer.enabled === false && nextLayer instanceof ShapeLayer && nextLayer.trackMatteType !== TrackMatteType.NO_TRACK_MATTE;
                if (isTrackMatte) {
                    if ((lowestIndex - 2) > 0 && composition.layer(lowestIndex - 2) === layer) {
                        return;
                    }
                    layer.moveBefore(firstLayer);
                } else {
                    if (firstLayer === layer) {
                        return;
                    }
                    layer.moveBefore(nextLayer);
                }
            }
            exports.moveLayerBeforeSelectedLayers = moveLayerBeforeSelectedLayers;

            function layerToBounds(layer, time, includeMask, extents) {
                if (!isAVLayer(layer)) {
                    throw WrappedError(new Error("Unable to get bounds on a non-AVLayer"))
                }
                var layerBounds = layer.sourceRectAtTime(time, extents);
                if (includeMask && layer.mask.numProperties > 0) {
                    var bounds = {
                        top: Infinity,
                        left: Infinity,
                        width: -Infinity,
                        height: -Infinity
                    };
                    for (var f = 1; f <= layer.mask.numProperties; f += 1) {
                        var mask = layer.mask(f);
                        var vertices = mask.maskShape.valueAtTime(time, false).vertices;
                        if (mask.maskMode == MaskMode.NONE) {
                            continue;
                        }
                        vertices.push([layerBounds.left, layerBounds.top]);
                        vertices.push([layerBounds.left + layerBounds.width, layerBounds.top + layerBounds.height]);
                        var bottom = -Infinity;
                        var right = -Infinity;
                        for (var j = 0; j < vertices.length; j += 1) {
                            var _a = __read(vertices[j], 2);
                            var x = _a[0];
                            var y = _a[1];
                            if (x < bounds.left) {
                                bounds.left = x;
                            }
                            if (x > right) {
                                right = x;
                            }
                            if (y < bounds.top) {
                                bounds.top = y;
                            }
                            if (y > bottom) {
                                bottom = y;
                            }
                        }
                        bounds.width = right - bounds.left;
                        bounds.height = bottom - bounds.top;
                    }
                    return bounds;
                }
                return layerBounds;
            }
            exports.layerToBounds = layerToBounds;

            function isAVLayer(layer) {
                return layer instanceof ShapeLayer || layer instanceof TextLayer || layer instanceof AVLayer;
            }
            exports.isAVLayer = isAVLayer;

            function testIsAVLayer(tap) {
                undoable("Utils - Test Setup", function() {
                    var composition = app.project.items.addComp("Utils Test isAVLayer", 500, 500, 1, 10, 30);
                    composition.openInViewer();
                    var shape1 = composition.layers.addShape();
                    var nullLayer1 = composition.layers.addNull();
                    var camera1 = composition.layers.addCamera("Camera", [50, 50]);
                    var light1 = composition.layers.addLight("Light", [50, 50]);
                    var solid1 = composition.layers.addSolid([0, 1, 0], "Solid 1", 200, 200, 1, 10);
                    var textLayer1 = composition.layers.addText(new TextDocument("Test"));
                    tap.test("utils - isAVLayer", function(t) {
                        t.equals(isAVLayer(shape1), true, "Shapes should be AVLayers");
                        t.equals(isAVLayer(nullLayer1), true, "Nulls should be AVLayers");
                        t.equals(isAVLayer(solid1), true, "Solids are not AVLayers");
                        t.equals(isAVLayer(textLayer1), true, "TextLayers are AVLayers");
                        t.equals(isAVLayer(camera1), false, "Cameras are not AVLayers");
                        t.equals(isAVLayer(light1), false, "Lights are not AVLayers");
                    });
                });
            }

            function isPropertyGroup(property) {
                return property.propertyType === PropertyType.INDEXED_GROUP || property.propertyType === PropertyType.NAMED_GROUP;
            }
            exports.isPropertyGroup = isPropertyGroup;

            function isProperty(property) {
                return property.propertyType === PropertyType.PROPERTY;
            }
            exports.isProperty = isProperty;

            function isOneDProperty(property) {
                return property.propertyValueType === PropertyValueType.OneD;
            }
            exports.isOneDProperty = isOneDProperty;

            function isTwoDProperty(property) {
                return property.propertyValueType === PropertyValueType.TwoD || property.propertyValueType === PropertyValueType.TwoD_SPATIAL;
            }
            exports.isTwoDProperty = isTwoDProperty;

            function isThreeDProperty(property) {
                return property.propertyValueType === PropertyValueType.ThreeD || property.propertyValueType === PropertyValueType.ThreeD_SPATIAL;
            }
            exports.isThreeDProperty = isThreeDProperty;

            function isColorProperty(property) {
                return property.propertyValueType === PropertyValueType.COLOR;
            }
            exports.isColorProperty = isColorProperty;

            function isNoValueProperty(property) {
                return property.propertyValueType === PropertyValueType.NO_VALUE;
            }
            exports.isNoValueProperty = isNoValueProperty;

            function isShapeProperty(property) {
                return property.propertyValueType === PropertyValueType.SHAPE;
            }
            exports.isShapeProperty = isShapeProperty;

            function isOneTwoThreeDProperty(property) {
                return isOneDProperty(property) || isTwoDProperty(property) || isThreeDProperty(property);
            }
            exports.isOneTwoThreeDProperty = isOneTwoThreeDProperty;

            function debugBounds(composition, bounds) {
                var layer = composition.layers.addSolid([1, 0, 0], "Solid", Math.round(bounds.width), Math.round(bounds.height), 1, 9999);
                layer.anchorPoint.setValue([0, 0]);
                layer.position.setValue([bounds.left, bounds.top]);
                return layer;
            }
            exports.debugBounds = debugBounds;

            function debugPoint(composition, point, name, size) {
                if (name === void(0)) {
                    name = "";
                }
                if (size === void(0)) {
                    size = 30;
                }
                var layer = composition.layers.addNull();
                layer.source.width = size;
                layer.source.height = size;
                layer.label = 9;
                if (name) {
                    layer.name = name;
                }
                var halfSize = size / 2;
                if (point.length === 2) {
                    layer.anchorPoint.setValue([halfSize, halfSize]);
                    layer.position.setValue([point[0], point[1]]);
                } else {
                    layer.threeDLayer = true;
                    layer.anchorPoint.setValue([halfSize, halfSize, halfSize]);
                    layer.position.setValue([point[0], point[1], point[2]]);
                }
                return layer;
            }
            exports.debugPoint = debugPoint;

            function debugGrid(composition, layer, absTopLeft, xVector, yVector, min, max, increments) {
                if (min === void(0)) {
                    min = 0;
                }
                if (max === void(0)) {
                    max = 1;
                }
                if (increments === void(0)) {
                    increments = 0.5;
                }
                for (var i = min; i <= max; i += increments) {
                    for (var j = min; j <= max; j += increments) {
                        if (layer.threeDLayer) {
                            var nullLayer = debugPoint(composition, [absTopLeft[0] + (xVector[0] * i) + (yVector[0] * j), absTopLeft[1] + (xVector[1] * i) + (yVector[1] * j), absTopLeft[2] + (xVector[2] * i) + (yVector[2] * j)], "".concat(i, " - ").concat(j));
                            if (layer.orientation && nullLayer.threeDLayer) {
                                nullLayer.orientation.setValue(layer.orientation.value);
                            }
                        } else {
                            debugPoint(composition, [absTopLeft[0] + (xVector[0] * i) + (yVector[0] * j), absTopLeft[1] + (xVector[1] * i) + (yVector[1] * j)]);
                        }
                    }
                }
            }
            exports.debugGrid = debugGrid;

            function debugExpressionVariable(composition, layerName, expression, variableName) {
                var debugLayer = composition.layers.addText("");
                var textProperty = debugLayer.property("ADBE Text Properties").property("ADBE Text Document");
                var expressionParts = expression.replace(/thisLayer/g, "thisComp.layer(".concat(JSON.stringify(layerName), ")")).split(variableName + " = ");
                textProperty.expression = expressionParts[0] + variableName + " = " + expressionParts[1].split("\n")[0] + "\n" + variableName;
                textProperty.setValue(textProperty.value);
                debugLayer.name = "".concat(variableName, " - ").concat(layerName);
            }
            exports.debugExpressionVariable = debugExpressionVariable;

            function harvestPoint(inputVal, layer, spaceTransform) {
                var effects = layer.property("ADBE Effect Parade");
                if (inputVal.length == 2) {
                    effect = effects.addProperty("ADBE Point Control");
                    pointProperty = effect.property("ADBE Point Control-0001");
                } else if (inputVal.length == 3) {
                    effect = effects.addProperty("ADBE Point3D Control");
                    pointProperty = effect.property("ADBE Point3D Control-0001");
                } else {
                    throw new Error("Invalid input value")
                }
                effect.name = inputVal.toString();
                pointProperty.expression = "thisComp.layer(".concat(JSON.stringify(layer.name), ").").concat(spaceTransform, "(").concat(JSON.stringify(inputVal), ");");
                var outputVal = pointProperty.value;
                effect.remove();
                return outputVal;
            }
            exports.harvestPoint = harvestPoint;

            function safelySetValue(property, valueGetter, time, preExpression) {
                if (preExpression === void(0)) {
                    preExpression = true;
                }
                var valueGetterFunction = (typeof valueGetter === "function" ? valueGetter : function() {
                    return valueGetter;
                });
                if (property.isTimeVarying) {
                    if (time === undefined) {
                        for (var i = 1; i <= property.numKeys; i += 1) {
                            var value = valueGetterFunction(property.keyValue(i), property.keyTime(i));
                            property.setValueAtKey(i, value);
                        }
                    } else {
                        var value = valueGetterFunction(property.valueAtTime(time, preExpression), time);
                        property.setValueAtTime(time, value);
                    }
                } else {
                    property.setValue(valueGetterFunction(property.value));
                }
            }
            exports.safelySetValue = safelySetValue;

            function safelySetPoint(property, valueGetter, time, preExpression) {
                if (preExpression === void(0)) {
                    preExpression = true;
                }
                var valueGetterFunction = (typeof valueGetter === "function" ? valueGetter : function() {
                    return valueGetter;
                });
                if (property.dimensionsSeparated) {
                    safelySetPoint(property.getSeparationFollower(0), function(value) {
                        return valueGetterFunction([value, 0])[0];
                    });
                    safelySetPoint(property.getSeparationFollower(1), function(value) {
                        return valueGetterFunction([0, value])[1];
                    });
                    if (isThreeDProperty(property)) {
                        try {
                            safelySetPoint(property.getSeparationFollower(2), function(value) {
                                return valueGetterFunction([0, 0, value])[2];
                            });
                        } catch (err) {

                        }
                    }
                } else {
                    if (isOneDProperty(property)) {
                        safelySetValue(property, valueGetterFunction, time, preExpression);
                    } else if (isTwoDProperty(property)) {
                        safelySetValue(property, function(value, time) {
                            var calculatedValue = valueGetterFunction(value, time);
                            return [calculatedValue[0], calculatedValue[1]];
                        }, time, preExpression);
                    } else {
                        if (isThreeDProperty(property)) {
                            safelySetValue(property, function(value, time) {
                                var calculatedValue = valueGetterFunction(value, time);
                                return [calculatedValue[0], calculatedValue[1], calculatedValue[2] || value[2]];
                            }, time, preExpression);
                        }
                    }
                }
            }
            exports.safelySetPoint = safelySetPoint;

            function safelyAddPoint(property, offset, time, preExpression) {
                if (preExpression === void(0)) {
                    preExpression = true;
                }
                if (isOneDProperty(property)) {
                    safelySetPoint(property, function(value) {
                        return value + offset;
                    }, time, preExpression);
                } else if (isTwoDProperty(property)) {
                    safelySetPoint(property, function(value) {
                        var offset2d = offset;
                        return [value[0] + offset2d[0], value[1] + offset2d[1]];
                    }, time, preExpression);
                } else {
                    if (isThreeDProperty(property)) {
                        safelySetPoint(property, function(value) {
                            var offset3d = offset;
                            return [value[0] + offset3d[0], value[1] + offset3d[1], value[2] + offset3d[2]];
                        }, time, preExpression);
                    }
                }
            }
            exports.safelyAddPoint = safelyAddPoint;

            function layerForProperty(property) {
                while (property.parentProperty) {
                    property = property.parentProperty;
                }
                return property;
            }
            exports.layerForProperty = layerForProperty;

            function loadEffects() {
                var CEP_ID = "com.mtmograph.motion-next";
                if (!CEP_ID) {
                    var errorMessage = "Error during compilation, CEP_ID missing!";
                    alert(errorMessage);
                    throw new Error(errorMessage)
                }
                try {
                    var _a = $.global[CEP_ID + ".meta"];
                    var extensionPath_1 = _a.extensionPath;
                    var version = _a.version;
                    var effectsLoaded = ($.global[CEP_ID])._effectsLoaded;
                    if (effectsLoaded === version) {
                        return;
                    }
                    app.beginUndoGroup("Load Motion FFX files");
                    var tempComp = app.project.items.addComp("MOTION_TEMP_COMP", 10, 10, 1, 1, 12);
                    var tempSolid_1 = tempComp.layers.addSolid([0, 0, 0], "MOTION_TEMP_LAYER", 1, 1, tempComp.pixelAspect);
                    var effects = FFX_FILES;
                    effects.forEach(function(effect) {
                        var ffxFile = new File("".concat(extensionPath_1, "/effects/").concat(effect));
                        if (ffxFile.exists) {
                            tempSolid_1.applyPreset(ffxFile);
                        } else {
                            throw new Error("Cannot find ffx file: ".concat(extensionPath_1, "/effects/").concat(effect))
                        }
                    });
                    tempSolid_1.remove();
                    collectionToArray(app.project.items).forEach(function(item) {
                        if (item.name === "MOTION_TEMP_COMP" || item.name === "MOTION_TEMP_LAYER") {
                            item.remove();
                        }
                    });
                    if (app.activeViewer) {
                        app.activeViewer.maximized = !app.activeViewer.maximized;
                        app.activeViewer.maximized = !app.activeViewer.maximized;
                    }
                    ($.global[CEP_ID])._effectsLoaded = version;
                    app.endUndoGroup();
                } catch (err) {
                    console_1["default"].error("Error while loading effects");
                }
            }
            exports.loadEffects = loadEffects;

            function test(tap) {
                if (tap === void(0)) {
                    tap = new tap_1["default"]("/tmp/utils-test");
                }
                testIsAVLayer(tap);
            }
            exports.test = test;
            var toPropertyPath = function(includeLayerName) {
                if (includeLayerName === void(0)) {
                    includeLayerName = false;
                }
                return function(property) {
                    var propertyPath = [];
                    while (property) {
                        if (property.parentProperty) {
                            if (property.parentProperty.propertyType === PropertyType.INDEXED_GROUP) {
                                propertyPath.push(property.name);
                            } else {
                                propertyPath.push(property.matchName);
                            }
                        } else {
                            if (includeLayerName === true) {
                                propertyPath.push(property.name);
                            }
                        }
                        property = property.parentProperty;
                    }
                    return propertyPath.reverse();
                };
            };
            exports.toPropertyPath = toPropertyPath;
            var toPrettyPropertyPath = function(includeLayerName) {
                if (includeLayerName === void(0)) {
                    includeLayerName = false;
                }
                return function(property) {
                    var propertyPath = [];
                    while (property) {
                        if (property.parentProperty) {
                            propertyPath.push(property.name);
                        } else {
                            if (includeLayerName === true) {
                                propertyPath.push(property.name);
                            }
                        }
                        property = property.parentProperty;
                    }
                    return propertyPath.reverse();
                };
            };
            exports.toPrettyPropertyPath = toPrettyPropertyPath;
            var toPropertyGetter = function(fromComposition) {
                if (fromComposition === void(0)) {
                    fromComposition = false;
                }
                return function(propertyPath) {
                    return function(layerOrComposition) {
                        var copy = propertyPath.slice(0);
                        var property = (fromComposition ? layerOrComposition.layer(copy.shift()) : layerOrComposition);
                        while (key = copy.shift()) {
                            if (property) {
                                property = property.property(key);
                            } else {
                                break;
                            }
                        }
                        return property;
                    };
                };
            };
            exports.toPropertyGetter = toPropertyGetter;

            function layerToGetter(layer) {
                var layerName = layer.name;
                return function(composition) {
                    return composition.layer(layerName);
                };
            }
            exports.layerToGetter = layerToGetter;

            function propertyToGetter(property) {
                var path = exports.toPropertyPath(false)(property);
                return exports.toPropertyGetter(false)(path);
            }
            exports.propertyToGetter = propertyToGetter;

            function propertyToGetterFromComp(property) {
                var path = exports.toPropertyPath(true)(property);
                return exports.toPropertyGetter(true)(path);
            }
            exports.propertyToGetterFromComp = propertyToGetterFromComp;

            function filterByName(collection, name) {
                return findInCollection(collection, function(item) {
                    return item.name === name;
                });
            }
            exports.filterByName = filterByName;

            function fast(cb, skip) {
                if (skip === void(0)) {
                    skip = false;
                }
                if (skip || !$.global.fastMode) {
                    cb(app.project.activeItem);
                    return;
                }
                var originalComposition = app.project.activeItem;
                var originalCompositionName = originalComposition.name;
                var compName = getUniqueNameFromLayers(app.project.items, "LOADING...");
                var originalMaximized = app.activeViewer && app.activeViewer.maximized;
                var temporaryComposition = app.project.items.addComp(compName, 500, 500, 1, 1, 1);
                temporaryComposition.openInViewer();
                if (app.activeViewer) {
                    app.activeViewer.maximized = true
                }
                temporaryComposition.layers.addSolid([0, 0, 0], "Loading BG", 500, 500, 1, 1);
                var loadingLabel = temporaryComposition.layers.addText("...");
                loadingLabel.name = "Loading label";
                var textProperty = loadingLabel.property("Source Text");
                var textDocument = textProperty.value;
                textDocument.resetCharStyle();
                textDocument.fontSize = 80;
                textDocument.fillColor = [1, 1, 1];
                textDocument.strokeColor = [0, 0, 0];
                textDocument.strokeWidth = 0;
                textDocument.font = "Helvetica";
                textDocument.strokeOverFill = false;
                textDocument.applyStroke = false;
                textDocument.applyFill = true;
                textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
                textDocument.tracking = 50;
                textProperty.setValue(textDocument);
                loadingLabel.selected = false;
                if (isTwoDProperty(loadingLabel.transform.position)) {
                    loadingLabel.transform.position.setValue([250, 250]);
                }
                try {
                    cb(originalComposition);
                } finally {
                    var loadingComp = filterByName(app.project.items, compName);
                    if (loadingComp) {
                        loadingComp.remove();
                    }
                    var tempSolid = filterByName(app.project.items, "Loading BG");
                    if (tempSolid) {
                        tempSolid.remove();
                    }
                    var newOriginalComposition = filterByName(app.project.items, originalCompositionName);
                    if (newOriginalComposition) {
                        newOriginalComposition.openInViewer();
                        if (originalMaximized === true) {
                            if (app.activeViewer) {
                                app.activeViewer.maximized = originalMaximized;
                            }
                        } else {
                            if (originalMaximized === false) {
                                if (app.activeViewer && app.activeViewer.maximized) {
                                    app.activeViewer.maximized = originalMaximized;
                                }
                            }
                        }
                    }
                    $.global.fastModeRun = true;
                }
            }
            exports.fast = fast;

            function layersToGetter(layers) {
                var layerGetters = layers.map(layerToGetter);
                return function(composition) {
                    return layerGetters.map(function(fn) {
                        return fn(composition);
                    });
                };
            }
            exports.layersToGetter = layersToGetter;

            function propertiesToGetter(properties) {
                var propertyGetters = properties.map(propertyToGetter);
                return function(layer) {
                    return propertyGetters.map(function(fn) {
                        return fn(layer);
                    });
                };
            }
            exports.propertiesToGetter = propertiesToGetter;

            function propertiesToGetterFromComp(properties) {
                var propertyGetters = properties.map(propertyToGetterFromComp);
                return function(composition) {
                    return propertyGetters.map(function(fn) {
                        return fn(composition);
                    });
                };
            }
            exports.propertiesToGetterFromComp = propertiesToGetterFromComp;
            var compose = function(fn1) {
                var fns = [];
                for (var _i = 1; _i < arguments.length; _i += 1) {
                    fns[_i - 1] = arguments[_i];
                }
                return fns.reduce(function(prevFn, nextFn) {
                    return function(value) {
                        return prevFn(nextFn(value));
                    };
                }, fn1);
            };
            exports.compose = compose;
            var prop = function(key) {
                return function(obj) {
                    return obj[key];
                };
            };
            exports.prop = prop;

            function getLayerForProperty(property) {
                while (property.parentProperty) {
                    property = property.parentProperty;
                }
                return property;
            }
            exports.getLayerForProperty = getLayerForProperty;

            function layersToLooper(layers) {
                var layersGetter = layersToGetter(layers);
                var propertiesGetterForLayer = layers.map(function(layer) {
                    return propertiesToGetter(layer.selectedProperties);
                });
                return function(composition, cb) {
                    var freshLayers = layersGetter(composition);
                    return freshLayers.map(function(layer, i) {
                        if (propertiesGetterForLayer[i]) {
                            var properties = propertiesGetterForLayer[i](layer);
                            cb(layer, properties);
                        }
                    });
                };
            }
            exports.layersToLooper = layersToLooper;

            function restoreSelectionAfter(cb) {
                var composition = app.project.activeItem;
                if (!(composition instanceof CompItem)) {
                    throw new Error("Not a comp")
                }
                var selectedLayers = composition.selectedLayers;
                var forSelectedLayersAndProperties = layersToLooper(selectedLayers);
                var originalCompositionName = composition.name;
                cb && cb();
                if (app.project.activeItem instanceof CompItem) {
                    app.project.activeItem.selectedLayers.forEach(function(layer) {
                        return layer.selected = false;
                    });
                    app.project.activeItem.selectedProperties.forEach(function(property) {
                        return property.selected = false;
                    });
                }
                var originalComposition = findInCollection(app.project.items, function(item) {
                    return item.name === originalCompositionName;
                });
                if (originalComposition) {
                    forSelectedLayersAndProperties(originalComposition, function(layer, properties) {
                        if (!layer) {
                            return;
                        }
                        layer.selected = true;
                        properties.forEach(function(property) {
                            property.selected = true;
                        });
                    });
                }
            }
            exports.restoreSelectionAfter = restoreSelectionAfter;

            function tag(layer, tag, value, overwrite) {
                if (value === void(0)) {
                    value = "true";
                }
                if (overwrite === void(0)) {
                    overwrite = false;
                }
                var marker = layer.property("Marker");
                if (!overwrite) {
                    var currentMarker = marker.valueAtTime(tag, true);
                    if (currentMarker.comment !== "") {
                        return currentMarker.comment;
                    }
                }
                var markerValue = new MarkerValue(value);
                marker.setValueAtTime(tag, markerValue);
                return value + "";
            }
            exports.tag = tag;

            function deselectAll(composition) {
                composition.selectedLayers.forEach(function(layer) {
                    layer.selected = false;
                });
                composition.selectedProperties.forEach(function(property) {
                    property.selected = false;
                });
            }
            exports.deselectAll = deselectAll;

            function ensureProperty(layer, propertyPath, prefix) {
                var property = layer;
                propertyPath.forEach(function(propertyId, i) {
                    if (!property.property(propertyId) || prefix && i === (propertyPath.length - 1)) {
                        property = property.addProperty(propertyId);
                        if (prefix) {
                            property.name = getUniqueName(property.parentProperty, prefix);
                        }
                    } else {
                        property = property.property(propertyId);
                    }
                });
                return property;
            }
            exports.ensureProperty = ensureProperty;

            function setMarker(markers, time, value) {
                var markerValue = new MarkerValue(value);
                try {
                    markers.setValueAtTime(time, markerValue);
                } catch (_a) {

                }
            }
            exports.setMarker = setMarker;

            function getMarkerForTime(markers, time) {
                for (var i = 1; i <= markers.numKeys; i += 1) {
                    if (markers.keyTime(i) === time) {
                        return markers.keyValue(i).comment;
                    }
                }
            }
            exports.getMarkerForTime = getMarkerForTime;

            function getMarkerForSubstring(markers, substring) {
                for (var i = 1; i <= markers.numKeys; i += 1) {
                    var marker = markers.keyValue(i);
                    if (marker.comment.substring(0, 2) === substring) {
                        return marker.comment;
                    }
                }
            }
            exports.getMarkerForSubstring = getMarkerForSubstring;

            function getMarkerTimeForSubstring(markers, substring) {
                for (var i = 1; i <= markers.numKeys; i += 1) {
                    var marker = markers.keyValue(i);
                    if (marker.comment.substring(0, 2) === substring) {
                        return markers.keyTime(i);
                    }
                }
            }
            exports.getMarkerTimeForSubstring = getMarkerTimeForSubstring;

            function delMarkerForSubstring(markers, substring) {
                for (var i = 1; i <= markers.numKeys; i += 1) {
                    var marker = markers.keyValue(i);
                    if (marker.comment.substring(0, 2) === substring) {
                        return markers.removeKey(i);
                    }
                }
            }
            exports.delMarkerForSubstring = delMarkerForSubstring;
            var markerTimes = {
                compositionState: -99,
                layerState: -99,
                compositionTags: -98,
                compositionColors: -97,
                layerTags: -399
            };

            function setCompositionState(composition) {
                var state = "S:".concat(JSON.stringify([composition.hideShyLayers]));
                setMarker(composition.markerProperty, markerTimes.compositionState, state);
            }
            exports.setCompositionState = setCompositionState;

            function getCompositionState(composition) {
                var state = getMarkerForSubstring(composition.markerProperty, "S:");
                if (state && state.substring(0, 2) === "S:") {
                    var _a = __read(JSON.parse(state.substring(2)), 1);
                    var hideShyLayers = _a[0];
                    return {
                        hideShyLayers: hideShyLayers
                    };
                }
                throw new Error("No state on composition")
            }
            exports.getCompositionState = getCompositionState;

            function delCompositionState(composition) {
                delMarkerForSubstring(composition.markerProperty, "S:");
            }
            exports.delCompositionState = delCompositionState;

            function setLayerState(layer) {
                var state = "S:".concat(JSON.stringify([layer.locked, layer.shy, layer.enabled, layer.selected]));
                var markers = layer.property("Marker");
                var existingMarkerTime = getMarkerTimeForSubstring(markers, "S:");
                if (existingMarkerTime) {
                    setMarker(markers, existingMarkerTime, state);
                } else {
                    setMarker(markers, markerTimes.layerState, state);
                }
            }
            exports.setLayerState = setLayerState;

            function getLayerState(layer) {
                var marker = getMarkerForSubstring(layer.property("Marker"), "S:");
                if (marker) {
                    var _a = __read(JSON.parse(marker.substring(2)), 4);
                    var locked = _a[0];
                    var shy = _a[1];
                    var enabled = _a[2];
                    var selected = _a[3];
                    return {
                        locked: locked,
                        shy: shy,
                        enabled: enabled,
                        selected: selected
                    };
                }
                throw new Error("No state on layer")
            }
            exports.getLayerState = getLayerState;
            var captureSnapshot = function(tagName, destination) {
                var comp = getComposition();
                var layersToDisable = arrayFilter(collectionToArray(comp.layers), function(l) {
                    return getLayerTags(l).indexOf(tagName) === -1 && l.enabled;
                });
                layersToDisable.forEach(function(l) {
                    l.enabled = false;
                });
                var transparency = false;
                var tempBg = null;
                if (app.activeViewer && app.activeViewer.views[0]) {
                    transparency = app.activeViewer.views[0].options.checkerboards;
                }
                if (!transparency) {
                    tempBg = comp.layers.addSolid(comp.bgColor, "BG Fix", comp.width, comp.height, comp.pixelAspect, comp.duration);
                    tempBg.moveToEnd();
                }
                var fileName = "".concat(destination).concat((Folder.fs === "Windows" ? "\\" : "/")).concat(comp.id, "_").concat(tagName, ".png");
                var file = new File(fileName);
                comp.saveFrameToPng(comp.time, file);
                if (tempBg) {
                    tempBg.remove();
                }
                layersToDisable.forEach(function(l) {
                    l.enabled = true;
                });
            };
            exports.captureSnapshot = captureSnapshot;

            function getCompositionTags(composition) {
                var tags = getMarkerForSubstring(composition.markerProperty, "T:");
                if (tags && tags.substring(0, 2) === "T:") {
                    return (tags.substring(2).length === 0 ? {} : tags.substring(2).split(",").reduce(function(memo, tagInfo) {
                        var _a = __read(tagInfo.split(";"), 2);
                        var tag = _a[0];
                        var count = _a[1];
                        memo[tag] = Number(count);
                        return memo;
                    }, {}));
                }
                return {};
            }
            exports.getCompositionTags = getCompositionTags;

            function getCompositionTagColors(composition) {
                var tagTime = getMarkerTimeForSubstring(composition.markerProperty, "T:") || markerTimes.compositionTags;
                var tags = getMarkerForTime(composition.markerProperty, tagTime + 1);
                if (tags && tags.substring(0, 2) === "T:") {
                    return (tags.substring(2).length === 0 ? {} : tags.substring(2).split(",").reduce(function(memo, tagInfo) {
                        var _a = __read(tagInfo.split(";"), 2);
                        var tag = _a[0];
                        var color = _a[1];
                        if (isNaN(+color)) {
                            color = "" + getLabelColor(color);
                        }
                        memo[tag] = color;
                        return memo;
                    }, {}));
                }
                return {};
            }
            exports.getCompositionTagColors = getCompositionTagColors;

            function setCompositionTags(composition, tagsAndCounts) {
                var currentMarkerTime = getMarkerTimeForSubstring(composition.markerProperty, "T:");
                if (currentMarkerTime) {
                    setMarker(composition.markerProperty, currentMarkerTime, "T:".concat((Object.keys(tagsAndCounts).map(function(tag) {
                        return "".concat(tag, ";").concat(tagsAndCounts[tag]);
                    }).join)(",")));
                } else {
                    setMarker(composition.markerProperty, markerTimes.compositionTags, "T:".concat((Object.keys(tagsAndCounts).map(function(tag) {
                        return "".concat(tag, ";").concat(tagsAndCounts[tag]);
                    }).join)(",")));
                }
            }
            exports.setCompositionTags = setCompositionTags;

            function setCompositionTagColors(composition, tagsAndColors) {
                var tagTime = getMarkerTimeForSubstring(composition.markerProperty, "T:") || markerTimes.compositionTags;
                var currentMarkerTime = tagTime + 1;
                setMarker(composition.markerProperty, currentMarkerTime, "T:".concat((Object.keys(tagsAndColors).map(function(tag) {
                    return "".concat(tag, ";").concat(tagsAndColors[tag]);
                }).join)(",")));
            }
            exports.setCompositionTagColors = setCompositionTagColors;

            function ensureCompositionTagColors(composition, tags) {
                var currentTagsAndColors = getCompositionTagColors(composition);
                var newTagsAndColors = {};
                tags.forEach(function(tag) {
                    if (currentTagsAndColors[tag]) {
                        newTagsAndColors[tag] = currentTagsAndColors[tag];
                    }
                });
                setCompositionTagColors(composition, newTagsAndColors);
            }
            exports.ensureCompositionTagColors = ensureCompositionTagColors;

            function compositionEnsureTags(composition, tags) {
                var markers = composition.markerProperty;
                for (var i = 1; i <= markers.numKeys; i += 1) {
                    var marker = markers.keyValue(i);
                    if (marker.comment.substring(0, 2) === "T:") {
                        if (tags.length === 0) {
                            composition.markerProperty.removeKey(i);
                            return;
                        }
                        if (marker.comment === ("T:" + tags.join(","))) {
                            return;
                        }
                        var markerValue_1 = new MarkerValue("T:" + tags.join(","));
                        try {
                            markers.setValueAtTime(markers.keyTime(i), markerValue_1);
                        } catch (err) {

                        }
                        return;
                    }
                }
                if (tags.length === 0) {
                    return;
                }
                var markerValue = new MarkerValue("T:" + tags.join(","));
                try {
                    markers.setValueAtTime(markerTimes.compositionTags, markerValue);
                } catch (err) {

                }
            }
            exports.compositionEnsureTags = compositionEnsureTags;

            function setLayerTags(layer, tags) {
                var currentMarkerTime = getMarkerTimeForSubstring(layer.property("Marker"), "F:");
                if (currentMarkerTime) {
                    setMarker(layer.property("Marker"), currentMarkerTime, "F:".concat(tags.join(",")));
                } else {
                    setMarker(layer.property("Marker"), markerTimes.layerTags, "F:".concat(tags.join(",")));
                }
            }
            exports.setLayerTags = setLayerTags;

            function getLayerTags(layer) {
                var marker = getMarkerForSubstring(layer.property("Marker"), "F:");
                if (marker) {
                    return arrayFilter(marker.substring(2).split(","), function(t) {
                        return t !== "";
                    });
                }
                return [];
            }
            exports.getLayerTags = getLayerTags;

            function delLayerState(layer) {
                delMarkerForSubstring(layer.property("Marker"), "S:");
            }
            exports.delLayerState = delLayerState;

            function getSelectorFilter(selector) {
                switch (selector.type) {
                    case "focus":
                        return function(layer) {
                            var state = getMarkerForSubstring(layer.property("Marker"), "F:");
                            if (state) {
                                var tags = state.substring(2).split(",");
                                try {
                                    for (var _b = __values(selector.tags), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var tag_1 = _c.value;
                                        if (tags.indexOf(tag_1) > -1) {
                                            return true;
                                        }
                                    }
                                } catch (e_1_1) {
                                    e_1 = {
                                        error: e_1_1
                                    };
                                } finally {
                                    try {
                                        if (_c && !_c.done && _a = _b["return"]) {
                                            _a.call(_b)
                                        }
                                    } finally {
                                        if (e_1) {
                                            throw e_1.error
                                        }
                                    }
                                }
                            }
                            return false;
                        };
                    case "search":
                        return function(layer) {
                            if (selector.caseSensitive === true) {
                                return layer.name.indexOf(selector.query) !== -1;
                            }
                            return layer.name.toLowerCase().indexOf(selector.query.toLowerCase()) !== -1;
                        };
                    case "label":
                        return function(layer) {
                            return layer.label === selector.label;
                        };
                    case "selected":
                        return function(layer) {
                            return layer.selected;
                        };
                    case "shyed":
                        return function(layer) {
                            return layer.shy;
                        };
                    case "enabled":
                        return function(layer) {
                            return layer.enabled;
                        };
                    case "locked":
                        return function(layer) {
                            return layer.locked;
                        };
                }
            }

            function getCompositionById(id) {
                var items = collectionToArray(app.project.items);
                try {
                    for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                        var item = items_1_1.value;
                        if (item instanceof CompItem && item.id === id) {
                            return item;
                        }
                    }
                } catch (e_2_1) {
                    e_2 = {
                        error: e_2_1
                    };
                } finally {
                    try {
                        if (items_1_1 && !items_1_1.done && _a = items_1["return"]) {
                            _a.call(items_1)
                        }
                    } finally {
                        if (e_2) {
                            throw e_2.error
                        }
                    }
                }
            }

            function findProjectItemByName(name) {
                for (var i = 1; i <= app.project.numItems; i += 1) {
                    var item = app.project.item(i);
                    if (item.name === name) {
                        return item;
                    }
                }
                return null;
            }
            exports.findProjectItemByName = findProjectItemByName;

            function getLayersForSelector(selector, invert) {
                if (invert === void(0)) {
                    invert = false;
                }
                var composition = getComposition();
                if (selector.type === "focus" && selector.compositionId) {
                    var compositionWithId = getCompositionById(selector.compositionId);
                    if (compositionWithId) {
                        compositionWithId.openInViewer();
                        composition = compositionWithId;
                    }
                }
                var layers = collectionToArray(composition.layers);
                if (invert) {
                    return {
                        layers: arrayFilter(layers, function(layer) {
                            return !getSelectorFilter(selector)(layer);
                        }),
                        composition: composition
                    };
                } else {
                    return {
                        layers: arrayFilter(layers, function(layer) {
                            return getSelectorFilter(selector)(layer);
                        }),
                        composition: composition
                    };
                }
            }
            exports.getLayersForSelector = getLayersForSelector;

            function findAllPropertiesWithExpressions(layerOrPropertyGroup) {
                var results = [];
                for (var i = 1; i <= layerOrPropertyGroup.numProperties; i += 1) {
                    var propertyGroup = layerOrPropertyGroup.property(i);
                    if (propertyGroup instanceof Property) {
                        if (propertyGroup.expression) {
                            results.push(propertyGroup);
                        }
                    } else {
                        if (propertyGroup instanceof PropertyGroup) {
                            results = results.concat(findAllPropertiesWithExpressions(propertyGroup));
                        }
                    }
                }
                return results;
            }
            exports.findAllPropertiesWithExpressions = findAllPropertiesWithExpressions;

            function getKeyframeProperties(property, keyIndex) {
                var propertyType = property.propertyValueType;
                var keyInInterpolationType = property.keyInInterpolationType(keyIndex);
                var keyOutInterpolationType = property.keyOutInterpolationType(keyIndex);
                var keyInTemporalEase = property.keyInTemporalEase(keyIndex);
                var keyOutTemporalEase = property.keyOutTemporalEase(keyIndex);
                var keyTemporalContinuous = property.keyTemporalContinuous(keyIndex);
                var keyTemporalAutoBezier = property.keyTemporalAutoBezier(keyIndex);
                var info = [keyInInterpolationType, keyOutInterpolationType, keyInTemporalEase, keyOutTemporalEase, keyTemporalContinuous, keyTemporalAutoBezier];
                if (propertyType == PropertyValueType.TwoD_SPATIAL || propertyType == PropertyValueType.ThreeD_SPATIAL) {
                    var keyInSpatialTangent = property.keyInSpatialTangent(keyIndex);
                    var keyOutSpatialTangent = property.keyOutSpatialTangent(keyIndex);
                    var keySpatialContinuous = property.keySpatialContinuous(keyIndex);
                    var keySpatialAutoBezier = property.keySpatialAutoBezier(keyIndex);
                    var keyRoving = property.keyRoving(keyIndex);
                    info = info.concat([keyInSpatialTangent, keyOutSpatialTangent, keySpatialContinuous, keySpatialAutoBezier, keyRoving]);
                }
                return info;
            }
            exports.getKeyframeProperties = getKeyframeProperties;

            function setKeyframeProperties(property, info, pasteKeyIndex) {
                var propertyType = property.propertyValueType;
                var _a = __read(info, 11);
                var keyInInterpolationType = _a[0];
                var keyOutInterpolationType = _a[1];
                var keyInTemporalEase = _a[2];
                var keyOutTemporalEase = _a[3];
                var keyTemporalContinuous = _a[4];
                var keyTemporalAutoBezier = _a[5];
                var keyInSpatialTangent = _a[6];
                var keyOutSpatialTangent = _a[7];
                var keySpatialContinuous = _a[8];
                var keySpatialAutoBezier = _a[9];
                var keyRoving = _a[10];
                if (propertyType == PropertyValueType.TwoD_SPATIAL || propertyType == PropertyValueType.ThreeD_SPATIAL) {
                    property.setSpatialTangentsAtKey(pasteKeyIndex, keyInSpatialTangent, keyOutSpatialTangent);
                    property.setSpatialContinuousAtKey(pasteKeyIndex, keySpatialContinuous);
                    property.setSpatialAutoBezierAtKey(pasteKeyIndex, keySpatialAutoBezier);
                    property.setRovingAtKey(pasteKeyIndex, keyRoving);
                }
                if (property.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER)) {
                    property.setTemporalEaseAtKey(pasteKeyIndex, keyInTemporalEase, keyOutTemporalEase);
                }
                property.setTemporalContinuousAtKey(pasteKeyIndex, keyTemporalContinuous);
                property.setTemporalAutoBezierAtKey(pasteKeyIndex, keyTemporalAutoBezier);
                property.setInterpolationTypeAtKey(pasteKeyIndex, keyInInterpolationType, keyOutInterpolationType);
            }
            exports.setKeyframeProperties = setKeyframeProperties;

            function getEarliestTime(composition) {
                var selectedProperties = composition.selectedProperties;
                for (var i = 0; i < selectedProperties.length; i += 1) {
                    var selectedProperty = selectedProperties[i];
                    if (selectedProperty instanceof Property) {
                        var selectedKeys = selectedProperty.selectedKeys;
                        if (selectedKeys[0] !== undefined) {
                            var currentKeyTime = selectedProperty.keyTime(selectedKeys[0]);
                            if (smallestValue === undefined || currentKeyTime < smallestValue) {
                                smallestValue = currentKeyTime;
                            }
                        }
                    }
                }
                return smallestValue;
            }
            exports.getEarliestTime = getEarliestTime;

            function getLabelColor(colorName) {
                switch (colorName) {
                    case "RED":
                        return 1;
                    case "YELLOW":
                        return 2;
                    case "AQUA":
                        return 3;
                    case "PINK":
                        return 4;
                    case "LAVENDER":
                        return 5;
                    case "PEACH":
                        return 6;
                    case "SEA_FOAM":
                        return 7;
                    case "BLUE":
                        return 8;
                    case "GREEN":
                        return 9;
                    case "PURPLE":
                        return 10;
                    case "ORANGE":
                        return 11;
                    case "BROWN":
                        return 12;
                    case "FUCHSIA":
                        return 13;
                    case "CYAN":
                        return 14;
                    case "SANDSTONE":
                        return 15;
                    case "DARK_GREEN":
                        return 16;
                    default:
                        return 9;
                }
            }
            exports.getLabelColor = getLabelColor;

            function arrayFilter(arr, fn) {
                var filtered = [];
                for (var i = 0; i < arr.length; i += 1) {
                    if (fn(arr[i])) {
                        filtered.push(arr[i]);
                    }
                }
                return filtered;
            }
            exports.arrayFilter = arrayFilter;
        }
    };
    var __webpack_module_cache__ = {};

    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports;
        }
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        (__webpack_modules__[moduleId]).call(module.exports, module, module.exports, __webpack_require__);
        return module.exports;
    }
    var __webpack_exports__ = {};
    !(function() {
        var exports = __webpack_exports__;
        exports.__esModule = true;
        var tap_1 = __webpack_require__("./build/aeft/tap.js");
        var animo = __webpack_require__("./build/aeft/tools/animo.js");
        var align = __webpack_require__("./build/aeft/tools/align.js");
        var blend = __webpack_require__("./build/aeft/tools/blend.js");
        var vectorbreak = __webpack_require__("./build/aeft/tools/vectorbreak.js");
        var burst = __webpack_require__("./build/aeft/tools/burst.js");
        var clone = __webpack_require__("./build/aeft/tools/clone.js");
        var cloth = __webpack_require__("./build/aeft/tools/cloth.js");
        var delay = __webpack_require__("./build/aeft/tools/delay.js");
        var dynamics = __webpack_require__("./build/aeft/tools/dynamics.js");
        var echo = __webpack_require__("./build/aeft/tools/echo.js");
        var excite = __webpack_require__("./build/aeft/tools/excite.js");
        var falloff = __webpack_require__("./build/aeft/tools/falloff.js");
        var flip = __webpack_require__("./build/aeft/tools/flip.js");
        var grab = __webpack_require__("./build/aeft/tools/grab.js");
        var jump = __webpack_require__("./build/aeft/tools/jump.js");
        var nulllayer = __webpack_require__("./build/aeft/tools/nulllayer.js");
        var orbit = __webpack_require__("./build/aeft/tools/orbit.js");
        var parent = __webpack_require__("./build/aeft/tools/parent.js");
        var pinplus = __webpack_require__("./build/aeft/tools/pinplus.js");
        var rename = __webpack_require__("./build/aeft/tools/rename.js");
        var reverse = __webpack_require__("./build/aeft/tools/reverse.js");
        var sort = __webpack_require__("./build/aeft/tools/sort.js");
        var spin = __webpack_require__("./build/aeft/tools/spin.js");
        var stare = __webpack_require__("./build/aeft/tools/stare.js");
        var breakTool = __webpack_require__("./build/aeft/tools/break.js");
        var texture = __webpack_require__("./build/aeft/tools/texture.js");
        var trace = __webpack_require__("./build/aeft/tools/trace.js");
        var trash = __webpack_require__("./build/aeft/tools/trash.js");
        var trim = __webpack_require__("./build/aeft/tools/trim.js");
        var vector = __webpack_require__("./build/aeft/tools/vector.js");
        var vignette = __webpack_require__("./build/aeft/tools/vignette.js");
        var warp = __webpack_require__("./build/aeft/tools/warp.js");
        var toggleselected = __webpack_require__("./build/aeft/tools/toggleselected.js");
        var toggleenabled = __webpack_require__("./build/aeft/tools/toggleenabled.js");
        var togglelock = __webpack_require__("./build/aeft/tools/togglelock.js");
        var toggleshy = __webpack_require__("./build/aeft/tools/toggleshy.js");
        var focus = __webpack_require__("./build/aeft/tools/focus.js");
        var unfocus = __webpack_require__("./build/aeft/tools/unfocus.js");
        var focuscolor = __webpack_require__("./build/aeft/tools/focuscolor.js");
        var focustag = __webpack_require__("./build/aeft/tools/focustag.js");
        var focusrenametag = __webpack_require__("./build/aeft/tools/focusrenametag.js");
        var color = __webpack_require__("./build/aeft/tools/color.js");
        var swapfillstroke = __webpack_require__("./build/aeft/tools/swapfillstroke.js");
        var setstrokewidth = __webpack_require__("./build/aeft/tools/setstrokewidth.js");
        var disablestrokefill = __webpack_require__("./build/aeft/tools/disablestrokefill.js");
        var pastecolor = __webpack_require__("./build/aeft/tools/pastecolor.js");
        var anchor = __webpack_require__("./build/aeft/tools/anchor.js");
        var easein = __webpack_require__("./build/aeft/tools/easein.js");
        var easeout = __webpack_require__("./build/aeft/tools/easeout.js");
        var easepick = __webpack_require__("./build/aeft/tools/easepick.js");
        var easekey = __webpack_require__("./build/aeft/tools/easekey.js");
        var setcompduration = __webpack_require__("./build/aeft/tools/setcompduration.js");
        var setcompsize = __webpack_require__("./build/aeft/tools/setcompsize.js");
        var setcompfps = __webpack_require__("./build/aeft/tools/setcompfps.js");
        var setcompname = __webpack_require__("./build/aeft/tools/setcompname.js");
        var composition = __webpack_require__("./build/aeft/tools/composition.js");
        var timeline = __webpack_require__("./build/aeft/tools/timeline.js");
        var importVideo = __webpack_require__("./build/aeft/tools/importVideo.js");
        var shapes = __webpack_require__("./build/aeft/tools/shapes.js");
        var utils = __webpack_require__("./build/aeft/utils.js");
        var color_1 = __webpack_require__("./build/aeft/tools/color.js");
        var collectionToArray = utils.collectionToArray;
        var testable = ["grab", "texture", "nulllayer", "anchor", "delay", "utils"];
        var tools = {
            anchor: anchor,
            align: align,
            animo: animo,
            blend: blend,
            "break": breakTool,
            burst: burst,
            clone: clone,
            cloth: cloth,
            color: color,
            composition: composition,
            delay: delay,
            disablestrokefill: disablestrokefill,
            dynamics: dynamics,
            echo: echo,
            easein: easein,
            easeout: easeout,
            easepick: easepick,
            easekey: easekey,
            excite: excite,
            falloff: falloff,
            flip: flip,
            focus: focus,
            focuscolor: focuscolor,
            focustag: focustag,
            focusrenametag: focusrenametag,
            grab: grab,
            importVideo: importVideo,
            jump: jump,
            nulllayer: nulllayer,
            orbit: orbit,
            parent: parent,
            pinplus: pinplus,
            pastecolor: pastecolor,
            shapes: shapes,
            rename: rename,
            reverse: reverse,
            setcompsize: setcompsize,
            setcompduration: setcompduration,
            setcompfps: setcompfps,
            setcompname: setcompname,
            setstrokewidth: setstrokewidth,
            sort: sort,
            spin: spin,
            stare: stare,
            swapfillstroke: swapfillstroke,
            texture: texture,
            timeline: timeline,
            toggleenabled: toggleenabled,
            toggleselected: toggleselected,
            togglelock: togglelock,
            toggleshy: toggleshy,
            trace: trace,
            trash: trash,
            trim: trim,
            unfocus: unfocus,
            utils: utils,
            vector: vector,
            vectorbreak: vectorbreak,
            vignette: vignette,
            warp: warp,
            getColors: {
                run: function() {
                    var composition = app.project.activeItem;
                    var allFills = [];
                    if (composition && composition instanceof CompItem) {
                        composition.selectedLayers.forEach(function(layer) {
                            if (layer instanceof ShapeLayer) {
                                var colorFills = color_1.findProperties(layer, "ADBE Vector Fill Color");
                                var colorStrokes = color_1.findProperties(layer, "ADBE Vector Stroke Color");
                                if (colorFills.length > 0) {
                                    colorFills.forEach(function(fill) {
                                        return allFills.push([fill.value[0], fill.value[1], fill.value[2]]);
                                    });
                                }
                                if (colorStrokes.length > 0) {
                                    colorStrokes.forEach(function(stroke) {
                                        return allFills.push([stroke.value[0], stroke.value[1], stroke.value[2]]);
                                    });
                                }
                            } else if (layer instanceof TextLayer && app.project.toolType && app.project.toolType !== ToolType.Tool_TextH && app.project.toolType !== ToolType.Tool_TextV) {
                                try {
                                    var textDocument = layer.property("ADBE Text Properties").property("ADBE Text Document").value;
                                    if (textDocument.fillColor) {
                                        allFills.push(textDocument.fillColor);
                                    }
                                    if (textDocument.strokeColor) {
                                        allFills.push(textDocument.strokeColor);
                                    }
                                } catch (err) {

                                }
                            } else {
                                if (layer instanceof AVLayer && layer.source.mainSource instanceof SolidSource && !layer.nullLayer) {
                                    try {
                                        var fill = layer.source.mainSource.color;
                                        allFills.push(fill);
                                    } catch (err) {

                                    }
                                }
                            }
                            if (layer.property("ADBE Effect Parade").property("ADBE Fill")) {
                                try {
                                    var layerFill = layer.property("ADBE Effect Parade").property("ADBE Fill").property("ADBE Fill-0002").value;
                                    allFills.push(layerFill);
                                } catch (err) {

                                }
                            }
                        });
                    }
                    return JSON.stringify(allFills);
                }
            },
            testAll: {
                run: function() {
                    var tap = new tap_1["default"]("/tmp/motion-test");
                    testable.forEach(function(toolName) {
                        var tool = tools[toolName];
                        if ("test" in tool) {
                            tool.test(tap);
                        }
                    });
                    return tap.end();
                }
            },
            clearProject: {
                run: function() {
                    collectionToArray(app.project.items).reverse().forEach(function(item) {
                        return item.remove();
                    });
                }
            }
        };
        tools.reindex = function() {
            try {
                tools.focus.reindex();
            } catch (err) {
                if (err.code === "input/no-active-composition") {
                    return;
                }
            }
        };
        tools.batchPoll = function(toolIds) {
            var results = {};
            toolIds.forEach(function(toolId) {
                try {
                    results[toolId] = (tools[toolId]).poll();
                } catch (err) {
                    if (err.code === "input/no-active-composition") {
                        return;
                    }
                }
            });
            return JSON.stringify(results);
        };
        var CEP_ID = "com.mtmograph.motion-next";
        if (!CEP_ID) {
            var errorMessage = "Error during compilation, CEP_ID missing!";
            alert(errorMessage);
            throw new Error(errorMessage)
        }
        $.global[CEP_ID] = tools;
    })();
})();