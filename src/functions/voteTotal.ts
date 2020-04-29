import { TextBasedChannelFields, User, UserResolvable } from "discord.js";
import { reactorList, ReactorListOptions } from "../internal/reactorList";

/**
 * 
 * @param channel 
 * @param prompt 
 * @param users 
 * @param list 
 * @param options 
 */
export function voteTotal<T>(
    channel: TextBasedChannelFields,
    prompt: string,
    users: UserResolvable[],
    list: readonly T[],
    options?: ReactorListOptions
) {
    if (users.length === 0) return Promise.resolve(null);
    return reactorList<T>(
        channel,
        prompt,
        users,
        list,
        () => null,
        ({ reaction, resolve, index }) => {
            if ((reaction.count ?? 0) >= users.length)
                resolve(list[index]);
        },
        options
    )
}
