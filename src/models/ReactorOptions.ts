export interface ReactorOptions {
        /** If set, the reactor is cancelled with the status `timeout` after this amount of time (in milliseconds) after all reactions being set. */
        duration?: number;
        /** If set to true, the message is deleted just before the reactor value is resolved. (default is false) */
        deleteMessage?: boolean;
}