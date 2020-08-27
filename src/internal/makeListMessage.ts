import { PartialTextBasedChannelFields, EmojiResolvable } from "discord.js";
import indexed_emojis from "../misc/indexed-emojis.json";

export interface MessageListOptions<T> {
    /** This function is called for each element in the list to convert them into a string in the message. */
    stringify: (o: T) => string;
    /** This list of emojis is used to determine the emoji that represent each elements of the list.
     * If the emoji list is shorter than the list of element, default emojis are used.
     * Warning: no check is done on this list. Passing invalid values can lead to undetermined behaviour.
     */
    emojis: EmojiResolvable[];
}

/** @internal */
export function makeListMessage<T>(
    channel: PartialTextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options?: Partial<MessageListOptions<T>>
) {
    if (list.length > 36)
        throw new Error("The number of elements in list cannot exceed 36.");

    const opts: MessageListOptions<T> = {
        ...{
            stringify: (o) => `${o}`,
            emojis: [],
        },
        ...options,
    };
    const emojis = [
        ...opts.emojis,
        ...indexed_emojis.slice(opts.emojis.length, list.length),
    ];

    let str = `${caption}\n`;
    for (let i = 0; i < list.length; i++)
        str += `${emojis[i]} ${opts.stringify(list[i])}\n`;

    const message = channel.send(str);
    return { message, emojis };
}
