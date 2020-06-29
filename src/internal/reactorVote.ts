import { TextBasedChannelFields, User } from "discord.js";
import { reactorList, ListOptions } from "./reactorList";
import { VoteResult, VoteElement, makeVoteResult } from "../models/VoteResult";
import { Reactor, ReactorInternalOptions } from "../models/Reactor";
import { Predicate } from "../models/Predicate";

export type VoteOptions<T> = ListOptions<T> & {
    /** Determine the number maximal of vote a user can do.
     * Negative or null number are considered as `unlimited`.
     * Default is `unlimited`.
     */
    votePerUser?: number
};

/** @internal */
export function reactorVote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options: VoteOptions<T>,
    internalOptions: ReactorInternalOptions<VoteResult<T>>,
    userFilter: Predicate<User> | undefined,
): Reactor<VoteResult<T>>;

/** @internal */
export function reactorVote<T, R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options: VoteOptions<T>,
    internalOptions: ReactorInternalOptions<R, VoteResult<T>>,
    userFilter: Predicate<User> | undefined,
    onUpdate: (element: VoteElement<T>) => { value: R } | void,
): Reactor<R, VoteResult<T>>;

/** @internal */
export function reactorVote<T, R>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    options: VoteOptions<T>,
    internalOptions: ReactorInternalOptions<VoteResult<T> | R, VoteResult<T>>,
    userFilter: Predicate<User> | undefined,
    onUpdate?: (element: VoteElement<T>) => { value: R } | void,
) {
    const votes = new Array<User[]>(list.length);
    for (let i = 0; i < list.length; i++)
        votes[i] = new Array<User>();

    return reactorList<T, VoteResult<T> | R, VoteResult<T>>(
        channel,
        caption,
        list,
        options,
        () => makeVoteResult(list.map((value, index) => { return { value, users: votes[index] } })),
        internalOptions,
        ({ user, index }) => {
            if (options.votePerUser &&
                options.votePerUser > 0 &&
                votes.filter(users => users.includes(user)).length >= options.votePerUser
            )
                return false;

            const users = votes[index];
            if (!users.includes(user)) {
                users.push(user);
                if (onUpdate) return onUpdate({ value: list[index], users })
            }
        },
        ({ user, index }) => {
            const users = votes[index];
            const i = users.indexOf(user);
            if (i !== -1) users.splice(i, 1);
        },
        userFilter,
    );
}