import { TextBasedChannelFields, ReactionCollector } from "discord.js";
import { ReactorOptions, reactor, OnReactionChangedParams, UserFilter } from "./reactor";
import { sendListMessage, MessageListOptions } from "./sendListMessage";

export type ListOptions<T> = ReactorOptions & MessageListOptions<T>;

/** @internal */
export async function reactorList<T, R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    onEnd?: (collector: ReactionCollector) => R | null,
    onCollect?: (params: OnReactionChangedParams & { readonly index: number }) => {value: R} | boolean | void,
    onRemove?: (params: OnReactionChangedParams & { readonly index: number }) => void,
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