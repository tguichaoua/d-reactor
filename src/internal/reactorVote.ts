import { TextBasedChannelFields } from "discord.js";
import { reactorList, ListOptions } from "./reactorList";
import { UserFilter } from "./reactor";

interface VoteElement<T> {
    /** An element of the list. */
    value: T;
    /** The number of vote that the element received. */
    vote: number;
}

export interface VoteResult<T> {
    /** An array that contains all element with their number of vote ordered by vote count (most voted first). */
    ordered: VoteElement<T>[];
    /** An array of elements that received the most of vote. */
    top: VoteElement<T>[];
}

interface VoteOptionsFull {
    /** Determine the number maximal of vote a user can do.
     * Negative or null number are considered as `unlimited`.
     * Default is `unlimited`.
     */
    votePerUser?: number
}

export type VoteOptions<T> = ListOptions<T> & Partial<VoteOptionsFull>;

/** @internal */
const defaultOptions: VoteOptionsFull = {
}

/** @internal */
export function reactorVote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    userFilter?: UserFilter,
    options?: VoteOptions<T>
) {
    options = Object.assign(options ?? {}, defaultOptions);
    return reactorList<T, VoteResult<T>>(
        channel,
        caption,
        list,
        (_, votes) => {
            const ordered = list
                .map((value, index) => { return { value, vote: votes[index] } })
                .sort((a, b) => b.vote - a.vote);
            let vote = ordered[0].vote;
            const top: VoteElement<T>[] = [];
            for (const e of ordered)
                if (e.vote === vote)
                    top.push(e);
                else
                    break;

            return { ordered, top };
        },
        ({ user, collector }) => {
            if (options?.votePerUser && options.votePerUser > 0)
                return collector.collected.filter(r => r.users.cache.has(user.id)).size <= options.votePerUser;
        },
        userFilter,
        options
    );
}