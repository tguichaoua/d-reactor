import { TextBasedChannelFields, ReactionCollector, EmojiResolvable } from "discord.js";
import { ReactorOptions, reactor, OnReactionChangedParams, UserFilter } from "./reactor";
import { sendListMessage, MessageListOptions } from "./sendListMessage";
import { makeCancellable } from "../misc/makeCancellable";

export interface Button {
    emoji: EmojiResolvable;
    action: () => void;
}

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
    buttons: Button[] = [],
) {
    return makeCancellable<R>(
        async onCancel => {
            onCancel.shouldReject = false;

            if (list.length === 0)
                throw new Error("List must not be empty.");

            const { message, emojis } = await sendListMessage(channel, caption, list, options);
            const buttonEmojis = buttons.map(b => b.emoji);

            const promise = reactor<R>(
                message,
                [...emojis, ...buttonEmojis],
                onEnd,
                (params) => {
                    const btnIndex = buttonEmojis.indexOf(params.reaction.emoji.name);
                    if (btnIndex !== -1) {
                        buttons[btnIndex].action();
                        return false;
                    } else {
                        return onCollect ?
                            onCollect(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) }))
                            : undefined
                    }
                },
                onRemove ?
                    (params) => onRemove(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) }))
                    : undefined,
                userFilter,
                options
            );

            onCancel(() => promise.cancel());
            return promise;
        }
    );
}