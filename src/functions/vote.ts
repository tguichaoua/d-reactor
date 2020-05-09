import { TextBasedChannelFields } from "discord.js";
import { UserFilter } from "../internal/reactor";
import { reactorVote, VoteOptions } from "../internal/reactorVote";

/**
 * Create a reaction-based vote.
 * The returned promise is resolved after the duration.
 * @param channel - Channel where the message is post.
 * @param caption - Message caption.
 * @param list - A list of element.
 * @param duration - Duration after which the promise is resolved. (This value override options.duration).
 * @param userFilter - Determines if a user is allow to react.
 * @param options 
 */
export function vote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    duration: number,
    userFilter?: UserFilter,
    options?: VoteOptions<T>
) {
    options = Object.assign({}, { duration }, options);
    return reactorVote<T>(
        channel,
        caption,
        list,
        userFilter,
        options
    );
}