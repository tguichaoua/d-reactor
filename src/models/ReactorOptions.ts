export interface ReactorOptions {
        /** If set, the promise is resolved after this amount of time (in milliseconds) after all reactions being set. */
        duration?: number;
        /** If set to true, the message is deleted just before the promise is resolved. (default is false) */
        deleteMessage?: boolean;
}