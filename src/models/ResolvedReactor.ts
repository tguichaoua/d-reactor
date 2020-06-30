import { Message } from "discord.js";

export type PartialResolvedReactor<Resolved, Cancelled = Resolved> =
    {
        status: "fulfilled";
        value: Resolved;
    } | {
        status: "cancelled" | "timeout";
        value: Cancelled;
    }

export type ResolvedReactor<R, C = R> = PartialResolvedReactor<R, C> & { message: Message; } 