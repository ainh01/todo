class WriteQueue {
  constructor(options = {}) {
    this.queue = [];
    this.processing = false;
    this.timeout = options.timeout || 30000; // ms
  }

  /**
   * Enqueue a job function. Returns a promise that resolves/rejects
   * when the job finishes or times out.
   * @param {() => Promise<void>} jobFn
   * @returns {Promise<void>}
   */
  enqueue(jobFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ jobFn, resolve, reject });
      this._processNext();
    });
  }

  /** @private */
  _processNext() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const { jobFn, resolve, reject } = this.queue.shift();

    let settled = false;

    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      this.processing = false;
      fn(value);
      Promise.resolve().then(() => this._processNext());
    };

    const timer = setTimeout(() => {
      settle(reject, new Error('Write queue job timed out'));
    }, this.timeout);

    Promise.resolve()
      .then(() => jobFn())
      .then((val) => settle(resolve, val))
      .catch((err) => settle(reject, err));
  }

  get pending() {
    return this.queue.length;
  }

  get busy() {
    return this.processing;
  }
}

module.exports = WriteQueue;
