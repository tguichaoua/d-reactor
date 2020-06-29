import { TextBasedChannelFields } from "discord.js";
import indexed_emojis from "../misc/indexed-emojis.json";
import { MessageListOptions } from "../models/options/MessageListOptions";

/** @internal */
export function makeListMessage<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options?: Partial<MessageListOptions<T>>
) {
    if (list.length > 36)
        throw new Error("The number of elements in list cannot exceed 36.");

    const opts: MessageListOptions<T> = {
        ...{
            stringify: o => `${o}`,
            emojis: []
        },
        ...options,
    }
    const emojis = [...opts.emojis, ...indexed_emojis.slice(opts.emojis.length, list.length)];

    let str = `${caption}\n`;
    for (let i = 0; i < list.length; i++)
        str += `${emojis[i]} ${opts.stringify(list[i])}\n`;

    const message = channel.send(str);
    return { message, emojis };
}