import { Message, EmojiResolvable, ReactionCollector, MessageReaction, User } from "discord.js";
import { ResolvedReactor } from "./ResolvedReactor";
import { Predicate } from "./Predicate";
import { ReactorOptions } from "./options/ReactorOptions";

/** @internal */
interface OnReactionChangedParams {
    readonly collector: ReactionCollector;
    readonly reaction: MessageReaction;
    readonly user: User;
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
        onCancel: (collector: ReactionCollector) => C,
        onEnd?: (collector: ReactionCollector) => R,
        onCollect?: (params: OnReactionChangedParams) => { value: R } | boolean | void,
        onRemove?: (params: OnReactionChangedParams) => void,
        userFilter?: Predicate<User>,
        options?: ReactorOptions
    ) {
        const opts: ReactorOptions =
        {
            ...{ deleteMessage: false },
            ...options
        };

        this._promise = message.then(
            message => new Promise<ResolvedReactor<R, C>>(
                async (resolve, reject) => {
                    const collector = message.createReactionCollector(
                        (reaction: MessageReaction, _: User) => emojis.includes(reaction.emoji.name),
                        {
                            dispose: true,
                        }
                    );
                    this._collector = collector;
                    let timer: NodeJS.Timer | undefined = undefined;

                    const stopCollector = () => {
                        this._fulfilled = true;
                        if (timer) message.client.clearTimeout(timer);
                        collector.stop();
                    }

                    const doResolve = (value: { wasCancelled: true, value: C } | { wasCancelled: false, value: R }) => {
                        stopCollector();
                        const result: ResolvedReactor<R, C> = Object.assign(value, { message });
                        if (opts.deleteMessage) resolve(message.delete().then(() => result, () => result));
                        else resolve(result);
                    }

                    function doReject(reason: any) {
                        stopCollector();
                        reject(reason);
                    }

                    collector.on("collect", async (reaction, user) => {
                        // don't trigger userFilter nor onCollect if the user is the bot
                        if (user.id === message.client.user?.id) return;

                        if (userFilter && !userFilter(user))
                            await reaction.users.remove(user).catch(() => { });

                        if (onCollect) {
                            const action = onCollect({ collector, reaction, user });
                            if (typeof action === "boolean" || !action) {
                                if (action === false) await reaction.users.remove(user).catch(() => { });
                            }
                            else
                                doResolve({ value: action.value, wasCancelled: false });
                        }
                    });

                    if (onRemove) {
                        collector.on("remove", (reaction, user) => {
                            onRemove({ collector, reaction, user });
                        });
                    }

                    collector.once("end", () => {
                        if (this._fulfilled) return;
                        if (this._cancelled) doResolve({ wasCancelled: true, value: onCancel(collector) });
                        else if (onEnd) doResolve({ wasCancelled: false, value: onEnd(collector) });
                        else doReject(new Error("Cannot resolve this reactor."));
                    });

                    for (const e of emojis) {
                        await message.react(e).catch(() => { });
                        if (this._fulfilled) break;
                    }

                    if (!this._fulfilled && !this._cancelled && opts.duration)
                        timer = message.client.setTimeout(() => collector.stop(), opts.duration);
                }
            )
        );

        this.value = this._promise.then(r => r.value);
    }

    then<TResult1 = ResolvedReactor<R, C>, TResult2 = never>(
        onfulfilled?: ((value: ResolvedReactor<R, C>) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined
    ): Promise<ResolvedReactor<R, C> | TResult> {
        return this._promise.catch(onrejected);
    }

    [Symbol.toStringTag]: string;

    finally(onfinally?: (() => void) | null | undefined): Promise<ResolvedReactor<R, C>> {
        return this._promise.finally(onfinally);
    }

    cancel(): void {
        if (this._fulfilled || this._cancelled) return;
        this._cancelled = true;
        this._collector?.stop();
    }
}