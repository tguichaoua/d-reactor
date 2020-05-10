import PCancelable, { OnCancelFunction } from "p-cancelable";

/** @internal */
export function makeCancellable<T>(executor: (onCancel: OnCancelFunction) => T | PromiseLike<T>): PCancelable<T> {
    return new PCancelable<T>(
        async (resolve, reject, onCancel) => {
            try {
                resolve(await executor(onCancel));
            } catch (error) {
                reject(error);
            }
        }
    );
}