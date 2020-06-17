import { TextBasedChannelFields, User } from "discord.js";
import { ListOptions, reactorList } from "../internal/reactorList";

interface SelectOptionsFull {
    /** Define the minimum number of element that can be selected. 
     * Must be lower that `count`. 
     * If definied, add a ✅ button to confirm the selection if the minimum quota is respected.
     */
    minimum: number;
}

export type SelectOptions<T> = ListOptions<T> & Partial<SelectOptionsFull>;

export function select<T>(
    channel: TextBasedChannelFields,
    caption: string,
    user: User,
    list: readonly T[],
    count: number,
    options?: SelectOptions<T>
) {
    const selected = new Set<T>();
    return reactorList<T, T[]>(
        channel,
        caption,
        list,
        () => Array.from(selected),
        ({ index }) => {
            selected.add(list[index]);
            if (selected.size >= count) return { value: Array.from(selected) };
        },
        ({ index }) => {
            selected.delete(list[index]);
        },
        u => u.id === user.id,
        options
    );
}