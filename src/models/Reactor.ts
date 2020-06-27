import { ResolvedReactor } from "./ResolvedReactor";
import { resolve } from "path";
import { Message } from "discord.js";
import PCancelable from "p-cancelable";

export class Reactor<R, C = R> extends Promise<ResolvedReactor<R, C>> {

    /** @internal */
    constructor(
        private readonly _message: Promise<Message>,
        private readonly _promise: PCancelable<R | C>,    
    ) {
        super((resolve, reject) => {

        });
    }

    cancel(): void {
        throw new Error("Not implemented.");
    }

}