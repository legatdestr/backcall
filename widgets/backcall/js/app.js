// https://gist.github.com/jonathantneal/3748027
// EventListener Polyfill
!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
    WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
        var target = this;

        registry.unshift([target, type, listener, function (event) {
            event.currentTarget = target;
            event.preventDefault = function () {
                event.returnValue = false
            };
            event.stopPropagation = function () {
                event.cancelBubble = true
            };
            event.target = event.srcElement || target;

            listener.call(target, event);
        }]);
        this.attachEvent("on" + type, registry[0][3]);
    };

    WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
        for (var index = 0, register; register = registry[index]; ++index) {
            if (register[0] == this && register[1] == type && register[2] == listener) {
                return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
            }
        }
    };

    WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
        return this.fireEvent("on" + eventObject.type, eventObject);
    };
})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);


// trim polyfill
if (!String.prototype.trim) {
    (function () {
        // Вырезаем BOM и неразрывный пробел
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    })();
}

/**
 * App module
 */
!function (exports) {
    var
        extendClass = function (Child, Parent) {
            var F = new Function();
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            Child.parent = Parent.prototype;
            return Child;
        },
        isFunction = function (f) {
            return (typeof f === 'function');
        },
        isArray = function (arr) {
            var isArray = exports.Array.isArray;
            if (!isArray) {
                isArray = function (arr) {
                    return exports.Object.prototype.toString.call(arr) === '[object Array]';
                };
            }
            return isArray(arr);
        },
        isObject = function (obj) {
            var res = false;
            if (isArray(obj) === false) {
                res = (typeof obj === 'object');
            }
            return res;
        },

        isNumber = function (entity) {
            return (typeof entity === 'undefined') ? false : !isNaN(entity);
        },
        isString = function (entity) {
            return !!entity ? Object.prototype.toString.call(entity) === '[object String]' : false;
        },
        isEmpty = function (e) {
            if (typeof e === 'undefined') {
                return true;
            }
            if (e === 0) { // if e is a number
                return false;
            }
            var res = !e || (e == null) || (typeof e == 'undefined') || (e === '');
            if (res) {
                if (Object.prototype.toString.call(e) === '[object Array]') {
                    res = e.length == 0;
                }
            }
            if (res) {
                var pr;
                for (pr in e) {
                    if (Object.prototype.hasOwnProperty.call(e, pr)) {
                        res = false;
                        break;
                    }
                }
            }
            return res;
        },

        /**
         * Iterates through the entity and invokes the callback with the item as an
         * callback argument: callback(item).
         * If the callback function returns true then iteration process will be
         * interrupted.
         * @param {Object|Array} entity
         * @param {function} callback will be called like this: callback(item)
         * @param {type} context default is item context
         * @returns {Boolean} true if no errors
         */
        each = function (entity, callback, context) {
            var error = false;
            context = context || false;
            if (typeof entity === 'undefined') {
                error = true;
            }
            if (typeof callback !== 'function') {
                error = true;
            }
            if (!error) {
                if (Object.prototype.toString.call(entity) === '[object Array]') {
                    var i = 0,
                        len = entity.length;
                    for (i = 0; i < len; i++) {
                        if (context) {
                            if (callback.call(context, entity[i])) {
                                break;
                            }
                        } else {
                            if (callback.call(entity[i], entity[i])) {
                                break;
                            }
                        }
                    }
                } else {
                    if (Object.prototype.toString.call(entity) === '[object Object]') {
                        var item;
                        for (item in entity) {
                            if (Object.prototype.hasOwnProperty.call(entity, item)) {
                                if (context) {
                                    if (callback.call(context, item)) {
                                        break;
                                    }
                                } else {
                                    if (callback.call(item, item)) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return !error;
        },

        /**
         * Checks if a value exists in an array
         * @param needle
         * @param haystack
         * @param strict
         * @returns {boolean}
         */
        inArray = function (needle, haystack) {
            var length = haystack.length;
            for (var i = 0; i < length; i++) {
                /* jshint eqeqeq: false, curly: false */
                if (haystack[i] == needle) return true;
            }
            return false;
        },
        noop = new Function(),

        isHTMLElement = function () {
            if ("HTMLElement" in window) {
                //  Quick and easy. And reliable.
                return function (el) {
                    return el instanceof HTMLElement;
                };
            } else if ((document.createElement("a")).constructor) {
                // We can access an element's constructor. So, this is not IE7
                var ElementConstructors = {}, nodeName;
                return function (el) {
                    return el && typeof el.nodeName === "string" &&
                        el instanceof ((nodeName = el.nodeName.toLowerCase()) in ElementConstructors ?
                            ElementConstructors[nodeName] :
                            (ElementConstructors[nodeName] = document.createElement(nodeName)).constructor);
                };
            } else {
                // Not that reliable, but we don't seem to have another choice. Probably IE7
                return function (el) {
                    return typeof el === "object" && el.nodeType === 1 && typeof el.nodeName === "string";
                };
            }
        }()
        ;

    // Observer
    var
        Observer = function () {
            "use strict";
            var
                publisher = {
                    subscribers: {
                        any: []
                    },

                    on: function (type, fn, context, once) {
                        type = type || 'any';
                        fn = typeof fn === "function" ? fn : context[fn];

                        if (typeof this.subscribers[type] === "undefined") {
                            this.subscribers[type] = [];
                        }

                        var subscribers = this.subscribers[type], len = subscribers.length, i;
                        // prevent adding the same handlers
                        for (i = 0; i < len; i++) {
                            if (subscribers[i].fn === fn && subscribers[i].context === context) {
                                return false;
                            }
                        }

                        this.subscribers[type].push({fn: fn, context: context || this, once: !!once});
                    },
                    once: function (type, fn, context) {
                        this.on(type, fn, context, true);
                    },
                    remove: function (type, fn, context) {
                        this.fireSubscribers('unsubscribe', type, fn, context);
                    },
                    /**
                     * Fire event on current object
                     * @param {String} type
                     * @param {Object} publication
                     * @param {Boolean} async If true then event will be invoked asynchronously. True by default
                     */
                    fire: function (type, publication, async) {
                        var self = this;
                        async = !!async;
                        if (async) {
                            setTimeout(function (t, p) {
                                return function () {
                                    self.fireSubscribers('publish', t, p);
                                };

                            }(type, publication), 0);
                        } else {
                            this.fireSubscribers('publish', type, publication);
                        }
                    },
                    fireSubscribers: function (action, type, arg, context) {
                        this._eveEnabled = this._eveEnabled || true;
                        this._logEvents = this._logEvents || false;
                        if (!this._eveEnabled) {
                            return;
                        }
                        var pubtype = type || 'any',
                            subscribers = this.subscribers[pubtype],
                            i,
                            max = subscribers ? subscribers.length : 0;

                        for (i = 0; i < max; i += 1) {
                            if (action === 'publish') {
                                if (typeof subscribers[i] !== 'undefined') {
                                    subscribers[i].fn.call(subscribers[i].context, arg);
                                    if (subscribers[i].once) {
                                        this.remove(subscribers[i], subscribers[i].fn, subscribers[i].context);
                                    }
                                    if (this._logEvents) {
                                        console.log('Observer event (action, type, arg, context): ', action, type, arg, context);
                                    }
                                }
                            } else {
                                if (typeof subscribers[i] !== 'undefined') {
                                    if (subscribers[i].fn === arg && subscribers[i].context === context) {
                                        subscribers.splice(i, 1);
                                        if (this._logEvents) {
                                            console.log('Observer event removed (action, type, arg, context): ', action, type, arg, context);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    removeAllEventHandlers: function (type) {
                        var subscribers = this.subscribers[type];
                        if (Object.prototype.toString.call(subscribers) !== '[object Array]') {
                            return;
                        }
                        this.subscribers[type] = [];
                    },
                    clear: function () {
                        this.subscribers = {
                            any: []
                        };
                    },
                    pause: function () {
                        this._eveEnabled = false;
                    },
                    resume: function () {
                        this._eveEnabled = true;
                    },
                    log: function (enabled) {
                        enabled = enabled || false;
                        this._logEvents = enabled;
                    }
                };

            function makePublisher(o) {
                var i;
                for (i in publisher) {
                    if (Object.prototype.hasOwnProperty.call(publisher, i) && typeof publisher[i] === "function") {
                        o[i] = publisher[i];
                    }
                }
                // create the own instance of the subscribers
                o.subscribers = {any: []};
                return o;
            }

            return makePublisher;
        }();


    exports.app = {
        extendClass: extendClass,
        isFunction: isFunction,
        isObject: isObject,
        isArray: isArray,
        isNumber: isNumber,
        isString: isString,
        isEmpty: isEmpty,
        isHTMLElement: isHTMLElement,
        noop: noop,
        each: each,
        Observer: Observer,
        inArray: inArray
    };
}(this);


/**
 * backCall module
 */
!function (window, exports, document, Loader) {
    "use strict";

    if (typeof Loader === 'undefined') {
        return exports.noop;
    }

    var
        noop = exports.noop,

        appHomePath = '', // 'widgets/backcall'

        serverHandlerPath = '', // widgets/backcall/backcall.php

        captchaPath = 'https://www.google.com/recaptcha/api.js', // smth like https://www.google.com/recaptcha/api.js

        captchaSitekey = "",  // smth like "6Lc-9gkTAAAAAE_IbFzVhyu-Pyk8DWUd0RoM2vVP"

        telMask = "9(999)999-99-99",

        afterOpen = noop,

        afterClose = noop,

        telValidateRegExp = '^[8]{1}\\(9[\\d]{2}\\)[\\d]{3}-[\\d]{2}-[\\d]{2}$',

        UiElems = function () {

            var
                wname = 'backcall',

                getErrorEl = function () {
                    return document.querySelector('.' + wname + ' label.error');
                },
                getTelEl = function () {
                    return document.querySelector('.' + wname + ' input[name="tel"]');
                },
                getNameEl = function () {
                    return document.querySelector('.' + wname + ' input[name="name"]');
                },

                getNameVal = function () {
                    var el = getNameEl();
                    return el ? el.value : '';
                },
                getTelVal = function () {
                    var el = getTelEl();
                    return el ? el.value : '';
                },

                getCaptchaEl = function () {
                    return document.querySelector('.' + wname + ' div.g-recaptcha');
                },

                getCaptchaVal = function () {
                    return typeof window.grecaptcha === 'undefined' ? '' : grecaptcha.getResponse();
                }

                ;

            return {
                getNameVal: getNameVal,
                getTelVal: getTelVal,
                getErrorEl: getErrorEl,
                getTelEl: getTelEl,
                getNameEl: getNameEl,
                getCaptchaEl: getCaptchaEl,
                getCaptchaVal: getCaptchaVal
            }

        }(),


        UiHandlers = function () {

            var
                genPopupContent = function () {
                    var content =
                        '<div class="backcall">' +
                        '<h1>Заказ обратного звонка</h1>' +
                        '<form>' +
                        '<label class="error"></label>' +
                        '<label>Имя</label>' +
                        '<input name="name" placeholder="Как к Вам обратиться?">' +
                        '<label>Телефон в формате: "8(9XX)XXX-XX-XX"</label>' +
                        '<input name="tel" type="tel" placeholder="8(9XX)XXX-XX-XX" >' +

                            //'<label>Причина обращения</label>' +
                            //'<div class="select">' +
                            //'<select size="1">' +
                            //'<option>Я проверить вас решил</option>' +
                            //'<option>Пункт 2</option>' +
                            //'</select>' +
                            //'</div>' +

                        '<div class="g-recaptcha" data-sitekey="' + captchaSitekey + '"></div>' +
                        '</form>' +
                        '</div>';
                    return content;
                },

                escapeHtml = function escapeHtml(text) {
                    return text
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                },

                validatePhone = function (val) {
                    var
                        re = new RegExp(telValidateRegExp),
                        valid = re.test(val);
                    return valid;
                },


                validateName = function (val) {
                    val = val || '';
                    return val.length > 1;
                },

                validateCaptcha = function (val) {
                    val = val || '';
                    return val.length > 0;
                },

                validateInput = function () {
                    var
                        name = escapeHtml(UiElems.getNameVal()).trim(),
                        tel = escapeHtml(UiElems.getTelVal()).trim(),
                        captcha = UiElems.getCaptchaVal(),
                        error = []
                        ;

                    if (!validatePhone(tel)) {
                        error.push('Неправильный формат номера телефона');
                    }

                    if (!validateName(name)) {
                        error.push('Проверьте поле "Имя"');
                    }

                    if (!validateCaptcha(captcha)) {
                        error.push('Пройдите проверку "Я не робот"');
                    }

                    if (error.length) {
                        var erEl = UiElems.getErrorEl();
                        erEl.innerHTML = Array.prototype.join.call(error, '<br>');

                    }

                    return error.length === 0;

                },

                installTelInputHandler = function () {
                    var tel = UiElems.getTelEl();
                    if (tel) {
                        VMasker(tel).maskPattern(telMask);
                    }
                },
                uninstallTelInputHandler = function () {
                    var tel = UiElems.getTelEl();
                    if (tel) {
                        VMasker(tel).unMask();
                    }
                },

                onSubmit = function (modal) {
                    // modal.hide();
                    if (validateInput()) {
                        var
                            name = escapeHtml(UiElems.getNameVal()),
                            tel = escapeHtml(UiElems.getTelVal()),
                            captcha = UiElems.getCaptchaVal(),
                            data = {
                                name: name,
                                tel: VMasker.toNumber(tel),
                                captcha: captcha
                            };

                        nanoajax.ajax({
                            url: serverHandlerPath,
                            method: 'POST',
                            body: 'ajax=' + JSON.stringify(data)
                        }, function (code, responseText, request) { // success callback
                            // code is response code
                            // responseText is response body as a string
                            // request is the xmlhttprequest, which has `getResponseHeader(header)` function
                            var resp = JSON.parse(responseText);
                            if (resp.status === 'ok') {
                                UiElems.getErrorEl().innerHTML = 'Заявка принята!';
                                window.setTimeout(function (modal) {
                                    return function () {
                                        modal.hide();
                                    };
                                }(modal), 1 * 1000);
                            } else {
                                UiElems.getErrorEl().innerHTML = 'Ошибка обработки заявки. Попробуйте позже. ' + resp.response;
                                window.setTimeout(function (modal) {
                                    return function () {
                                        modal.hide();
                                    };
                                }(modal), 1 * 1000);
                            }

                        }, function (status, request) { // failcallback
                            UiElems.getErrorEl().innerHTML = 'Не удалось выполнить запрос';
                        });

                    }

                },

                onCancelBtnClick = function (modal) {
                    uninstallTelInputHandler();
                    modal.hide();
                    afterClose();
                },

                renderCaptcha = function () {
                    var div = UiElems.getCaptchaEl();
                    if (div && exports.isObject(window.grecaptcha)) {
                        grecaptcha.reset();
                        grecaptcha.render(div, {
                            "sitekey": captchaSitekey
                        });
                    }
                },

                createPopup = function () {
                    var
                        popupContent = genPopupContent(),
                        justTextModal = nanoModal(popupContent, {
                            overlayClose: false, // Can't close the modal by clicking on the overlay.
                            autoRemove: true,
                            buttons: [{
                                text: "Заказать!",
                                handler: onSubmit,
                                primary: true
                            }, {
                                text: "Отменить",
                                handler: onCancelBtnClick
                            }]
                        });
                    justTextModal.show();
                    installTelInputHandler();
                    renderCaptcha();
                    afterOpen(justTextModal);
                },

                loadDependencies = function (callback) {
                    var dependencies = [
                        appHomePath + '/css/' + 'backcall.css' + '?t=' + new Date().getTime()
                    ];

                    if (!exports.isObject(typeof window.nanoajax)) {
                        dependencies.push(appHomePath + '/js/' + 'nanoajax.min.js');
                    }

                    if (!exports.isFunction(window.VMasker)) {
                        dependencies.push(appHomePath + '/js/' + 'vanilla-masker.min.js');
                    }

                    if (!exports.isFunction(window.nanoModal)) {
                        dependencies.push(appHomePath + '/js/' + 'nanomodal.min.js');
                    }

                    if (!exports.isObject(window.grecaptcha)) {
                        dependencies.push(captchaPath);
                    }


                    Loader.load(dependencies, callback);
                },

                onOpenDialogElClick = function (event) {
                    // loadDialog dependencies
                    loadDependencies(function () {
                        createPopup();
                    });
                };

            return {
                onOpenDialogElClick: onOpenDialogElClick
            }
        }(),

        bindEvents = function (params) {
            var button = params.button;
            button.addEventListener('click', UiHandlers.onOpenDialogElClick);
        },

        /**
         *
         * @param {HTMLElement} openDialogEl
         */
        init = function (params) {
            if (!exports.isObject(params)) {
                return false;
            }
            if (!exports.isHTMLElement(params.button)) {
                console && console.log && console.log('button is not a HTMLElement!');
                return false;
            }

            if (exports.isEmpty(params.appHomePath)) {
                console && console.log && console.log('appHomePath is not specified');
                return false;
            }
            appHomePath = params.appHomePath;

            if (exports.isEmpty(params.serverHandlerPath)) {
                console && console.log && console.log('serverHandlerPath is not specified');
                return false;
            }
            serverHandlerPath = params.serverHandlerPath;

            if (exports.isEmpty(params.captchaPath)) {
                console && console.log && console.log('captchaPath is not specified');
                return false;
            }
            captchaPath = params.captchaPath;

            if (exports.isEmpty(params.captchaSitekey)) {
                console && console.log && console.log('captchaSitekey is not specified');
                return false;
            }
            captchaSitekey = params.captchaSitekey;

            if (!exports.isEmpty(params.telMask)) {
                telMask = params.telMask;
            }

            if (!exports.isEmpty(params.telValidateRegExp)) {
                telValidateRegExp = params.telValidateRegExp;
            }

            if (exports.isFunction(params.afterOpen)) {
                afterOpen = params.afterOpen;
            }

            if (exports.isFunction(params.afterClose)) {
                afterClose = params.afterClose;
            }

            bindEvents(params);
        };

    exports.core = {
        run: init
    };
    return exports;

}(this, this.app || (this.app = {} || this.app), this.document, this.ljs);