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

    /** Properties of a Credentials. */
    interface ICredentials {

        /** Credentials id */
        id: string;

        /** Credentials email */
        email: string;

        /** Credentials roles */
        roles?: (string[]|null);

        /** Credentials groups */
        groups?: (string[]|null);

        /** Credentials workspaces */
        workspaces?: (string[]|null);
    }

    /** Represents a Credentials. */
    class Credentials implements ICredentials {

        /**
         * Constructs a new Credentials.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.ICredentials);

        /** Credentials id. */
        public id: string;

        /** Credentials email. */
        public email: string;

        /** Credentials roles. */
        public roles: string[];

        /** Credentials groups. */
        public groups: string[];

        /** Credentials workspaces. */
        public workspaces: string[];

        /**
         * Verifies a Credentials message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Credentials message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Credentials
         */
        public static fromObject(object: { [k: string]: any }): v1.Credentials;

        /**
         * Creates a plain object from a Credentials message. Also converts values to other types if specified.
         * @param message Credentials
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.Credentials, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Credentials to JSON.
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

    /** Properties of a UserUpdate. */
    interface IUserUpdate {

        /** UserUpdate credentials */
        credentials: v1.ICredentials;

        /** UserUpdate update */
        update: v1.IUserUpdatePayload;
    }

    /** Represents a UserUpdate. */
    class UserUpdate implements IUserUpdate {

        /**
         * Constructs a new UserUpdate.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IUserUpdate);

        /** UserUpdate credentials. */
        public credentials: v1.ICredentials;

        /** UserUpdate update. */
        public update: v1.IUserUpdatePayload;

        /**
         * Verifies a UserUpdate message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserUpdate message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserUpdate
         */
        public static fromObject(object: { [k: string]: any }): v1.UserUpdate;

        /**
         * Creates a plain object from a UserUpdate message. Also converts values to other types if specified.
         * @param message UserUpdate
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.UserUpdate, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserUpdate to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a UserUpdatePayload. */
    interface IUserUpdatePayload {

        /** UserUpdatePayload name */
        name?: (string|null);

        /** UserUpdatePayload email */
        email?: (string|null);

        /** UserUpdatePayload password */
        password?: (string|null);
    }

    /** Represents a UserUpdatePayload. */
    class UserUpdatePayload implements IUserUpdatePayload {

        /**
         * Constructs a new UserUpdatePayload.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IUserUpdatePayload);

        /** UserUpdatePayload name. */
        public name: string;

        /** UserUpdatePayload email. */
        public email: string;

        /** UserUpdatePayload password. */
        public password: string;

        /** UserUpdatePayload update. */
        public update?: ("name"|"email"|"password");

        /**
         * Verifies a UserUpdatePayload message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserUpdatePayload message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserUpdatePayload
         */
        public static fromObject(object: { [k: string]: any }): v1.UserUpdatePayload;

        /**
         * Creates a plain object from a UserUpdatePayload message. Also converts values to other types if specified.
         * @param message UserUpdatePayload
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.UserUpdatePayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserUpdatePayload to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a UserUpdateOk. */
    interface IUserUpdateOk {

        /** UserUpdateOk userId */
        userId: string;

        /** UserUpdateOk update */
        update: v1.IUserUpdatePayload;
    }

    /** Represents a UserUpdateOk. */
    class UserUpdateOk implements IUserUpdateOk {

        /**
         * Constructs a new UserUpdateOk.
         * @param [properties] Properties to set
         */
        constructor(properties?: v1.IUserUpdateOk);

        /** UserUpdateOk userId. */
        public userId: string;

        /** UserUpdateOk update. */
        public update: v1.IUserUpdatePayload;

        /**
         * Verifies a UserUpdateOk message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserUpdateOk message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserUpdateOk
         */
        public static fromObject(object: { [k: string]: any }): v1.UserUpdateOk;

        /**
         * Creates a plain object from a UserUpdateOk message. Also converts values to other types if specified.
         * @param message UserUpdateOk
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: v1.UserUpdateOk, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserUpdateOk to JSON.
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
