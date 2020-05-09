import { TextBasedChannelFields, ReactionCollector } from "discord.js";
import { ReactorOptions, reactor, OnReactionChangedParams, UserFilter } from "./reactor";
import { sendListMessage, MessageListOptions } from "./sendListMessage";
import PCancelable from "p-cancelable";

export type ListOptions<T> = ReactorOptions & MessageListOptions<T>;

/** @internal */
export function reactorList<T, R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    onEnd?: (collector: ReactionCollector) => R,
    onCollect?: (params: OnReactionChangedParams & { readonly index: number }) => { value: R } | boolean | void,
    onRemove?: (params: OnReactionChangedParams & { readonly index: number }) => void,
    userFilter?: UserFilter,
    options?: ListOptions<T>,
) {
    return new PCancelable<R>(
        async (resolve, reject, onCancel) => {
            if (list.length === 0) reject(new Error("List is empty"));
            try {
                const { message, emojis } = await sendListMessage(channel, caption, list, options);

                const promise = reactor<R>(
                    message,
                    emojis,
                    onEnd,
                    onCollect ?
                        (params) => onCollect(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) }))
                        : undefined,
                    onRemove ?
                        (params) => onRemove(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) }))
                        : undefined,
                    userFilter,
                    options
                );

                onCancel(promise.cancel);
                resolve(promise);
            } catch (error) {
                reject(error);
            }
        }
    );
}