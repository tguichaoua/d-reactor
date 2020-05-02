import { TextBasedChannelFields, ReactionCollector } from "discord.js";
import { ReactorOptions, reactor, OnCollectParams, UserFilter } from "./reactor";
import { sendListMessage, MessageListOptions } from "./sendListMessage";

export type ListOptions<T> = ReactorOptions & MessageListOptions<T>;

/** @internal */
export async function reactorList<T, R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    onEnd?: (collector: ReactionCollector) => R | null,
    onCollect?: (params: OnCollectParams<R> & { readonly index: number }) => boolean | void,
    onRemove?: (params: OnCollectParams<R> & { readonly index: number }) => void,
    userFilter?: UserFilter,
    options?: ListOptions<T>,
) {
    if (list.length === 0) return null;
    const { message, emojis } = await sendListMessage(channel, caption, list, options);

    return reactor<R | null>(
        message,
        emojis,
        onEnd ?? (() => null),
        onCollect ?
            (params) => onCollect(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) }))
            : undefined,
        onRemove ?
            (params) => onRemove(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) }))
            : undefined,
        userFilter,
        options
    );
}