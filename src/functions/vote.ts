import { TextBasedChannelFields, User } from "discord.js";
import { reactorVote, VoteOptions } from "../internal/reactorVote";
import { Predicate } from "../models/Predicate";

/**
 * Send a message with the caption and elements in the list.
 * 
 * Resolved value:
 * - `fulfilled`: A `VoteResult` that represent the current state of vote when it was fulfilled.
 * - `cancelled`: A `VoteResult` that represent the current state of vote when it was cancelled.
 * 
 * @param channel - Channel where the message is posted.
 * @param caption - Message caption.
 * @param list - A list of element.
 * @param duration - Duration after which the reactor is fulfilled.
 * @param userFilter - Determines if a user is allow to react.
 * @param options 
 */
export function vote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    duration: number,
    userFilter?: Predicate<User>,
    options?: Omit<VoteOptions<T>, "duration">,
) {
    return reactorVote<T>(
        channel,
        caption,
        list,
        { ...options, ...{ duration } },
        { fulfilledOnTimeout: true },
        userFilter,
    );
}