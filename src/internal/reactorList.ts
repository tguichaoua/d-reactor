import { TextBasedChannelFields, EmojiResolvable, User } from "discord.js";
import { makeListMessage, MessageListOptions } from "./makeListMessage";
import { Reactor, OnEndCallback, OnReactionChangedParams, ReactorInternalOptions } from "../models/Reactor";
import { Predicate } from "../models/Predicate";
import { ReactorOptions } from "../models/options/ReactorOptions";

/** @internal */
export interface ListButton<R> {
    emoji: EmojiResolvable;
    action: () => { value: R } | void;
}

export type ListOptions<T> = ReactorOptions & Partial<MessageListOptions<T>>;

/** @internal */
export function reactorList<T, R, C = R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options: ListOptions<T> | undefined,
    onEnd: OnEndCallback<C>,
    internalOptions: ReactorInternalOptions<R, C>,
    onCollect?: (params: OnReactionChangedParams & { readonly index: number }) => { value: R } | boolean | void,
    onRemove?: (params: OnReactionChangedParams & { readonly index: number }) => void,
    userFilter?: Predicate<User>,
    buttons: ListButton<R>[] = [],
) {

    const { message, emojis } = makeListMessage(channel, caption, list, options);
    const buttonEmojis = buttons.map(b => b.emoji);

    return new Reactor<R, C>(
        message,
        [...emojis, ...buttonEmojis],
        options,
        onEnd,
        internalOptions,
        (params) => {
            const btnIndex = buttonEmojis.indexOf(params.reaction.emoji.name);
            if (btnIndex !== -1) {
                return buttons[btnIndex].action() ?? false;
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
    );
}