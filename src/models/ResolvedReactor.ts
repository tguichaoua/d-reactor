import { Message } from "discord.js";

export type ResolvedReactor<Resolved, Cancelled = Resolved> =
    {
        message: Message;
    } & (
        {
            wasCancelled: true;
            value: Cancelled;
        } | {
            wasCancelled: false;
            value: Resolved;
        }
    );