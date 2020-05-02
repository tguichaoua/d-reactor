import { TextBasedChannelFields } from "discord.js";
import { ReactorListOptions, reactorList } from "./reactorList";
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

/** @internal */
export function reactorVote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    userFilter?: UserFilter,
    options?: ReactorListOptions<T>
) {
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
        undefined,
        userFilter,
        options
    );
}