import { TextBasedChannelFields, User } from "discord.js";
import { reactorList, ListOptions } from "./reactorList";
import { VoteResult, VoteElement, makeVoteResult } from "../models/VoteResult";
import { Reactor, ReactorInternalOptions } from "../models/Reactor";

export type VoteOptions<T> = ListOptions<T> & {
    /** Determine the number maximal of vote a user can do.
     * Negative or null number are considered as `unlimited`.
     * Default is `unlimited`.
     */
    votePerUser?: number;
};

/** @internal */
export type ReactorVoteInternalOptions<R, C = R> = Omit<
    ReactorInternalOptions<R, C>,
    "onCollect" | "onRemove"
>;

/** @internal */
export type OnVoteUpdate<T, Return> = (
    element: VoteElement<T>,
    votes: ReadonlyArray<readonly User[]>
) => Return;

/** @internal */
export function reactorVote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options: VoteOptions<T>,
    internalOptions: ReactorVoteInternalOptions<VoteResult<T>>
): Reactor<VoteResult<T>>;

/** @internal */
export function reactorVote<T, R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options: VoteOptions<T>,
    internalOptions: ReactorVoteInternalOptions<R, VoteResult<T>>,
    callbacks: {
        onRemove?: OnVoteUpdate<T, void>;
        onAdd?: OnVoteUpdate<T, { value: R } | void>;
    }
): Reactor<R, VoteResult<T>>;

/** @internal */
export function reactorVote<T, R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options: VoteOptions<T>,
    internalOptions: ReactorVoteInternalOptions<
        VoteResult<T> | R,
        VoteResult<T>
    >,
    callbacks?: {
        onRemove?: OnVoteUpdate<T, void>;
        onAdd?: OnVoteUpdate<T, { value: R } | void>;
    }
) {
    const votes = new Array<User[]>(list.length);
    for (let i = 0; i < list.length; i++) votes[i] = new Array<User>();

    return reactorList<T, VoteResult<T> | R, VoteResult<T>>(
        channel,
        caption,
        list,
        options,
        () =>
            makeVoteResult(
                list.map((value, index) => {
                    return { value, users: votes[index] };
                })
            ),
        {
            ...internalOptions,
            ...{
                onCollect({ user, index }) {
                    if (
                        options.votePerUser &&
                        options.votePerUser > 0 &&
                        votes.filter((users) => users.includes(user)).length >=
                            options.votePerUser
                    )
                        return { remove: true };

                    const users = votes[index];
                    if (!users.includes(user)) {
                        users.push(user);
                        if (callbacks?.onAdd)
                            return callbacks.onAdd(
                                { value: list[index], users },
                                votes
                            );
                    }
                },
                onRemove({ user, index }) {
                    const users = votes[index];
                    const i = users.indexOf(user);
                    if (i !== -1) {
                        users.splice(i, 1);
                        if (callbacks?.onRemove)
                            callbacks.onRemove(
                                { value: list[index], users },
                                votes
                            );
                    }
                },
            },
        }
    );
}
