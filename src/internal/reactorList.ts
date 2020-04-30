import { TextBasedChannelFields, ReactionCollector } from "discord.js";
import { ReactorOptions, reactor, OnCollectParams, UserFilter } from "./reactor";
import { sendListMessage } from "./sendListMessage";
import indexed_emojis from "../indexed-emojis";

export type ReactorListOptions<T> = ReactorOptions & {
    /** This function is called for each element in the list to convert them into a string in the message. (default is o => `${o}`) */
    stringify?: (o: T) => string
};

/** @internal */
export async function reactorList<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    onEnd: (collector: ReactionCollector) => T | null,
    onCollect?: (params: OnCollectParams<T | null> & { readonly index: number }) => void,
    userFilter?: UserFilter,
    options?: ReactorListOptions<T>
) {
    if (list.length === 0) return null;
    const message = await sendListMessage(channel, caption, list, options?.stringify);
    const emojis = indexed_emojis.slice(0, list.length);

    return reactor<T | null>(
        message,
        emojis,
        onEnd,
        onCollect ? (params) => onCollect(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) })) : undefined,
        userFilter,
        options
    );
}