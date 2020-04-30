
export class ReactorCancellationToken {

    private _isCanceled = false;
    private _callback?: () => void;

    constructor() { }

    get isCanceled() { return this._isCanceled; }

    /** @internal */
    set onCancel(cb: () => void) {
        console.log("onCancel", this.isCanceled);
        if (this.isCanceled)
            cb();
        else
            this._callback = cb;
    }

    cancel() {
        if (this.isCanceled) return;
        this._isCanceled = true;
        if (this._callback) this._callback();
        this._callback = undefined;
    }
}