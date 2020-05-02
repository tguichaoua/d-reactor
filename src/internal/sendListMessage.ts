import { TextBasedChannelFields, EmojiResolvable } from "discord.js";
import indexed_emojis from "../misc/indexed-emojis.json";

export interface ListOptionsFull<T> {
    /** This function is called for each element in the list to convert them into a string in the message. (default is o => `${o}`) */
    stringify: (o: T) => string,
    /** This list of emojis is used to determine the emoji that represent each elements of the list.
     * If the emoji list is shorter than the list of element, default emojis are used.
     * Warning: no check is done on this list. Passing invalid values can lead to undetermined behaviour.
     */
    emojis: EmojiResolvable[],

};

export type ListOptions<T> = Partial<ListOptionsFull<T>>

/** @internal */
const defautlOptions: ListOptionsFull<any> = {
    stringify: o => `${o}`,
    emojis: [],
}

/** @internal */
export async function sendListMessage<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options?: ListOptions<T>
) {
    if (list.length > 36)
        throw new Error("The number of elements in list cannot exceed 36.");

    const opts = Object.assign({}, defautlOptions, options);
    const emojis = [...opts.emojis, ...indexed_emojis.slice(opts.emojis.length, list.length - opts.emojis.length)];

    let str = `${caption}\n`;
    for (let i = 0; i < list.length; i++)
        str += `${emojis[i]} ${opts.stringify(list[i])}\n`;

    const message = await channel.send(str);
    return { message, emojis };
}