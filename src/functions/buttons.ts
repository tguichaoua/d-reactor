import { Message, EmojiResolvable, User } from "discord.js";
import { Reactor } from "../models/Reactor";

interface Button {
    emoji: EmojiResolvable;
    clicked: (user: User, reactor: Reactor<void>) => void;
}

export function buttons(
    message: Message | Promise<Message>,
    ...butons: Button[]
) {
    const emojis = butons.map(b => b.emoji);
    const reactor = new Reactor<void>(
        Promise.resolve(message),
        emojis,
        {},
        () => undefined,
        {},
        ({ reaction, user }) => {
            const i = emojis.indexOf(reaction.emoji.name);
            if (i !== -1) {
                butons[i].clicked(user, reactor);
                return false;
            }
        }
    );
    return reactor;
}