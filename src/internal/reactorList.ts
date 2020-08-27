import { TextBasedChannelFields, EmojiResolvable } from "discord.js";
import { makeListMessage, MessageListOptions } from "./makeListMessage";
import {
    Reactor,
    OnEndCallback,
    OnReactionChangedParams,
    ReactorInternalOptions,
} from "../models/Reactor";
import { ReactorOptions } from "../models/ReactorOptions";

/** @internal */
export interface ListButton<R> {
    emoji: EmojiResolvable;
    action: () => { value: R } | void;
}

export type ListOptions<T> = ReactorOptions & Partial<MessageListOptions<T>>;

/** @internal */
export type ReactorListInternalOptions<R, C> = Omit<
    ReactorInternalOptions<R, C>,
    "onCollect" | "onRemove"
> & {
    onCollect?: (
        params: OnReactionChangedParams & { readonly index: number }
    ) => ReturnType<NonNullable<ReactorInternalOptions<R, C>["onCollect"]>>;
    onRemove?: (
        params: OnReactionChangedParams & { readonly index: number }
    ) => ReturnType<NonNullable<ReactorInternalOptions<R, C>["onRemove"]>>;
    buttons?: ListButton<R>[];
};

/** @internal */
export function reactorList<T, R, C = R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options: ListOptions<T> | undefined,
    onEnd: OnEndCallback<C>,
    internalOptions: ReactorListInternalOptions<R, C>
) {
    const { message, emojis } = makeListMessage(
        channel,
        caption,
        list,
        options
    );
    const buttons = internalOptions.buttons ?? [];
    const buttonEmojis = buttons.map((b) => b.emoji);

    return new Reactor<R, C>(
        message,
        [...emojis, ...buttonEmojis],
        options,
        onEnd,
        {
            ...internalOptions,
            ...{
                onCollect(params) {
                    const btnIndex = buttonEmojis.indexOf(
                        params.reaction.emoji.name
                    );
                    if (btnIndex !== -1)
                        return buttons[btnIndex].action() ?? { remove: true };
                    else
                        return internalOptions.onCollect
                            ? internalOptions.onCollect(
                                  Object.assign(params, {
                                      index: emojis.indexOf(
                                          params.reaction.emoji.name
                                      ),
                                  })
                              )
                            : undefined;
                },
                onRemove: internalOptions.onRemove
                    ? (params) =>
                          (internalOptions.onRemove as NonNullable<
                              typeof internalOptions["onRemove"]
                          >)(
                              Object.assign(params, {
                                  index: emojis.indexOf(
                                      params.reaction.emoji.name
                                  ),
                              })
                          )
                    : undefined,
            },
        }
    );
}
