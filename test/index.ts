import { Client, Message } from "discord.js";
import { Logger, voteCommittee } from "../src";
import env from "./env.json";

Logger.on("*", (m, l) => console.log(`[d-reactor] - ${l} - ${m}`));

const client = new Client();

client.on("ready", () => {
    console.log(`Logged as ${client.user?.username}`);
});

client.on("message", async (message) => {
    if (message.author.bot || message.system) return;

    if (message.content.startsWith(env.prefix)) {
        const args = message.content.substring(env.prefix.length).split(/\s+/g);
        const command = args.shift();
        if (!command) return;
        const handler = COMMANDS[command];
        if (handler) await handler(message, args);
    }
});

client.login(env.token).catch((e) => {
    throw e;
});

const COMMANDS: Record<
    string,
    (message: Message, args: string[]) => Promise<void> | void
> = {
    async vc(messge: Message) {
        const result = await voteCommittee(
            messge.channel,
            "Vote for your favourite pet !",
            ["cat", "dog", "mouse", "rabbit"],
            [messge.author],
            2,
            { emojis: ["🐱", "🐶", "🐁", "🐰"] }
        );

        if (result.status === "fulfilled") {
            await messge.channel.send(
                `The most favourited pets is/are ${result.value.top
                    .map((e) => e.value)
                    .join(", ")}`
            );
        }
    },
};
