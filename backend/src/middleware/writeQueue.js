const WriteQueue = require('../services/WriteQueue');

const QUEUE_TIMEOUT = parseInt(process.env.WRITE_QUEUE_TIMEOUT, 10) || 30000;
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const LONG_TASK_PATH = '/api/longTasks';

const queue = new WriteQueue({ timeout: QUEUE_TIMEOUT });
const writeQueue = (req, res, next) => {
  if (READ_METHODS.has(req.method)) {
    return next();
  }

  // Long task generation can legitimately exceed the global write queue timeout.
  if (req.path === LONG_TASK_PATH || req.originalUrl.startsWith(LONG_TASK_PATH)) {
    return next();
  }

  queue
    .enqueue(() => {
      return new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          resolve();
        };

        res.once('finish', finish);
        res.once('close', finish);

        next();
      });
    })
    .catch((err) => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: 'Request could not be processed in time. Please try again.',
        });
      }
    });
};

module.exports = writeQueue;
