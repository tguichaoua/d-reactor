import { TextBasedChannelFields, User } from "discord.js";
import { reactorList, ListOptions } from "../internal/reactorList";

/**
 * The returned promise is resolve when all user in `users` vote for the same element.
 * The resolved value is the element that all users choose.
 * @param channel - Channel where the message is post.
 * @param caption - Message caption.
 * @param users - A list of user that can vote.
 * @param list - A list of element.
 * @param options
 */
export function unanimousVote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    users: readonly User[],
    list: readonly T[],
    options?: ListOptions<T>
) {
    if (users.length === 0) return Promise.resolve(null);
    return reactorList<T, T>(
        channel,
        caption,
        list,
        undefined,
        ({ reaction, index }) => {
            if (users.every(u => reaction.users.cache.has(u.id)))
                return { value: list[index] };
        },
        undefined,
        user => users.some(u => u.id === user.id),
        options
    )
}
