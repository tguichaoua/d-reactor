import { Message } from "discord.js";
import emoji from "../misc/emoji.json";
import { ReactorOptions, reactor, UserFilter } from "../internal/reactor";

/**
 * The returned promised is resolve when user click on one of the added reaction.
 * The resolved value is true if the user click on ✅, false otherwise.
 * @param message - The message that received reactions.
 * @param userFilter - Determines if a user is allow to react.
 * @param options 
 */
export async function confirm(message: Message, userFilter?: UserFilter, options?: ReactorOptions) {
    return reactor(
        message,
        [emoji.checkMark, emoji.crossMark],
        () => false,
        ({ reaction }) => { return { value: reaction.emoji.name === emoji.checkMark } },
        undefined,
        userFilter,
        options
    );
}