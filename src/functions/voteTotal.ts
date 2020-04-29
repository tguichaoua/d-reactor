import { TextBasedChannelFields, User, UserResolvable } from "discord.js";
import { reactorList, ReactorListOptions } from "../internal/reactorList";

/**
 * The returned promise is resolve when all user in users vote for the same element.
 * The resolved value is the element that all users choose.
 * The resolved value is null if it can't be determined (eg timeout, users or list is empty).
 * @param channel - The channel where to post the vote message.
 * @param caption - 
 * @param users 
 * @param list 
 * @param options 
 */
export function unanimousVote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    users: readonly UserResolvable[],
    list: readonly T[],
    options?: ReactorListOptions<T>
) {
    if (users.length === 0) return Promise.resolve(null);
    return reactorList<T>(
        channel,
        caption,
        users,
        list,
        () => null,
        ({ reaction, resolve, index, userIDs }) => {
            if (userIDs.every(id => reaction.users.cache.has(id)))
                resolve(list[index]);
        },
        options
    )
}
