import { User, Message } from "discord.js";
import { Reactor } from "../models/Reactor";
import { Predicate } from "../models/Predicate";
import { ReactorOptions } from "../models/ReactorOptions";
import emojis from "../misc/emojis.json";

/**
 * Send a message with the caption.
 * Fulfilled when a user click on ✅ or ❌.
 *
 * Resolved value:
 * - `fulfilled`: `true` if user click on ✅, `false` if click on ❌
 * - `cancelled`: `false`
 *
 * @param message Message to attach the reaction.
 * @param userFilter Determines if a user is allow to react.
 * @param options
 */
export function confirm(message: Message | Promise<Message>, userFilter?: Predicate<User>, options?: ReactorOptions) {
    return new Reactor<boolean, false>(
        Promise.resolve(message),
        [emojis.checkMark, emojis.crossMark],
        options,
        () => false,
        {
            onCollect({ reaction }) {
                return { value: reaction.emoji.name === emojis.checkMark };
            },
            userFilter,
        },
    );
}
