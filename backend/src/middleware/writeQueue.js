const WriteQueue = require('../services/WriteQueue');

const QUEUE_TIMEOUT = parseInt(process.env.WRITE_QUEUE_TIMEOUT, 10) || 30000;
const QUEUE_IDLE_TTL = parseInt(process.env.WRITE_QUEUE_IDLE_TTL, 10) || 300000; // 5 min
const LONG_TASK_PATH = '/api/longTasks';

const queues = new Map();

function getQueue(userId) {
  let entry = queues.get(userId);
  if (!entry) {
    entry = { queue: new WriteQueue({ timeout: QUEUE_TIMEOUT }), timer: null };
    queues.set(userId, entry);
  }
  clearTimeout(entry.timer);
  entry.timer = setTimeout(() => {
    if (!entry.queue.busy && entry.queue.pending === 0) {
      queues.delete(userId);
    }
  }, QUEUE_IDLE_TTL);
  return entry.queue;
}

const writeQueue = (req, res, next) => {
  // Long task generation can legitimately exceed the write queue timeout.
  if (req.path === LONG_TASK_PATH || req.originalUrl.startsWith(LONG_TASK_PATH)) {
    return next();
  }

  const userId = req.userId;
  if (!userId) return next();

  getQueue(userId)
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
