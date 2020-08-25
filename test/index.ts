import { Client } from "discord.js";
import env from "./env.json";

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
