import Bee from 'bee-queue';
import RegistrationMail from '../app/jobs/RegistrationMail';
import AnswerMail from '../app/jobs/AnswerMail';
import redisConfig from '../config/redis';

const jobs = [RegistrationMail, AnswerMail];

class Queue {
  constructor() {
    this.queue = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queue[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queue[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queue[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, error) {
    console.log(`Queue: ${job.queue.name}: FAILED`, error);
  }
}

export default new Queue();
