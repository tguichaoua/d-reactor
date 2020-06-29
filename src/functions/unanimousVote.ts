import { TextBasedChannelFields, User } from "discord.js";
import { ListOptions } from "../internal/reactorList";
import { reactorVote } from "../internal/reactorVote";

/**
 * The returned promise is resolve when all user in `users` vote for the same element.
 * The resolved value is the element that all users choose, or null if the promise is canceled.
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
    return reactorVote(
        channel,
        caption,
        list,
        { ...options, ...{ votePerUser: undefined } },
        user => users.some(u => u.id === user.id),
        e => e.users.length === users.length ? { value: e.value } : undefined,
    );
}