import {
    Message,
    EmojiResolvable,
    ReactionCollector,
    MessageReaction,
    User,
} from "discord.js";
import { ResolvedReactor, PartialResolvedReactor } from "./ResolvedReactor";
import { Predicate } from "./Predicate";
import { ReactorOptions } from "./ReactorOptions";

/** @internal */
export interface OnReactionChangedParams {
    readonly collector: ReactionCollector;
    readonly reaction: MessageReaction;
    readonly user: User;
}

/** @internal */
export type OnEndCallback<C> =
    | ((collector: ReactionCollector) => C)
    | {
          onCancel: (collector: ReactionCollector) => C;
          onTimeout: (collector: ReactionCollector) => C;
      };

/** @internal */
export interface ReactorInternalOptions<R, C = R> {
    fulfilledOnTimeout?: C extends R ? boolean : never;
    onCollect?: (
        params: OnReactionChangedParams
    ) => { value: R } | { remove: boolean; promise?: Promise<void> } | void;
    onRemove?: (params: OnReactionChangedParams) => void;
    userFilter?: Predicate<User>;
}

export class Reactor<R, C = R> implements Promise<ResolvedReactor<R, C>> {
    private readonly _promise: Promise<ResolvedReactor<R, C>>;
    private _collector?: ReactionCollector = undefined;
    private _cancelled = false;
    private _fulfilled = false;

    public readonly value: Promise<R | C>;

    /** @internal */
    constructor(
        public readonly message: Promise<Message>,
        emojis: readonly EmojiResolvable[],
        options: ReactorOptions | undefined,
        onEnd: OnEndCallback<C>,
        internalOptions: ReactorInternalOptions<R, C>
    ) {
        const opts: ReactorOptions = {
            ...{ deleteMessage: false },
            ...options,
        };

        this._promise = message.then(
            (message) =>
                /* eslint-disable no-async-promise-executor */
                new Promise<ResolvedReactor<R, C>>(async (resolve, reject) => {
                    const collector = (this._collector = message.createReactionCollector(
                        (reaction: MessageReaction) =>
                            emojis.includes(reaction.emoji.name),
                        {
                            dispose: true,
                        }
                    ));

                    let timer: NodeJS.Timer | undefined = undefined;

                    const stopCollector = () => {
                        this._fulfilled = true;
                        if (timer) message.client.clearTimeout(timer);
                        collector.stop();
                    };

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const doReject = (reason: any) => {
                        stopCollector();
                        reject(reason);
                    };

                    const doResolve = (value: PartialResolvedReactor<R, C>) => {
                        stopCollector();
                        const result: ResolvedReactor<
                            R,
                            C
                        > = Object.assign(value, { message });
                        if (opts.deleteMessage)
                            resolve(
                                message.delete().then(
                                    () => result,
                                    () => result
                                )
                            );
                        else resolve(result);
                    };

                    try {
                        // Don't use resolve or reject directly
                        // use doResolve and doReject instead.

                        collector.on("collect", async (reaction, user) => {
                            // don't trigger userFilter nor onCollect if the user is the bot
                            if (user.id === message.client.user?.id) return;

                            if (
                                internalOptions.userFilter &&
                                !internalOptions.userFilter(user)
                            )
                                await reaction.users
                                    .remove(user)
                                    .catch(console.error);

                            if (internalOptions.onCollect) {
                                const action = internalOptions.onCollect({
                                    collector,
                                    reaction,
                                    user,
                                });
                                if (action) {
                                    if ("value" in action) {
                                        doResolve({
                                            status: "fulfilled",
                                            value: action.value,
                                        });
                                    } else {
                                        await Promise.all([
                                            action.promise?.catch(
                                                console.error
                                            ),
                                            action.remove
                                                ? reaction.users
                                                      .remove(user)
                                                      .catch(console.error)
                                                : undefined,
                                        ]);
                                    }
                                }
                            }
                        });

                        if (internalOptions.onRemove) {
                            collector.on("remove", (reaction, user) => {
                                (internalOptions.onRemove as NonNullable<
                                    typeof internalOptions["onRemove"]
                                >)({ collector, reaction, user });
                            });
                        }

                        collector.once("end", () => {
                            if (this._fulfilled) return;
                            if (typeof onEnd === "function")
                                doResolve({
                                    status: this._cancelled
                                        ? "cancelled"
                                        : internalOptions.fulfilledOnTimeout
                                        ? "fulfilled"
                                        : "timeout",
                                    value: onEnd(collector) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
                                });
                            else {
                                if (this._cancelled)
                                    doResolve({
                                        status: "cancelled",
                                        value: onEnd.onCancel(collector),
                                    });
                                else if (internalOptions.fulfilledOnTimeout)
                                    doResolve({
                                        status: "fulfilled",
                                        value: onEnd.onTimeout(
                                            collector
                                        ) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
                                    });
                                else
                                    doResolve({
                                        status: "cancelled",
                                        value: onEnd.onTimeout(collector),
                                    });
                            }
                        });

                        for (const e of emojis) {
                            await message.react(e).catch(console.error);
                            if (this._fulfilled) break;
                        }

                        if (
                            !this._fulfilled &&
                            !this._cancelled &&
                            opts.duration
                        )
                            timer = message.client.setTimeout(
                                () => collector.stop(),
                                opts.duration
                            );
                    } catch (e) {
                        doReject(e);
                    }
                })
            /* eslint-disable no-async-promise-executor */
        );

        this.value = this._promise.then((r) => r.value);
    }

    then<TResult1 = ResolvedReactor<R, C>, TResult2 = never>(
        onfulfilled?:
            | ((
                  value: ResolvedReactor<R, C>
              ) => TResult1 | PromiseLike<TResult1>)
            | null
            | undefined,
        onrejected?:
            | ((reason: any) => TResult2 | PromiseLike<TResult2>) // eslint-disable-line @typescript-eslint/no-explicit-any
            | null
            | undefined
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    catch<TResult = never>(
        onrejected?:
            | ((reason: any) => TResult | PromiseLike<TResult>) // eslint-disable-line @typescript-eslint/no-explicit-any
            | null
            | undefined
    ): Promise<ResolvedReactor<R, C> | TResult> {
        return this._promise.catch(onrejected);
    }

    [Symbol.toStringTag]: string;

    finally(
        onfinally?: (() => void) | null | undefined
    ): Promise<ResolvedReactor<R, C>> {
        return this._promise.finally(onfinally);
    }

    cancel(): void {
        if (this._fulfilled || this._cancelled) return;
        this._cancelled = true;
        this._collector?.stop();
    }
}
