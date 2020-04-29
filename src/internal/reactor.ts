import { Message, User, EmojiResolvable, MessageReaction, ReactionCollector } from "discord.js";

/** @internal */
interface ReactorOptionsFull {
    time?: number,
    deleteMessage: boolean,
}

export type ReactorOptions = Partial<ReactorOptionsFull>;
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
 * @param users - if empty, all users can react.
 * 
 * @param onEnd - called when reaction collection end and promise not resolved.
 * 
 */
export async function reactor<T>(
    message: Message,
    users: User[],
    emojis: EmojiResolvable[],
    onEnd: (collector: ReactionCollector) => T,
    onCollect?: (params: OnCollectParams<T>) => void,
    options?: ReactorOptions
) {
    const opts = Object.assign({}, defaultOptions, options);
    let stop = false;

    const collector = message.createReactionCollector(
        (reaction: MessageReaction, user: User) => (users.length === 0 || users.some(u => user.id === u.id)) && emojis.includes(reaction.emoji.name),
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

    for (const e of emojis) {
        if (stop) return promise;
        await message.react(e).catch(() => { });
    }

    return promise;
}