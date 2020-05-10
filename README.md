# discord-reactor
discord-reactor is a npm package that must be used with <a href="https://www.npmjs.com/package/discord.js">discord.js</a>. It provide functions to make reaction-based menu for your bot.

## Installation
`npm i discord-reactor`

## Documentation
<a href="https://baanloh.github.io/d-reactor/v0/">Docs</a>

## Example

```typescript
import Discord, { Message } from "discord.js";
import { confirm, vote } from "discord-reactor";

const client = new Discord.Client();

client.on("ready", () => console.log("READY !"));

client.on("message", async msg => {
   if (msg.content.startsWith("!vote")) {
      await makeVote(msg);
   }
});

async function makeVote(message: Message) {
   if (! await confirm(message.channel, "Are you sure ?", u => u.id === message.author.id, { deleteMessage: true })) {
      await message.channel.send("Action cancelled !");
      return;
   }

   const result = await vote(
      message.channel,
      "Which is your favourite ?",
      ["Cat", "Dog", "Mouse"],
      1000 * 15,
      undefined,
      {
         deleteMessage: true,
         emojis: ["🐱", "🐶", "🐭"],
         votePerUser: 1,
      }
   );

   const bests = result.top.map(o => o.value);

   await message.channel.send(`Your favourite ${bests.length === 1 ? "is" : "are"} ${bests.join(", ")}`);
}

client.login(process.env.TOKEN);


```

