import { Message, TextBasedChannelFields } from "discord.js";
import emoji from "../misc/emoji.json";
import { ReactorOptions, reactor, UserFilter } from "../internal/reactor";
import { reactorMessage } from "../internal/reactorMessage";

/**
 * The returned promised is resolve when user click on one of the added reaction.
 * The resolved value is true if the user click on ✅, false otherwise.
 * @param channel - Channel where the message is post.
 * @param caption - Message caption.
 * @param userFilter - Determines if a user is allow to react.
 * @param options 
 */
export function confirm(channel: TextBasedChannelFields, caption: string, userFilter?: UserFilter, options?: ReactorOptions) {
    return reactorMessage<boolean>(
        channel,
        caption,
        [emoji.checkMark, emoji.crossMark],
        () => false,
        ({ reaction }) => { return { value: reaction.emoji.name === emoji.checkMark } },
        undefined,
        userFilter,
        options
    );
}