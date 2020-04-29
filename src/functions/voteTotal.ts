import { TextBasedChannelFields, User, UserResolvable } from "discord.js";
import { reactorList, ReactorListOptions } from "../internal/reactorList";

/**
 * The returned promise is resolve when all user in users vote for the same element.
 * The resolved value is the element that all users choose.
 * The resolved value is null if it can't be determined (eg timeout, users or list is empty).
 * @param channel 
 * @param prompt 
 * @param users 
 * @param list 
 * @param options 
 */
export function voteTotal<T>(
    channel: TextBasedChannelFields,
    prompt: string,
    users: readonly UserResolvable[],
    list: readonly T[],
    options?: ReactorListOptions<T>
) {
    if (users.length === 0) return Promise.resolve(null);
    return reactorList<T>(
        channel,
        prompt,
        users,
        list,
        () => null,
        ({ reaction, resolve, index }) => {
            console.log(reaction);

            if ((reaction.count ?? 0) >= users.length)
                resolve(list[index]);
        },
        options
    )
}
