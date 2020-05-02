import { TextBasedChannelFields, ReactionCollector } from "discord.js";
import { ReactorOptions, reactor, OnCollectParams, UserFilter } from "./reactor";
import { sendListMessage, ListOptions } from "./sendListMessage";

export type ReactorListOptions<T> = ReactorOptions & ListOptions<T>;

/** @internal */
export async function reactorList<T, R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    onEnd?: (collector: ReactionCollector, votes: number[]) => R | null,
    onCollect?: (params: OnCollectParams<R> & { readonly index: number }) => void,
    userFilter?: UserFilter,
    options?: ReactorListOptions<T>,
) {
    if (list.length === 0) return null;
    const { message, emojis } = await sendListMessage(channel, caption, list, options);

    return reactor<R | null>(
        message,
        emojis,
        onEnd ?
            c => {
                const votes = new Array<number>(list.length).fill(0);
                for (const r of c.collected.values())
                    votes[emojis.indexOf(r.emoji.name)] = r.count ?? 0;
                return onEnd(c, votes);
            }
            : () => null,
        onCollect ?
            (params) => onCollect(Object.assign(params, { index: emojis.indexOf(params.reaction.emoji.name) }))
            : undefined,
        userFilter,
        options
    );
}