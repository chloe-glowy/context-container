import { describe, expect, it } from '@jest/globals';
import { ContextContainerFactory, ContextualSingleton } from 'src';

describe('Singleton', () => {
  it('Creates a singleton', () => {
    class RequestStartTime extends ContextualSingleton {
      private timestamp_: Date | undefined;

      public get timestamp(): Date {
        if (this.timestamp_ == null) {
          throw new Error('Expected timestamp to be set');
        }
        return this.timestamp_;
      }

      public setRequestTime(timestamp: Date): void {
        if (this.timestamp_ != null) {
          throw new Error('Attempted to set request time twice');
        }
        this.timestamp_ = timestamp;
      }
    }

    const cc = ContextContainerFactory.create([]);
    const date = new Date('2021-01-01');
    cc.getSingleton(RequestStartTime).setRequestTime(date);

    expect(cc.getSingleton(RequestStartTime).timestamp).toBe(date);
  });

  it('Attaches different instances to different context containers', () => {
    class RequestStartTime extends ContextualSingleton {
      private timestamp_: Date | undefined;

      public get timestamp(): Date {
        if (this.timestamp_ == null) {
          throw new Error('Expected timestamp to be set');
        }
        return this.timestamp_;
      }

      public setRequestTime(timestamp: Date): void {
        if (this.timestamp_ != null) {
          throw new Error('Attempted to set request time twice');
        }
        this.timestamp_ = timestamp;
      }
    }

    const cc1 = ContextContainerFactory.create([]);
    const cc2 = ContextContainerFactory.create([]);

    const date1 = new Date('2021-01-01');
    const date2 = new Date('2021-01-02');

    cc1.getSingleton(RequestStartTime).setRequestTime(date1);
    cc2.getSingleton(RequestStartTime).setRequestTime(date2);

    expect(cc1.getSingleton(RequestStartTime).timestamp).toBe(date1);
    expect(cc2.getSingleton(RequestStartTime).timestamp).toBe(date2);
  });
});
