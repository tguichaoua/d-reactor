import { PartialTextBasedChannelFields, User } from "discord.js";
import { reactorVote, VoteOptions } from "../internal/reactorVote";

/**
 * Similar to `vote` but is fulfilled when all voters have voted.
 *
 * Resolved value:
 * - `fulfilled`: A `VoteResult` that represent the current state of vote when it was fulfilled.
 * - `cancelled`: A `VoteResult` that represent the current state of vote when it was cancelled.
 *
 * @param channel - Channel where the message is posted.
 * @param caption - Message caption.
 * @param list - A list of element.
 * @param voters - The list of users that are allowed to vote.
 * @param votePerUser - The number of vote each user can make (default is 1).
 * @param options
 */
export function voteCommittee<T>(
    channel: PartialTextBasedChannelFields,
    caption: string,
    list: readonly T[],
    voters: User[],
    votePerUser = 1,
    options?: Omit<VoteOptions<T>, "votePerUser">,
) {
    if (votePerUser < 1) throw new Error("votePerUser must be greater than 1.");
    if (voters.length === 0) throw new Error("users need at least one element.");

    return reactorVote<T>(
        channel,
        caption,
        list,
        { ...options, votePerUser },
        {
            userFilter: user => voters.some(u => user.id === u.id),
        },
        {
            onAdd(_, votes) {
                const total = votes.reduce((prev, cur) => (prev += cur.length), 0);

                return { submit: total >= voters.length * votePerUser };
            },
        },
    );
}
