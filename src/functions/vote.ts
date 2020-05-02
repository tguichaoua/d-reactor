import { TextBasedChannelFields } from "discord.js";
import { ReactorListOptions } from "../internal/reactorList";
import { UserFilter } from "../internal/reactor";
import { reactorVote } from "../internal/reactorVote";

/**
 * The returned promise is resolved after the duration.
 * The resolved value is an VoteResult<T> (@see VoteResult).
 * @param channel - The channel where to post the vote message.
 * @param caption - Message caption
 * @param list - A list of element
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
    options?: ReactorListOptions<T>
) {
    options = Object.assign(options ?? {}, { duration });
    return reactorVote<T>(
        channel,
        caption,
        list,
        userFilter,
        options
    );
}