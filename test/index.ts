import { Client, Message } from "discord.js";
import env from "./env.json";
import { Logger, voteCommittee } from "../src";

Logger.on("*", (m, l) => console.log(`[d-reactor] - ${l} - ${m}`));

const client = new Client();

client.on("ready", () => {
    console.log(`Logged as ${client.user?.username}`);
});

client.on("message", async (message) => {
    if (message.system || message.author.bot) return;

    if (message.content.startsWith("!voteCommittee"))
        await _voteCommittee(message);
});

client.login(env.token).catch((e) => {
    throw e;
});

async function _voteCommittee(messge: Message) {
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
}
