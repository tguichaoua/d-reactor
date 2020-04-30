
export class ReactorStopToken {

    private _isStopped = false;
    private _callback?: () => void;

    constructor() { }

    get isStopped() { return this._isStopped; }

    /** @internal */
    set onStop(cb: () => void) {
        console.log("onCancel", this.isStopped);
        if (this.isStopped)
            cb();
        else
            this._callback = cb;
    }

    stop() {
        if (this.isStopped) return;
        this._isStopped = true;
        if (this._callback) this._callback();
        this._callback = undefined;
    }
}