import { TextBasedChannelFields } from "discord.js";
import { ReactorListOptions } from "../internal/reactorList";
import { UserFilter } from "../internal/reactor";
import { reactorVote } from "../internal/reactorVote";


export function vote<T>(
    channel: TextBasedChannelFields,
    caption: string,
    list: readonly T[],
    duration: number,
    userFilter?: UserFilter,
    options?: ReactorListOptions<T>
) {
    options = Object.assign(options ?? {}, { duration });
    return reactorVote<T>(
        channel,
        caption,
        list,
        userFilter,
        options
    );
}