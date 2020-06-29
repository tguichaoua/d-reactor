import { TextBasedChannelFields, User } from "discord.js";
import { Reactor } from "../models/Reactor";
import { Predicate } from "../models/Predicate";
import { ReactorOptions } from "../models/options/ReactorOptions";
import emojis from "../misc/emojis.json";

/**
 * Send a message with the caption.
 * Fulfilled when a user click on ✅ or ❌.
 * 
 * Resolved value:
 * - `fulfilled`: `true` if user click on ✅, `false` if click on ❌
 * - `cancelled`: `false`
 * 
 * @param channel Channel where the message is posted.
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
        {},
        ({ reaction }) => { return { value: reaction.emoji.name === emojis.checkMark } },
        undefined,
        userFilter,
    );
}