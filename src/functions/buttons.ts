import { Message, EmojiResolvable, User } from "discord.js";
import { Reactor } from "../models/Reactor";

interface Button {
    emoji: EmojiResolvable;
    clicked: (user: User, reactor: Reactor<never, void>) => void | Promise<void>;
}

export function buttons(
    message: Message | Promise<Message>,
    ...butons: Button[]
) {
    const emojis = butons.map(b => b.emoji);
    const reactor: Reactor<never, void> = new Reactor<never, void>(
        Promise.resolve(message),
        emojis,
        {},
        () => undefined,
        {
            onCollect({ reaction, user }) {
                const i = emojis.indexOf(reaction.emoji.name);
                if (i !== -1)
                    return { remove: true, promise: Promise.resolve(butons[i].clicked(user, reactor)) };
            }
        }
    );
    return reactor;
}