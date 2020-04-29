import { TextBasedChannelFields, User, ReactionCollector, MessageReaction, UserResolvable } from "discord.js";
import { ReactorOptions, reactor, OnCollectParams } from "./reactor";
import { sendListMessage } from "./sendListMessage";
import indexed_emojis from "../indexed-emojis";

export type ReactorListOptions<T> = ReactorOptions & { toString?: (o: T) => string };

export async function reactorList<T>(
    channel: TextBasedChannelFields,
    prompt: string,
    users: readonly UserResolvable[],
    list: readonly T[],
    onEnd: (collector: ReactionCollector) => T | null,
    onCollect?: (params: OnCollectParams<T | null> & { readonly index: number }) => void,
    options?: ReactorListOptions<T>
) {
    if (list.length === 0) return null;
    const message = await sendListMessage(channel, prompt, list, options?.toString);
    const emojis = indexed_emojis.slice(0, list.length);

    return reactor<T | null>(
        message,
        users,
        emojis,
        onEnd,
        onCollect ? (params) => onCollect(Object.assign(params, {index: emojis.indexOf(params.reaction.emoji.name)})) : undefined,
        options
    );
}