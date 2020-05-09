import { Message, User, EmojiResolvable, MessageReaction, ReactionCollector } from "discord.js";
import PCancelable from "p-cancelable";

interface ReactorOptionsFull {
    /** If set, the promise is resolved after this amount of time (in milliseconds). */
    duration?: number,
    /** If set to true, the message is deleted just before the promise is resolved. (default is false) */
    deleteMessage: boolean,
}

export type ReactorOptions = Partial<ReactorOptionsFull>;
export type UserFilter = (user: User) => boolean;

/** @internal */
export interface OnReactionChangedParams {
    readonly collector: ReactionCollector;
    readonly reaction: MessageReaction;
    readonly user: User;
}

/** @internal */
const defaultOptions: Readonly<ReactorOptionsFull> = {
    deleteMessage: false,
}

/** @internal
 * @param onEnd - called when reaction collection end and promise not resolved.
 * @param userFilter - Determine if a user is allow to react.
 */
export function reactor<T>(
    message: Message,
    emojis: readonly EmojiResolvable[],
    onEnd: (collector: ReactionCollector) => T,
    onCollect?: (params: OnReactionChangedParams) => { value: T } | boolean | void,
    onRemove?: (params: OnReactionChangedParams) => void,
    userFilter?: UserFilter,
    options?: ReactorOptions
): PCancelable<T> {
    const opts = Object.assign({}, defaultOptions, options);
    let stop = false;

    const collector = message.createReactionCollector(
        (reaction: MessageReaction, _: User) => emojis.includes(reaction.emoji.name),
        {
            dispose: true,
        }
    );

    return new PCancelable<T>(
        async (resolve, reject, onCancel) => {
            onCancel(() => collector.stop());

            function onResolve(value: T) {
                stop = true;
                if (timer)
                    message.client.clearTimeout(timer);
                collector.stop();

                if (opts.deleteMessage)
                    resolve(message.delete().then(() => value, () => value));
                resolve(value);
            }


            collector.on("collect", async (reaction, user) => {
                if (user.id === message.client.user?.id) return; // don't trigger userFilter & onCollect if the user is the bot

                if (userFilter && !userFilter(user))
                    await reaction.users.remove(user).catch(() => { });

                if (onCollect) {
                    const action = onCollect({ collector, reaction, user });
                    if (typeof action === "boolean" || !action) {
                        if (!(action ?? true)) await reaction.users.remove(user).catch(() => { });
                    }
                    else
                        onResolve(action.value);
                }
            });

            // collector.on("dispose", (reaction, user) => {
            //     console.log(`Dispose ${reaction.emoji.name} by ${user.username}`);
            // });

            if (onRemove)
                collector.on("remove", (reaction, user) => {
                    onRemove({ collector, reaction, user });
                });

            collector.once("end", () => {
                if (!stop)
                    onResolve(onEnd(collector));
            });


            for (const e of emojis) {
                await message.react(e).catch(() => { });
                if (stop) break;
            }

            let timer: NodeJS.Timer;
            if (!stop && opts.duration)
                timer = message.client.setTimeout(() => collector.stop(), opts.duration);
        }
    );
}