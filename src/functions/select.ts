import { TextBasedChannelFields, User } from "discord.js";
import { ListOptions, reactorList } from "../internal/reactorList";
import emojis from "../misc/emojis.json";

interface SelectOptionsFull {
    /** Define the minimum number of element that can be selected. 
     * Must be lower that `count`. 
     * If definied, add a ✅ button to submit the selection if the minimum quota is respected.
     */
    minimum: number;
}

export type SelectOptions<T> = ListOptions<T> & Partial<SelectOptionsFull>;

/**
 * Resolved when the user select as many item as `count`.
 * If `options.minimum` is defined, the promise is resolved if user has selected at least this number of item and click on ✅.
 * @param channel - Channel where the message is post.
 * @param caption - Message caption.
 * @param user - The user that can select.
 * @param list - A list of element.
 * @param count - The number of element that user must select to auto submit.
 * @param options 
 */
export function select<T>(
    channel: TextBasedChannelFields,
    caption: string,
    user: User,
    list: readonly T[],
    count: number,
    options?: SelectOptions<T>
) {
    if (count > list.length) throw new Error("count cannot be greater that list.length.");
    if (options?.minimum && options.minimum >= count) throw new Error("options.minimum must be lower than count.");

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
        options,
        options?.minimum ?
            [{
                emoji: emojis.checkMark,
                action() {
                    if (options?.minimum && selected.size >= options.minimum) {
                        return { value: Array.from(selected) };
                    }
                }
            }] :
            []
    );
}