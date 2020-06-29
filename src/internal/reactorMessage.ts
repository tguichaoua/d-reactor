// import PCancelable from "p-cancelable";
// import { TextBasedChannelFields, EmojiResolvable, ReactionCollector } from "discord.js";
// import { OnReactionChangedParams, UserFilter, ReactorOptions, reactor } from "./reactor";
// import { makeCancellable } from "../misc/makeCancellable";


// /** Send message on the channel then use it for reactor.
//  * @internal
//  */
// export function reactorMessage<T>(
//     channel: TextBasedChannelFields,
//     caption: string,
//     emojis: readonly EmojiResolvable[],
//     onEnd?: (collector: ReactionCollector) => T,
//     onCollect?: (params: OnReactionChangedParams) => { value: T } | boolean | void,
//     onRemove?: (params: OnReactionChangedParams) => void,
//     userFilter?: UserFilter,
//     options?: ReactorOptions
// ) {
//     return makeCancellable<T>(
//         async onCancel => {
//             onCancel.shouldReject = false;

//             const message = await channel.send(caption);

//             const promise = reactor<T>(
//                 message,
//                 emojis,
//                 onEnd,
//                 onCollect,
//                 onRemove,
//                 userFilter,
//                 options
//             );
            
//             onCancel(() => promise.cancel());
//             return promise;
//         }
//     );
// }