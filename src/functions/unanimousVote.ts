import { TextBasedChannelFields, User } from "discord.js";
import { reactorList, ReactorListOptions } from "../internal/reactorList";

/**
 * The returned promise is resolve when all user in users vote for the same element.
 * The resolved value is the element that all users choose.
 * The resolved value is null if it can't be determined (eg timeout, users or list is empty).
 * @param channel - The channel where to post the vote message.
 * @param caption - Message caption
 * @param users - A list of user that can vote
 * @param list - A list of element
 * @param options
 */
export function unanimousVote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    users: readonly User[],
    list: readonly T[],
    options?: ReactorListOptions<T>
) {
    if (users.length === 0) return Promise.resolve(null);
    return reactorList<T>(
        channel,
        caption,
        list,
        () => null,
        ({ reaction, resolve, index }) => {
            if (users.every(u => reaction.users.cache.has(u.id)))
                resolve(list[index]);
        },
        user => users.some(u => u.id === user.id),
        options
    )
}
