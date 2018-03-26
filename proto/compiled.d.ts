import * as $protobuf from "protobufjs";

/** Namespace v1. */
export namespace v1 {

    /** Properties of a Broadcast. */
    interface IBroadcast {

        /** Broadcast type */
        type: string;

        /** Broadcast payload */
        payload: string;

        /** Broadcast targets */
        targets?: (string[]|null);
    }

    /** Represents a Broadcast. */
    class Broadcast implements IBroadcast {

        /**
         * Constructs a new Broadcast.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IBroadcast);

        /** Broadcast type. */
        public type: string;

        /** Broadcast payload. */
        public payload: string;

        /** Broadcast targets. */
        public targets: string[];

        /**
         * Creates a new Broadcast instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Broadcast instance
         */
        public static create(properties?: v1.IBroadcast): v1.Broadcast;

        /**
         * Verifies a Broadcast message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Broadcast message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Broadcast
         */
        public static fromObject(object: { [k: string]: any }): v1.Broadcast;

        /**
         * Creates a plain object from a Broadcast message. Also converts values to other types if specified.
         * @param message Broadcast
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.Broadcast, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Broadcast to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a NotificationCreateOk. */
    interface INotificationCreateOk {

        /** NotificationCreateOk notification */
        notification: v1.INotification;
    }

    /** Represents a NotificationCreateOk. */
    class NotificationCreateOk implements INotificationCreateOk {

        /**
         * Constructs a new NotificationCreateOk.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.INotificationCreateOk);

        /** NotificationCreateOk notification. */
        public notification: v1.INotification;

        /**
         * Creates a new NotificationCreateOk instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NotificationCreateOk instance
         */
        public static create(properties?: v1.INotificationCreateOk): v1.NotificationCreateOk;

        /**
         * Verifies a NotificationCreateOk message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a NotificationCreateOk message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns NotificationCreateOk
         */
        public static fromObject(object: { [k: string]: any }): v1.NotificationCreateOk;

        /**
         * Creates a plain object from a NotificationCreateOk message. Also converts values to other types if specified.
         * @param message NotificationCreateOk
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.NotificationCreateOk, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this NotificationCreateOk to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Notification. */
    interface INotification {

        /** Notification id */
        id: string;

        /** Notification from */
        from: string;

        /** Notification to */
        to: string;

        /** Notification message */
        message?: (string|null);

        /** Notification metadata */
        metadata?: (string|null);
    }

    /** Represents a Notification. */
    class Notification implements INotification {

        /**
         * Constructs a new Notification.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.INotification);

        /** Notification id. */
        public id: string;

        /** Notification from. */
        public from: string;

        /** Notification to. */
        public to: string;

        /** Notification message. */
        public message: string;

        /** Notification metadata. */
        public metadata: string;

        /**
         * Creates a new Notification instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Notification instance
         */
        public static create(properties?: v1.INotification): v1.Notification;

        /**
         * Verifies a Notification message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Notification message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Notification
         */
        public static fromObject(object: { [k: string]: any }): v1.Notification;

        /**
         * Creates a plain object from a Notification message. Also converts values to other types if specified.
         * @param message Notification
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.Notification, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Notification to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a UserCreate. */
    interface IUserCreate {

        /** UserCreate name */
        name: string;

        /** UserCreate email */
        email: string;

        /** UserCreate password */
        password: string;
    }

    /** Represents a UserCreate. */
    class UserCreate implements IUserCreate {

        /**
         * Constructs a new UserCreate.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IUserCreate);

        /** UserCreate name. */
        public name: string;

        /** UserCreate email. */
        public email: string;

        /** UserCreate password. */
        public password: string;

        /**
         * Creates a new UserCreate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserCreate instance
         */
        public static create(properties?: v1.IUserCreate): v1.UserCreate;

        /**
         * Verifies a UserCreate message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserCreate message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserCreate
         */
        public static fromObject(object: { [k: string]: any }): v1.UserCreate;

        /**
         * Creates a plain object from a UserCreate message. Also converts values to other types if specified.
         * @param message UserCreate
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.UserCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserCreate to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a UserCreateOk. */
    interface IUserCreateOk {

        /** UserCreateOk user */
        user: v1.IUser;
    }

    /** Represents a UserCreateOk. */
    class UserCreateOk implements IUserCreateOk {

        /**
         * Constructs a new UserCreateOk.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IUserCreateOk);

        /** UserCreateOk user. */
        public user: v1.IUser;

