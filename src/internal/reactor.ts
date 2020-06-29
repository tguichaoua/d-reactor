// import { Message, User, EmojiResolvable, MessageReaction, ReactionCollector } from "discord.js";
// import PCancelable from "p-cancelable";

// interface ReactorOptionsFull {
//     /** If set, the promise is resolved after this amount of time (in milliseconds) after all reactions being set. */
//     duration?: number,
//     /** If set to true, the message is deleted just before the promise is resolved. (default is true) */
//     deleteMessage: boolean,
// }

// export type ReactorOptions = Partial<ReactorOptionsFull>;

// /** @internal */
// export interface OnReactionChangedParams {
//     readonly collector: ReactionCollector;
//     readonly reaction: MessageReaction;
//     readonly user: User;
// }

// /** @internal */
// const defaultOptions: Readonly<ReactorOptionsFull> = {
//     deleteMessage: true,
// }

// /** @internal
//  * @param onEnd - called when reaction collection end and promise not resolved.
//  * @param userFilter - Determine if a user is allow to react.
//  */
// export function reactor<T>(
//     message: Message,
//     emojis: readonly EmojiResolvable[],
//     onEnd?: (collector: ReactionCollector) => T,
//     onCollect?: (params: OnReactionChangedParams) => { value: T } | boolean | void,
//     onRemove?: (params: OnReactionChangedParams) => void,
//     userFilter?: UserFilter,
//     options?: ReactorOptions
// ) {
//     return new PCancelable<T>(
//         async (resolve, reject, onCancel) => {
//             onCancel.shouldReject = false;
//             let timer: NodeJS.Timer | undefined = undefined;

//             const opts = Object.assign({}, defaultOptions, options);
//             let stop = false;

//             const collector = message.createReactionCollector(
//                 (reaction: MessageReaction, _: User) => emojis.includes(reaction.emoji.name),
//                 {
//                     dispose: true,
//                 }
//             );

//             onCancel(() => collector.stop());

//             function doResolve(value: T) {
//                 stop = true;
//                 if (timer)
//                     message.client.clearTimeout(timer);
//                 collector.stop();

//                 if (opts.deleteMessage)
//                     resolve(message.delete().then(() => value, () => value));
//                 resolve(value);
//             }

//             async function doReject(reason: any) {
//                 stop = true;
//                 if (timer)
//                     message.client.clearTimeout(timer);
//                 collector.stop();

//                 reject(reason);
//             }

//             collector.on("collect", async (reaction, user) => {
//                 if (user.id === message.client.user?.id) return; // don't trigger userFilter nor onCollect if the user is the bot

//                 if (userFilter && !userFilter(user))
//                     await reaction.users.remove(user).catch(() => { });

//                 if (onCollect) {
//                     const action = onCollect({ collector, reaction, user });
//                     if (typeof action === "boolean" || !action) {
//                         // if action is false then remove the reaction.
//                         if (!(action ?? true)) await reaction.users.remove(user).catch(() => { });
//                     }
//                     else
//                         doResolve(action.value);
//                 }
//             });

//             if (onRemove) {
//                 collector.on("remove", (reaction, user) => {
//                     onRemove({ collector, reaction, user });
//                 });
//             }

//             collector.once("end", () => {
//                 if (!stop) {
//                     if (onEnd)
//                         doResolve(onEnd(collector));
//                     else
//                         doReject(new Error("Cannot resolve this promise."));
//                 }
//             });

//             for (const e of emojis) {
//                 await message.react(e).catch(() => { });
//                 if (stop) break;
//             }

//             if (!stop && opts.duration)
//                 timer = message.client.setTimeout(() => collector.stop(), opts.duration);
//         }
//     );
// }