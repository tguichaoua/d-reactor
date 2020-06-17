# discord-reactor
discord-reactor is a npm package that must be used with <a href="https://www.npmjs.com/package/discord.js">discord.js</a>. It provide functions to make reaction-based menu for your bot.

<a href="https://www.npmjs.com/package/d-reactor"><img src="https://img.shields.io/npm/v/d-reactor.svg?maxAge=3600" alt="NPM version" /></a>

## Installation
`npm i discord-reactor`

## Documentation
<a href="https://baanloh.github.io/d-reactor/v1/index.html">Docs</a>

## Example

```typescript
import Discord, { Message } from "discord.js";
import { confirm, vote, PCancelable } from "discord-reactor";

const client = new Discord.Client();

let lastPromise: PCancelable<any> | undefined;

client.on("ready", () => console.log("READY !"));

client.on("message", async msg => {
   if (msg.content.startsWith("!cancel")) {
      if (lastPromise) {
         lastPromise.cancel();
      }
   }
   if (msg.content.startsWith("!vote")) {
      await makeVote(msg);
   }
});

async function makeVote(message: Message) {
   if (! await confirm(message.channel, "Are you sure ?", u => u.id === message.author.id)) {
      await message.channel.send("Action cancelled !");
      return;
   }

   const p = vote(
      message.channel,
      "Which is your favourite ?",
      ["Cat", "Dog", "Mouse"],
      1000 * 15,
      undefined,
      {
         emojis: ["🐱", "🐶", "🐭"],
         votePerUser: 1,
      }
   );

   lastPromise = p;

   const bests = (await p).top.map(o => o.value);
   lastPromise = undefined;

   await message.channel.send(`Your favourite ${bests.length === 1 ? "is" : "are"} ${bests.join(", ")}`);
}

client.login(process.env.TOKEN);

```

