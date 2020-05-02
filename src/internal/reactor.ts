import { Message, User, EmojiResolvable, MessageReaction, ReactionCollector } from "discord.js";
import { ReactorStopToken } from "../models/ReactorStopToken";

interface ReactorOptionsFull {
    /** If set, the promise is resolved after this amount of time (in milliseconds). */
    duration?: number,
    /** If set to true, the message is deleted just before the promise is resolved. (default is false) */
    deleteMessage: boolean,
    /** If set, the promise will be resolved as soon as the stop method of the token is called. */
    cancellationToken?: ReactorStopToken,
}

export type ReactorOptions = Partial<ReactorOptionsFull>;
export type UserFilter = (user: User) => boolean;

export interface OnCollectParams<T> {
    readonly collector: ReactionCollector;
    readonly reaction: MessageReaction;
    readonly user: User;
    readonly resolve: (value?: T | PromiseLike<T>) => void;
    readonly reject: (reason?: any) => void;
}

/** @internal */
const defaultOptions: ReactorOptionsFull = {
    deleteMessage: false,
}

/** @internal
 * 
 * @param onEnd - called when reaction collection end and promise not resolved.
 * 
 * @param userFilter - Determin if a user is allow to react.
 */
export async function reactor<T>(
    message: Message,
    emojis: readonly EmojiResolvable[],
    onEnd: (collector: ReactionCollector) => T,
    onCollect?: (params: OnCollectParams<T>) => void,
    userFilter?: UserFilter,
    options?: ReactorOptions
) {
    const opts = Object.assign({}, defaultOptions, options);
    let stop = false;

    const collector = message.createReactionCollector(
        (reaction: MessageReaction, user: User) => (userFilter === undefined || userFilter(user)) && emojis.includes(reaction.emoji.name)
    );

    const promise = new Promise<T>((resolve, reject) => {
        if (onCollect)
            collector.on("collect", (reaction, user) => onCollect({ collector, reaction, user, resolve, reject }));
        collector.once("end", () => {
            if (!stop)
                resolve(onEnd(collector))
        });
    }).then(value => {
        stop = true;
        if (timer)
            message.client.clearTimeout(timer);
        collector.stop();
        if (opts.deleteMessage)
            return message.delete().then(() => value, () => value);
        return value;
    });

    if (opts.cancellationToken)
        opts.cancellationToken.onStop = () => collector.stop();

    for (const e of emojis) {
        if (stop) return promise;
        await message.react(e).catch(() => { });
    }

    let timer: NodeJS.Timer;
    if (opts.duration)
        timer = message.client.setTimeout(() => collector.stop(), opts.duration);

    return promise;
}