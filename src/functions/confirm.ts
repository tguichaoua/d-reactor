import { TextBasedChannelFields, User } from "discord.js";
import { Reactor } from "../models/Reactor";
import { Predicate } from "../models/Predicate";
import { ReactorOptions } from "../models/options/ReactorOptions";
import emojis from "../misc/emojis.json";

/**
 * The returned promised is resolve when user click on one of the added reaction.
 * The resolved value is true if the user click on ✅, false otherwise.
 * @param channel Channel where the message is post.
 * @param caption Message caption.
 * @param userFilter Determines if a user is allow to react.
 * @param options 
 */
export function confirm(
    channel: TextBasedChannelFields,
    caption: string,
    userFilter?: Predicate<User>,
    options?: ReactorOptions
) {
    return new Reactor<boolean, false>(
        channel.send(caption),
        [emojis.checkMark, emojis.crossMark],
        options,
        () => false,
        ({ reaction }) => { return { value: reaction.emoji.name === emojis.checkMark } },
        undefined,
        userFilter,
    );
}