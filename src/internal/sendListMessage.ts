import { TextBasedChannelFields } from "discord.js";
import indexed_emojis from "../indexed-emojis";

/** @internal */
export async function sendListMessage<T>(
    channel: TextBasedChannelFields, caption: string, list: readonly T[],
    toString: (o: T) => string = o => `${o}`
) {
    if (list.length > 36)
        throw new Error("The number of elements in list cannot exceed 36.");

    let str = `${caption}\n`;
    for (let i = 0; i < list.length; i++)
        str += `${indexed_emojis[i]} ${toString(list[i])}\n`;

    return channel.send(str);
}