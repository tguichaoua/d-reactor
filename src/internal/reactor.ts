import { Message, User, EmojiResolvable, MessageReaction, ReactionCollector } from "discord.js";
import { ReactorCancellationToken } from "../ReactorCancellationToken";

/** @internal */
interface ReactorOptionsFull {
    time?: number,
    deleteMessage: boolean,
    cancellationToken?: ReactorCancellationToken,
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
    //
    const opts = Object.assign({}, defaultOptions, options);
    let stop = false;

    const collector = message.createReactionCollector(
        (reaction: MessageReaction, user: User) => (userFilter === undefined || userFilter(user)) && emojis.includes(reaction.emoji.name),
        {
            time: opts.time
        }
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
        collector.stop();
        if (opts.deleteMessage)
            return message.delete().then(() => value, () => value);
        return value;
    });

    if (opts.cancellationToken)
        opts.cancellationToken.onCancel = () => collector.stop();

    for (const e of emojis) {
        if (stop) return promise;
        await message.react(e).catch(() => { });
    }

    return promise;
}