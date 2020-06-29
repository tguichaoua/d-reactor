import { TextBasedChannelFields, User } from "discord.js";
import { ListOptions } from "../internal/reactorList";
import { reactorVote } from "../internal/reactorVote";

/**
 * Send a message with the caption and elements in the list.
 * Fulfilled when all user in `users` select the same element.
 * 
 * Resolved value:
 * - `fulfilled`: The selected element
 * - `cancelled`: A `VoteResult` that represent the current state of vote when it was cancelled.
 * 
 * @param channel - Channel where the message is posted.
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
        { ...options, ...{ votePerUser: 1 } },
        user => users.some(u => u.id === user.id),
        e => e.users.length === users.length ? { value: e.value } : undefined,
    );
}