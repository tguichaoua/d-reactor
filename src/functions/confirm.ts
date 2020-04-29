import { Message, User, MessageReaction } from "discord.js";
import emoji from "../emoji";
import { ReactorOptions, reactor } from "../internal/reactor";

export async function confirm(message: Message, user: User, options?: ReactorOptions) {
    return reactor(
        message,
        [user],
        [emoji.CHECK_MARK, emoji.CROSS_MARK],
        () => false,
        ({reaction, resolve}) => resolve(reaction.emoji.name === emoji.CHECK_MARK),
        options
    );
}