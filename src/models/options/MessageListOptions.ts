import { EmojiResolvable } from "discord.js";

export interface MessageListOptions<T> {
    /** This function is called for each element in the list to convert them into a string in the message. */
    stringify: (o: T) => string,
    /** This list of emojis is used to determine the emoji that represent each elements of the list.
     * If the emoji list is shorter than the list of element, default emojis are used.
     * Warning: no check is done on this list. Passing invalid values can lead to undetermined behaviour.
     */
    emojis: EmojiResolvable[];
};