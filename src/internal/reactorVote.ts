import { TextBasedChannelFields, User } from "discord.js";
import { reactorList, ListOptions } from "./reactorList";
import { UserFilter } from "./reactor";

interface VoteElement<T> {
    /** An element of the list. */
    value: T;
    /** Users that vote for this element. */
    users: User[];
}

export interface VoteResult<T> {
    /** An array that contains all element with user that vote for them ordered by vote count (most voted first). */
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
    let opts = Object.assign({}, defaultOptions, options);

    const votes = new Array<User[]>(list.length);
    for (let i = 0; i < list.length; i++)
        votes[i] = new Array<User>();

    return reactorList<T, VoteResult<T>>(
        channel,
        caption,
        list,
        () => {
            const ordered = list
                .map((value, index) => { return { value, users: votes[index] } })
                .sort((a, b) => b.users.length - a.users.length);
            let topVoteCount = ordered[0].users.length;
            const top: VoteElement<T>[] = [];
            for (const e of ordered)
                if (e.users.length === topVoteCount)
                    top.push(e);
                else
                    break;

            return { ordered, top };
        },
        ({ user, index }) => {
            let canVote = true;
            if (opts.votePerUser && opts.votePerUser > 0)
                canVote = votes.filter(users => users.includes(user)).length < opts.votePerUser;
            const users = votes[index];
            if (canVote && !users.includes(user))
                users.push(user);
            return canVote;
        },
        ({ user, index }) => {
            const users = votes[index];
            const i = users.indexOf(user);
            if (i !== -1)
                users.splice(i, 1);
        },
        userFilter,
        options
    );
}