        /**
         * Creates a new UserCreateOk instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserCreateOk instance
         */
        public static create(properties?: v1.IUserCreateOk): v1.UserCreateOk;

        /**
         * Verifies a UserCreateOk message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserCreateOk message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserCreateOk
         */
        public static fromObject(object: { [k: string]: any }): v1.UserCreateOk;

        /**
         * Creates a plain object from a UserCreateOk message. Also converts values to other types if specified.
         * @param message UserCreateOk
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.UserCreateOk, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserCreateOk to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a UserLogin. */
    interface IUserLogin {

        /** UserLogin email */
        email: string;

        /** UserLogin password */
        password: string;
    }

    /** Represents a UserLogin. */
    class UserLogin implements IUserLogin {

        /**
         * Constructs a new UserLogin.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IUserLogin);

        /** UserLogin email. */
        public email: string;

        /** UserLogin password. */
        public password: string;

        /**
         * Creates a new UserLogin instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserLogin instance
         */
        public static create(properties?: v1.IUserLogin): v1.UserLogin;

        /**
         * Verifies a UserLogin message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserLogin message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserLogin
         */
        public static fromObject(object: { [k: string]: any }): v1.UserLogin;

        /**
         * Creates a plain object from a UserLogin message. Also converts values to other types if specified.
         * @param message UserLogin
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.UserLogin, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserLogin to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a UserLoginOk. */
    interface IUserLoginOk {

        /** UserLoginOk user */
        user: v1.IUser;
    }

    /** Represents a UserLoginOk. */
    class UserLoginOk implements IUserLoginOk {

        /**
         * Constructs a new UserLoginOk.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IUserLoginOk);

        /** UserLoginOk user. */
        public user: v1.IUser;

        /**
         * Creates a new UserLoginOk instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserLoginOk instance
         */
        public static create(properties?: v1.IUserLoginOk): v1.UserLoginOk;

        /**
         * Verifies a UserLoginOk message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserLoginOk message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserLoginOk
         */
        public static fromObject(object: { [k: string]: any }): v1.UserLoginOk;

        /**
         * Creates a plain object from a UserLoginOk message. Also converts values to other types if specified.
         * @param message UserLoginOk
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.UserLoginOk, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserLoginOk to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a UserCreatedOrLoggedInReply. */
    interface IUserCreatedOrLoggedInReply {

        /** UserCreatedOrLoggedInReply user */
        user: v1.IUser;

        /** UserCreatedOrLoggedInReply token */
        token: string;
    }

    /** Represents a UserCreatedOrLoggedInReply. */
    class UserCreatedOrLoggedInReply implements IUserCreatedOrLoggedInReply {

        /**
         * Constructs a new UserCreatedOrLoggedInReply.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IUserCreatedOrLoggedInReply);

        /** UserCreatedOrLoggedInReply user. */
        public user: v1.IUser;

        /** UserCreatedOrLoggedInReply token. */
        public token: string;

        /**
         * Creates a new UserCreatedOrLoggedInReply instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserCreatedOrLoggedInReply instance
         */
        public static create(properties?: v1.IUserCreatedOrLoggedInReply): v1.UserCreatedOrLoggedInReply;

        /**
         * Verifies a UserCreatedOrLoggedInReply message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserCreatedOrLoggedInReply message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserCreatedOrLoggedInReply
         */
        public static fromObject(object: { [k: string]: any }): v1.UserCreatedOrLoggedInReply;

        /**
         * Creates a plain object from a UserCreatedOrLoggedInReply message. Also converts values to other types if specified.
         * @param message UserCreatedOrLoggedInReply
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.UserCreatedOrLoggedInReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserCreatedOrLoggedInReply to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a User. */
    interface IUser {

        /** User id */
        id: string;

        /** User name */
        name: string;

        /** User email */
        email: string;
    }

    /** Represents a User. */
    class User implements IUser {

        /**
         * Constructs a new User.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IUser);

        /** User id. */
        public id: string;

        /** User name. */
        public name: string;

        /** User email. */
        public email: string;

        /**
         * Creates a new User instance using the specified properties.
         * @param [properties] Properties to set
         * @returns User instance
         */
        public static create(properties?: v1.IUser): v1.User;

        /**
         * Verifies a User message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns User
         */
        public static fromObject(object: { [k: string]: any }): v1.User;

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @param message User
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.User, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this User to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
