import { Client } from "discord.js";
import env from "./env.json";
import { Logger } from "../src";

Logger.on("*", (m, l) => console.log(`[d-reactor] - ${l} - ${m}`));

const client = new Client();

client.on("ready", () => {
    console.log(`Logged as ${client.user?.username}`);
});

client.on("message", async (message) => {
    if (message.system || message.author.bot) return;
});

client.login(env.token).catch((e) => {
    throw e;
});
