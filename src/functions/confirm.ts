import { Message, UserResolvable } from "discord.js";
import emoji from "../emoji";
import { ReactorOptions, reactor } from "../internal/reactor";

/**
 * The returned promised is resolve when user click on one of the added reaction.
 * The resolved value is true if the user click on the check mark reaction, false otherwise.
 * @param message - The message that received reactions.
 * @param user - The user who can confirm.
 * @param options 
 */
export async function confirm(message: Message, user: UserResolvable, options?: ReactorOptions) {
    return reactor(
        message,
        [user],
        [emoji.CHECK_MARK, emoji.CROSS_MARK],
        () => false,
        ({reaction, resolve}) => resolve(reaction.emoji.name === emoji.CHECK_MARK),
        options
    );
}