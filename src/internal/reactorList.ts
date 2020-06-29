import { TextBasedChannelFields, EmojiResolvable, User } from "discord.js";
import { makeListMessage } from "./sendListMessage";
import { Reactor, OnEndCallback, OnReactionChangedParams } from "../models/Reactor";
import { MessageListOptions } from "../models/options/MessageListOptions";
import { Predicate } from "../models/Predicate";
import { ReactorOptions } from "../models/options/ReactorOptions";

export interface ListButton<R> {
    emoji: EmojiResolvable;
    action: () => { value: R } | void;
}

export type ListOptions<T> = ReactorOptions & Partial<MessageListOptions<T>>;

// /** @internal */
// export function reactorList<T, R>(
//     channel: TextBasedChannelFields,
//     caption: string,
//     list: readonly T[],
//     onEnd?: (collector: ReactionCollector) => R,
//     onCollect?: (params: OnReactionChangedParams & { readonly index: number }) => { value: R } | boolean | void,
//     onRemove?: (params: OnReactionChangedParams & { readonly index: number }) => void,
//     userFilter?: UserFilter,
//     options?: ListOptions<T>,
//     buttons: Button<R>[] = [],
// ) {
//     return makeCancellable<R>(
//         async onCancel => {
//             onCancel.shouldReject = false;

//             if (list.length === 0)
//                 throw new Error("List must not be empty.");

//             const { message, emojis } = await sendListMessage(channel, caption, list, options);
//             const buttonEmojis = buttons.map(b => b.emoji);

//             const promise = reactor<R>(
//                 message,
//                 [...emojis, ...buttonEmojis],
//                 onEnd,
//                 (params) => {
//                     const btnIndex = buttonEmojis.indexOf(params.reaction.emoji.name);
//                     if (btnIndex !== -1) {
//                         return buttons[btnIndex].action() ?? false;
//                     } else {
//                         return onCollect ?
//                             onCollect(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) }))
//                             : undefined
//                     }
//                 },
//                 onRemove ?
//                     (params) => onRemove(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) }))
//                     : undefined,
//                 userFilter,
//                 options
//             );

//             onCancel(() => promise.cancel());
//             return promise;
//         }
//     );
// }

export function reactorList<T, R, C = R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options: ListOptions<T> | undefined,
    onEnd: OnEndCallback<C>,
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