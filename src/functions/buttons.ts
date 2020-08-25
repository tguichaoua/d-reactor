import { Message, EmojiResolvable, User } from "discord.js";
import { Reactor } from "../models/Reactor";

interface Button {
    /** The emoji of the reaction. */
    emoji: EmojiResolvable;
    /**
     * A handler that is executed when a user click on the reaction.
     * @param user the user that click on the reaction.
     * @param reactor the reactor that handle this button.
     */
    clicked: (
        user: User,
        reactor: Reactor<never, void>
    ) => void | Promise<void>;
}

/**
 * Add reactions to the message and execute the action when a user click on the reaction.
 *
 * Resolved value:
 * - `fulfilled`: never
 * - `cancelled`: void
 *
 * @param message Message to attach the reaction.
 * @param buttons A list of buttons.
 */
export function buttons(
    message: Message | Promise<Message>,
    ...buttons: Button[]
) {
    const emojis = buttons.map((b) => b.emoji);
    const reactor: Reactor<never, void> = new Reactor<never, void>(
        Promise.resolve(message),
        emojis,
        {},
        () => undefined,
        {
            onCollect({ reaction, user }) {
                const i = emojis.indexOf(reaction.emoji.name);
                if (i !== -1)
                    return {
                        remove: true,
                        promise: Promise.resolve(
                            buttons[i].clicked(user, reactor)
                        ),
                    };
            },
        }
    );
    return reactor;
}
