import { TextBasedChannelFields, User } from "discord.js";
import { ReactorListOptions, reactorList } from "internal/reactorList";
import { UserFilter } from "internal/reactor";

interface VoteElement<T> {
    value: T;
    vote: number;
}

export interface VoteResult<T> {
    ordered: VoteElement<T>[];
    top: VoteElement<T>[];
}

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