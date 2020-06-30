import { User } from "discord.js";

export interface VoteElement<T> {
    /** An element of the list. */
    readonly value: T;
    /** Users that vote for this element. */
    readonly users: readonly User[];
}

export interface VoteResult<T> {
    /** An array that contains all element with user that vote for them ordered by vote count (most voted first). */
    readonly ordered: readonly VoteElement<T>[];
    /** An array of elements that received the most votes but are ex aequo. */
    readonly top: readonly VoteElement<T>[];
    /** An array of elements that received the less votes but are ex aequo. */
    readonly bottom: readonly VoteElement<T>[];
}

/** @internal */
export function makeVoteResult<T>(list: readonly VoteElement<T>[]): VoteResult<T> {
    const ordered = Array.from(list).sort((a, b) => b.users.length - a.users.length);
    const top: VoteElement<T>[] = [];
    const bottom: VoteElement<T>[] = [];

    {
        let voteCount = ordered[0].users.length;
        for (let i = 0; i < ordered.length; i++) {
            const e = ordered[i];
            if (e.users.length === voteCount) top.push(e);
            else break;
        }
    }
    {
        let voteCount = ordered[ordered.length - 1].users.length;
        for (let i = ordered.length - 1; i >= 0; i--) {
            const e = ordered[i];
            if (e.users.length === voteCount) bottom.push(e);
            else break;
        }
    }

    return { ordered, top, bottom };
}