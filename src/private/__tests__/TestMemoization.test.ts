import { describe, expect, it } from '@jest/globals';
import { CC, ContextContainerFactory } from 'src/public/ContextContainer';

describe('Memoization', () => {
  it('Returns a value', () => {
    class Counter {
      public static returnArgument(cc: CC, key: string, arg: number): number {
        return cc.memoize(this, key, () => arg);
      }
    }

    const cc = ContextContainerFactory.create([]);
    expect(Counter.returnArgument(cc, 'key', 1)).toBe(1);
  });

  it('Returns the same value for the same key', () => {
    class Counter {
      public static returnArgument(cc: CC, key: string, arg: number): number {
        return cc.memoize(this, key, () => arg);
      }
    }

    const cc = ContextContainerFactory.create([]);
    expect(Counter.returnArgument(cc, 'key', 1)).toBe(1);
    expect(Counter.returnArgument(cc, 'key', 2)).toBe(1);
  });

  it('Returns different values for different keys', () => {
    class Counter {
      public static returnArgument(cc: CC, key: string, arg: number): number {
        return cc.memoize(this, key, () => arg);
      }
    }

    const cc = ContextContainerFactory.create([]);
    expect(Counter.returnArgument(cc, 'key1', 1)).toBe(1);
    expect(Counter.returnArgument(cc, 'key2', 2)).toBe(2);
  });

  it('Returns different values for different classes', () => {
    class Counter {
      public static returnArgument(cc: CC, key: string, arg: number): number {
        return cc.memoize(this, key, () => arg);
      }
    }

    class Counter2 {
      public static returnArgument(cc: CC, key: string, arg: number): number {
        return cc.memoize(this, key, () => arg);
      }
    }

    const cc = ContextContainerFactory.create([]);
    expect(Counter.returnArgument(cc, 'key', 1)).toBe(1);
    expect(Counter2.returnArgument(cc, 'key', 2)).toBe(2);
  });

  it('Returns different values for different context containers', () => {
    class Counter {
      public static returnArgument(cc: CC, key: string, arg: number): number {
        return cc.memoize(this, key, () => arg);
      }
    }

    const cc1 = ContextContainerFactory.create([]);
    const cc2 = ContextContainerFactory.create([]);

    expect(Counter.returnArgument(cc1, 'key', 1)).toBe(1);
    expect(Counter.returnArgument(cc2, 'key', 2)).toBe(2);
  });
});
