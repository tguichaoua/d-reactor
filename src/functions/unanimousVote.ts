import { PartialTextBasedChannelFields, User } from "discord.js";
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
    channel: PartialTextBasedChannelFields,
    caption: string,
    users: readonly User[],
    list: readonly T[],
    options?: ListOptions<T>
) {
    if (users.length === 0) throw new Error("users need at least one element.");

    return reactorVote(
        channel,
        caption,
        list,
        { ...options, ...{ votePerUser: undefined } },
        {
            userFilter: (user) => users.some((u) => u.id === user.id),
        },
        {
            onAdd(e) {
                if (e.users.length === users.length) return { value: e.value };
            },
        }
    );
}
