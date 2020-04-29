import { Message, User, MessageReaction } from "discord.js";
import emoji from "./emoji";

interface ConfirmOptions {
    time?: number,
    deleteMessage: boolean,
}

const defaultOptions: ConfirmOptions = {
    deleteMessage: false,
}

export async function confirm(message: Message, user: User, options?: Partial<ConfirmOptions>) {
    const opts = Object.assign({}, defaultOptions, options);
    let stop = false;

    const emojis = [
        emoji.CHECK_MARK,
        emoji.CROSS_MARK,
    ];

    const collector = message.createReactionCollector(
        (r: MessageReaction, u: User) => u.id === user.id && emojis.includes(r.emoji.name),
        {
            time: opts.time
        }
    )

    const promise = new Promise<boolean>((resolve, reject) => {
        collector.once("collect", (r, u) => {
            resolve(r.emoji.name === emoji.CHECK_MARK);
        });
        collector.once("end", () => {
            resolve(false);
        });
    }).then(value => {
        stop = true;
        if (opts.deleteMessage)
            return message.delete().then(() => value, () => value);
        return value;
    });

    for (const e of emojis) {
        if (stop) return promise;
        await message.react(e).catch(() => { });
    }

    return promise;
}