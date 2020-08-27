import EEI from "eei.ts";
import { EventEmitter } from "events";

export type Level = "debug" | "log" | "warn" | "error";

type LoggerEvents = Record<Level, [string]> & { "*": [string, Level] };

/** @internal */
const emitter = new EventEmitter() as EEI<LoggerEvents>;

/** @internal */
function print(level: Level, ...data: any[]) {
    const message = data.join(" ");
    emitter.emit(level, message);
    emitter.emit("*", message, level);
}

/** @internal */
export function debug(...data: any[]) {
    print("debug", ...data);
}

/** @internal */
export function log(...data: any[]) {
    print("log", ...data);
}

/** @internal */
export function warn(...data: any[]) {
    print("warn", ...data);
}

/** @internal */
export function error(...data: any[]) {
    print("error", ...data);
}

export const Logger = emitter as EEI<LoggerEvents, "_subscription">;
