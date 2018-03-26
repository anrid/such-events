/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.v1 = (function() {
    
        /**
         * Namespace v1.
         * @exports v1
         * @namespace
         */
        var v1 = {};
    
        v1.Broadcast = (function() {
    
            /**
             * Properties of a Broadcast.
             * @memberof v1
             * @interface IBroadcast
             * @property {string} type Broadcast type
             * @property {string} payload Broadcast payload
             * @property {Array.<string>|null} [targets] Broadcast targets
             */
    
            /**
             * Constructs a new Broadcast.
             * @memberof v1
             * @classdesc Represents a Broadcast.
             * @implements IBroadcast
             * @constructor
             * @param {v1.IBroadcast=} [properties] Properties to set
             */
            function Broadcast(properties) {
                this.targets = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Broadcast type.
             * @member {string} type
             * @memberof v1.Broadcast
             * @instance
             */
            Broadcast.prototype.type = "";
    
            /**
             * Broadcast payload.
             * @member {string} payload
             * @memberof v1.Broadcast
             * @instance
             */
            Broadcast.prototype.payload = "";
    
            /**
             * Broadcast targets.
             * @member {Array.<string>} targets
             * @memberof v1.Broadcast
             * @instance
             */
            Broadcast.prototype.targets = $util.emptyArray;
    
            /**
             * Creates a new Broadcast instance using the specified properties.
             * @function create
             * @memberof v1.Broadcast
             * @static
             * @param {v1.IBroadcast=} [properties] Properties to set
             * @returns {v1.Broadcast} Broadcast instance
             */
            Broadcast.create = function create(properties) {
                return new Broadcast(properties);
            };
    
            /**
             * Verifies a Broadcast message.
             * @function verify
             * @memberof v1.Broadcast
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Broadcast.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (!$util.isString(message.type))
                    return "type: string expected";
                if (!$util.isString(message.payload))
                    return "payload: string expected";
                if (message.targets != null && message.hasOwnProperty("targets")) {
                    if (!Array.isArray(message.targets))
                        return "targets: array expected";
                    for (var i = 0; i < message.targets.length; ++i)
                        if (!$util.isString(message.targets[i]))
                            return "targets: string[] expected";
                }
                return null;
            };
    
            /**
             * Creates a Broadcast message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof v1.Broadcast
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {v1.Broadcast} Broadcast
             */
            Broadcast.fromObject = function fromObject(object) {
                if (object instanceof $root.v1.Broadcast)
                    return object;
                var message = new $root.v1.Broadcast();
                if (object.type != null)
                    message.type = String(object.type);
                if (object.payload != null)
                    message.payload = String(object.payload);
                if (object.targets) {
                    if (!Array.isArray(object.targets))
                        throw TypeError(".v1.Broadcast.targets: array expected");
                    message.targets = [];
                    for (var i = 0; i < object.targets.length; ++i)
                        message.targets[i] = String(object.targets[i]);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a Broadcast message. Also converts values to other types if specified.
             * @function toObject
             * @memberof v1.Broadcast
             * @static
             * @param {v1.Broadcast} message Broadcast
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Broadcast.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.targets = [];
                if (options.defaults) {
                    object.type = "";
                    object.payload = "";
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = message.type;
                if (message.payload != null && message.hasOwnProperty("payload"))
                    object.payload = message.payload;
                if (message.targets && message.targets.length) {
                    object.targets = [];
                    for (var j = 0; j < message.targets.length; ++j)
                        object.targets[j] = message.targets[j];
                }
                return object;
            };
    
            /**
             * Converts this Broadcast to JSON.
             * @function toJSON
             * @memberof v1.Broadcast
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Broadcast.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Broadcast;
        })();
    
        v1.NotificationCreateOk = (function() {
    
            /**
             * Properties of a NotificationCreateOk.
             * @memberof v1
             * @interface INotificationCreateOk
             * @property {v1.INotification} notification NotificationCreateOk notification
             */
    
            /**
             * Constructs a new NotificationCreateOk.
             * @memberof v1
             * @classdesc Represents a NotificationCreateOk.
             * @implements INotificationCreateOk
             * @constructor
             * @param {v1.INotificationCreateOk=} [properties] Properties to set
             */
            function NotificationCreateOk(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * NotificationCreateOk notification.
             * @member {v1.INotification} notification
             * @memberof v1.NotificationCreateOk
             * @instance
             */
            NotificationCreateOk.prototype.notification = null;
    
            /**
             * Creates a new NotificationCreateOk instance using the specified properties.
             * @function create
             * @memberof v1.NotificationCreateOk
             * @static
             * @param {v1.INotificationCreateOk=} [properties] Properties to set
             * @returns {v1.NotificationCreateOk} NotificationCreateOk instance
             */
            NotificationCreateOk.create = function create(properties) {
                return new NotificationCreateOk(properties);
            };
    
            /**
             * Verifies a NotificationCreateOk message.
             * @function verify
             * @memberof v1.NotificationCreateOk
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            NotificationCreateOk.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                {
                    var error = $root.v1.Notification.verify(message.notification);
                    if (error)
                        return "notification." + error;
                }
                return null;
            };
    
            /**
             * Creates a NotificationCreateOk message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof v1.NotificationCreateOk
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {v1.NotificationCreateOk} NotificationCreateOk
             */
            NotificationCreateOk.fromObject = function fromObject(object) {
                if (object instanceof $root.v1.NotificationCreateOk)
                    return object;
                var message = new $root.v1.NotificationCreateOk();
                if (object.notification != null) {
                    if (typeof object.notification !== "object")
                        throw TypeError(".v1.NotificationCreateOk.notification: object expected");
                    message.notification = $root.v1.Notification.fromObject(object.notification);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a NotificationCreateOk message. Also converts values to other types if specified.
             * @function toObject
             * @memberof v1.NotificationCreateOk
             * @static
             * @param {v1.NotificationCreateOk} message NotificationCreateOk
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            NotificationCreateOk.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.notification = null;
                if (message.notification != null && message.hasOwnProperty("notification"))
                    object.notification = $root.v1.Notification.toObject(message.notification, options);
                return object;
            };
    
            /**
             * Converts this NotificationCreateOk to JSON.
             * @function toJSON
             * @memberof v1.NotificationCreateOk
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NotificationCreateOk.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return NotificationCreateOk;
        })();
    
        v1.Notification = (function() {
    
            /**
             * Properties of a Notification.
             * @memberof v1
             * @interface INotification
             * @property {string} id Notification id
             * @property {string} from Notification from
             * @property {string} to Notification to
             * @property {string|null} [message] Notification message
             * @property {string|null} [metadata] Notification metadata
             */
    
            /**
             * Constructs a new Notification.
             * @memberof v1
             * @classdesc Represents a Notification.
             * @implements INotification
             * @constructor
             * @param {v1.INotification=} [properties] Properties to set
             */
            function Notification(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Notification id.
             * @member {string} id
             * @memberof v1.Notification
             * @instance
             */
            Notification.prototype.id = "";
    
            /**
             * Notification from.
             * @member {string} from
             * @memberof v1.Notification
             * @instance
             */
            Notification.prototype.from = "";
    
            /**
             * Notification to.
             * @member {string} to
             * @memberof v1.Notification
             * @instance
             */
            Notification.prototype.to = "";
    
            /**
             * Notification message.
             * @member {string} message
             * @memberof v1.Notification
             * @instance
             */
            Notification.prototype.message = "";
    
            /**
             * Notification metadata.
             * @member {string} metadata
             * @memberof v1.Notification
             * @instance
             */
            Notification.prototype.metadata = "";
    
            /**
             * Creates a new Notification instance using the specified properties.
             * @function create
             * @memberof v1.Notification
             * @static
             * @param {v1.INotification=} [properties] Properties to set
             * @returns {v1.Notification} Notification instance
             */
            Notification.create = function create(properties) {
                return new Notification(properties);
            };
    
            /**
             * Verifies a Notification message.
             * @function verify
             * @memberof v1.Notification
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Notification.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (!$util.isString(message.id))
                    return "id: string expected";
                if (!$util.isString(message.from))
                    return "from: string expected";
                if (!$util.isString(message.to))
                    return "to: string expected";
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                if (message.metadata != null && message.hasOwnProperty("metadata"))
                    if (!$util.isString(message.metadata))
                        return "metadata: string expected";
                return null;
            };
    
            /**
             * Creates a Notification message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof v1.Notification
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {v1.Notification} Notification
             */
            Notification.fromObject = function fromObject(object) {
                if (object instanceof $root.v1.Notification)
                    return object;
                var message = new $root.v1.Notification();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.from != null)
                    message.from = String(object.from);
                if (object.to != null)
                    message.to = String(object.to);
                if (object.message != null)
                    message.message = String(object.message);
                if (object.metadata != null)
                    message.metadata = String(object.metadata);
                return message;
            };
    
            /**
             * Creates a plain object from a Notification message. Also converts values to other types if specified.
             * @function toObject
             * @memberof v1.Notification
             * @static
             * @param {v1.Notification} message Notification
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Notification.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.id = "";
                    object.from = "";
                    object.to = "";
                    object.message = "";
                    object.metadata = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.from != null && message.hasOwnProperty("from"))
                    object.from = message.from;
                if (message.to != null && message.hasOwnProperty("to"))
                    object.to = message.to;
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                if (message.metadata != null && message.hasOwnProperty("metadata"))
                    object.metadata = message.metadata;
                return object;
            };
    
            /**
             * Converts this Notification to JSON.
             * @function toJSON
             * @memberof v1.Notification
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Notification.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Notification;
        })();
    
        v1.UserCreate = (function() {
    
            /**
             * Properties of a UserCreate.
             * @memberof v1
             * @interface IUserCreate
             * @property {string} name UserCreate name
             * @property {string} email UserCreate email
             * @property {string} password UserCreate password
             */
    
            /**
             * Constructs a new UserCreate.
             * @memberof v1
             * @classdesc Represents a UserCreate.
             * @implements IUserCreate
             * @constructor
             * @param {v1.IUserCreate=} [properties] Properties to set
             */
            function UserCreate(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * UserCreate name.
             * @member {string} name
             * @memberof v1.UserCreate
             * @instance
             */
            UserCreate.prototype.name = "";
    
            /**
             * UserCreate email.
             * @member {string} email
             * @memberof v1.UserCreate
             * @instance
             */
            UserCreate.prototype.email = "";
    
            /**
             * UserCreate password.
             * @member {string} password
             * @memberof v1.UserCreate
             * @instance
             */
            UserCreate.prototype.password = "";
    
            /**
             * Creates a new UserCreate instance using the specified properties.
             * @function create
             * @memberof v1.UserCreate
             * @static
             * @param {v1.IUserCreate=} [properties] Properties to set
             * @returns {v1.UserCreate} UserCreate instance
             */
            UserCreate.create = function create(properties) {
                return new UserCreate(properties);
            };
    
            /**
             * Verifies a UserCreate message.
             * @function verify
             * @memberof v1.UserCreate
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UserCreate.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (!$util.isString(message.name))
                    return "name: string expected";
                if (!$util.isString(message.email))
                    return "email: string expected";
                if (!$util.isString(message.password))
                    return "password: string expected";
                return null;
            };
    
            /**
             * Creates a UserCreate message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof v1.UserCreate
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {v1.UserCreate} UserCreate
             */
            UserCreate.fromObject = function fromObject(object) {
                if (object instanceof $root.v1.UserCreate)
                    return object;
                var message = new $root.v1.UserCreate();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.email != null)
                    message.email = String(object.email);
                if (object.password != null)
                    message.password = String(object.password);
                return message;
            };
    
            /**
             * Creates a plain object from a UserCreate message. Also converts values to other types if specified.
             * @function toObject
             * @memberof v1.UserCreate
             * @static
             * @param {v1.UserCreate} message UserCreate
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UserCreate.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.name = "";
                    object.email = "";
                    object.password = "";
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.email != null && message.hasOwnProperty("email"))
                    object.email = message.email;
                if (message.password != null && message.hasOwnProperty("password"))
                    object.password = message.password;
                return object;
            };
    
            /**
             * Converts this UserCreate to JSON.
             * @function toJSON
             * @memberof v1.UserCreate
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UserCreate.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return UserCreate;
        })();
    
        v1.UserCreateOk = (function() {
    
            /**
             * Properties of a UserCreateOk.
             * @memberof v1
             * @interface IUserCreateOk
             * @property {v1.IUser} user UserCreateOk user
             */
    
            /**
             * Constructs a new UserCreateOk.
             * @memberof v1
             * @classdesc Represents a UserCreateOk.
             * @implements IUserCreateOk
             * @constructor
             * @param {v1.IUserCreateOk=} [properties] Properties to set
             */
            function UserCreateOk(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * UserCreateOk user.
             * @member {v1.IUser} user
             * @memberof v1.UserCreateOk
             * @instance
             */
            UserCreateOk.prototype.user = null;
    
            /**
             * Creates a new UserCreateOk instance using the specified properties.
             * @function create
             * @memberof v1.UserCreateOk
             * @static
             * @param {v1.IUserCreateOk=} [properties] Properties to set
             * @returns {v1.UserCreateOk} UserCreateOk instance
             */
            UserCreateOk.create = function create(properties) {
                return new UserCreateOk(properties);
            };
    
            /**
             * Verifies a UserCreateOk message.
             * @function verify
             * @memberof v1.UserCreateOk
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UserCreateOk.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                {
                    var error = $root.v1.User.verify(message.user);
                    if (error)
                        return "user." + error;
                }
                return null;
            };
    
            /**
             * Creates a UserCreateOk message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof v1.UserCreateOk
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {v1.UserCreateOk} UserCreateOk
             */
            UserCreateOk.fromObject = function fromObject(object) {
                if (object instanceof $root.v1.UserCreateOk)
                    return object;
                var message = new $root.v1.UserCreateOk();
                if (object.user != null) {
                    if (typeof object.user !== "object")
                        throw TypeError(".v1.UserCreateOk.user: object expected");
                    message.user = $root.v1.User.fromObject(object.user);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a UserCreateOk message. Also converts values to other types if specified.
             * @function toObject
             * @memberof v1.UserCreateOk
             * @static
             * @param {v1.UserCreateOk} message UserCreateOk
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UserCreateOk.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.user = null;
                if (message.user != null && message.hasOwnProperty("user"))
                    object.user = $root.v1.User.toObject(message.user, options);
                return object;
            };
    
            /**
             * Converts this UserCreateOk to JSON.
             * @function toJSON
             * @memberof v1.UserCreateOk
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UserCreateOk.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return UserCreateOk;
        })();
    
        v1.UserLogin = (function() {
    
            /**
             * Properties of a UserLogin.
             * @memberof v1
             * @interface IUserLogin
             * @property {string} email UserLogin email
             * @property {string} password UserLogin password
             */
    
            /**
             * Constructs a new UserLogin.
             * @memberof v1
             * @classdesc Represents a UserLogin.
             * @implements IUserLogin
             * @constructor
             * @param {v1.IUserLogin=} [properties] Properties to set
             */
            function UserLogin(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * UserLogin email.
             * @member {string} email
             * @memberof v1.UserLogin
             * @instance
             */
            UserLogin.prototype.email = "";
    
            /**
             * UserLogin password.
             * @member {string} password
             * @memberof v1.UserLogin
             * @instance
             */
            UserLogin.prototype.password = "";
    
            /**
             * Creates a new UserLogin instance using the specified properties.
             * @function create
             * @memberof v1.UserLogin
             * @static
             * @param {v1.IUserLogin=} [properties] Properties to set
             * @returns {v1.UserLogin} UserLogin instance
             */
            UserLogin.create = function create(properties) {
                return new UserLogin(properties);
            };
    
            /**
             * Verifies a UserLogin message.
             * @function verify
             * @memberof v1.UserLogin
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UserLogin.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (!$util.isString(message.email))
                    return "email: string expected";
                if (!$util.isString(message.password))
                    return "password: string expected";
                return null;
            };
    
            /**
             * Creates a UserLogin message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof v1.UserLogin
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {v1.UserLogin} UserLogin
             */
            UserLogin.fromObject = function fromObject(object) {
                if (object instanceof $root.v1.UserLogin)
                    return object;
                var message = new $root.v1.UserLogin();
                if (object.email != null)
                    message.email = String(object.email);
                if (object.password != null)
                    message.password = String(object.password);
                return message;
            };
    
            /**
             * Creates a plain object from a UserLogin message. Also converts values to other types if specified.
             * @function toObject
             * @memberof v1.UserLogin
             * @static
             * @param {v1.UserLogin} message UserLogin
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UserLogin.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.email = "";
                    object.password = "";
                }
                if (message.email != null && message.hasOwnProperty("email"))
                    object.email = message.email;
                if (message.password != null && message.hasOwnProperty("password"))
                    object.password = message.password;
                return object;
            };
    
            /**
             * Converts this UserLogin to JSON.
             * @function toJSON
             * @memberof v1.UserLogin
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UserLogin.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return UserLogin;
        })();
    
        v1.UserLoginOk = (function() {
    
            /**
             * Properties of a UserLoginOk.
             * @memberof v1
             * @interface IUserLoginOk
             * @property {v1.IUser} user UserLoginOk user
             */
    
            /**
             * Constructs a new UserLoginOk.
             * @memberof v1
             * @classdesc Represents a UserLoginOk.
             * @implements IUserLoginOk
             * @constructor
             * @param {v1.IUserLoginOk=} [properties] Properties to set
             */
            function UserLoginOk(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * UserLoginOk user.
             * @member {v1.IUser} user
             * @memberof v1.UserLoginOk
             * @instance
             */
            UserLoginOk.prototype.user = null;
    
            /**
             * Creates a new UserLoginOk instance using the specified properties.
             * @function create
             * @memberof v1.UserLoginOk
             * @static
             * @param {v1.IUserLoginOk=} [properties] Properties to set
             * @returns {v1.UserLoginOk} UserLoginOk instance
             */
            UserLoginOk.create = function create(properties) {
                return new UserLoginOk(properties);
            };
    
            /**
             * Verifies a UserLoginOk message.
             * @function verify
             * @memberof v1.UserLoginOk
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UserLoginOk.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                {
                    var error = $root.v1.User.verify(message.user);
                    if (error)
                        return "user." + error;
                }
                return null;
            };
    
            /**
             * Creates a UserLoginOk message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof v1.UserLoginOk
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {v1.UserLoginOk} UserLoginOk
             */
            UserLoginOk.fromObject = function fromObject(object) {
                if (object instanceof $root.v1.UserLoginOk)
                    return object;
                var message = new $root.v1.UserLoginOk();
                if (object.user != null) {
                    if (typeof object.user !== "object")
                        throw TypeError(".v1.UserLoginOk.user: object expected");
                    message.user = $root.v1.User.fromObject(object.user);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a UserLoginOk message. Also converts values to other types if specified.
             * @function toObject
             * @memberof v1.UserLoginOk
             * @static
             * @param {v1.UserLoginOk} message UserLoginOk
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UserLoginOk.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.user = null;
                if (message.user != null && message.hasOwnProperty("user"))
                    object.user = $root.v1.User.toObject(message.user, options);
                return object;
            };
    
            /**
             * Converts this UserLoginOk to JSON.
             * @function toJSON
             * @memberof v1.UserLoginOk
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UserLoginOk.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return UserLoginOk;
        })();
    
        v1.UserCreatedOrLoggedInReply = (function() {
    
            /**
             * Properties of a UserCreatedOrLoggedInReply.
             * @memberof v1
             * @interface IUserCreatedOrLoggedInReply
             * @property {v1.IUser} user UserCreatedOrLoggedInReply user
             * @property {string} token UserCreatedOrLoggedInReply token
             */
    
            /**
             * Constructs a new UserCreatedOrLoggedInReply.
             * @memberof v1
             * @classdesc Represents a UserCreatedOrLoggedInReply.
             * @implements IUserCreatedOrLoggedInReply
             * @constructor
             * @param {v1.IUserCreatedOrLoggedInReply=} [properties] Properties to set
             */
            function UserCreatedOrLoggedInReply(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * UserCreatedOrLoggedInReply user.
             * @member {v1.IUser} user
             * @memberof v1.UserCreatedOrLoggedInReply
             * @instance
             */
            UserCreatedOrLoggedInReply.prototype.user = null;
    
            /**
             * UserCreatedOrLoggedInReply token.
             * @member {string} token
             * @memberof v1.UserCreatedOrLoggedInReply
             * @instance
             */
            UserCreatedOrLoggedInReply.prototype.token = "";
    
            /**
             * Creates a new UserCreatedOrLoggedInReply instance using the specified properties.
             * @function create
             * @memberof v1.UserCreatedOrLoggedInReply
             * @static
             * @param {v1.IUserCreatedOrLoggedInReply=} [properties] Properties to set
             * @returns {v1.UserCreatedOrLoggedInReply} UserCreatedOrLoggedInReply instance
             */
            UserCreatedOrLoggedInReply.create = function create(properties) {
                return new UserCreatedOrLoggedInReply(properties);
            };
    
            /**
             * Verifies a UserCreatedOrLoggedInReply message.
             * @function verify
             * @memberof v1.UserCreatedOrLoggedInReply
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UserCreatedOrLoggedInReply.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                {
                    var error = $root.v1.User.verify(message.user);
                    if (error)
                        return "user." + error;
                }
                if (!$util.isString(message.token))
                    return "token: string expected";
                return null;
            };
    
            /**
             * Creates a UserCreatedOrLoggedInReply message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof v1.UserCreatedOrLoggedInReply
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {v1.UserCreatedOrLoggedInReply} UserCreatedOrLoggedInReply
             */
            UserCreatedOrLoggedInReply.fromObject = function fromObject(object) {
                if (object instanceof $root.v1.UserCreatedOrLoggedInReply)
                    return object;
                var message = new $root.v1.UserCreatedOrLoggedInReply();
                if (object.user != null) {
                    if (typeof object.user !== "object")
                        throw TypeError(".v1.UserCreatedOrLoggedInReply.user: object expected");
                    message.user = $root.v1.User.fromObject(object.user);
                }
                if (object.token != null)
                    message.token = String(object.token);
                return message;
            };
    
            /**
             * Creates a plain object from a UserCreatedOrLoggedInReply message. Also converts values to other types if specified.
             * @function toObject
             * @memberof v1.UserCreatedOrLoggedInReply
             * @static
             * @param {v1.UserCreatedOrLoggedInReply} message UserCreatedOrLoggedInReply
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UserCreatedOrLoggedInReply.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.user = null;
                    object.token = "";
                }
                if (message.user != null && message.hasOwnProperty("user"))
                    object.user = $root.v1.User.toObject(message.user, options);
                if (message.token != null && message.hasOwnProperty("token"))
                    object.token = message.token;
                return object;
            };
    
            /**
             * Converts this UserCreatedOrLoggedInReply to JSON.
             * @function toJSON
             * @memberof v1.UserCreatedOrLoggedInReply
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UserCreatedOrLoggedInReply.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return UserCreatedOrLoggedInReply;
        })();
    
        v1.User = (function() {
    
            /**
             * Properties of a User.
             * @memberof v1
             * @interface IUser
             * @property {string} id User id
             * @property {string} name User name
             * @property {string} email User email
             */
    
            /**
             * Constructs a new User.
             * @memberof v1
             * @classdesc Represents a User.
             * @implements IUser
             * @constructor
             * @param {v1.IUser=} [properties] Properties to set
             */
            function User(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * User id.
             * @member {string} id
             * @memberof v1.User
             * @instance
             */
            User.prototype.id = "";
    
            /**
             * User name.
             * @member {string} name
             * @memberof v1.User
             * @instance
             */
            User.prototype.name = "";
    
            /**
             * User email.
             * @member {string} email
             * @memberof v1.User
             * @instance
             */
            User.prototype.email = "";
    
            /**
             * Creates a new User instance using the specified properties.
             * @function create
             * @memberof v1.User
             * @static
             * @param {v1.IUser=} [properties] Properties to set
             * @returns {v1.User} User instance
             */
            User.create = function create(properties) {
                return new User(properties);
            };
    
            /**
             * Verifies a User message.
             * @function verify
             * @memberof v1.User
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            User.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (!$util.isString(message.id))
                    return "id: string expected";
                if (!$util.isString(message.name))
                    return "name: string expected";
                if (!$util.isString(message.email))
                    return "email: string expected";
                return null;
            };
    
            /**
             * Creates a User message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof v1.User
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {v1.User} User
             */
            User.fromObject = function fromObject(object) {
                if (object instanceof $root.v1.User)
                    return object;
                var message = new $root.v1.User();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.email != null)
                    message.email = String(object.email);
                return message;
            };
    
            /**
             * Creates a plain object from a User message. Also converts values to other types if specified.
             * @function toObject
             * @memberof v1.User
             * @static
             * @param {v1.User} message User
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            User.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.email = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.email != null && message.hasOwnProperty("email"))
                    object.email = message.email;
                return object;
            };
    
            /**
             * Converts this User to JSON.
             * @function toJSON
             * @memberof v1.User
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            User.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return User;
        })();
    
        return v1;
    })();

    return $root;
});
