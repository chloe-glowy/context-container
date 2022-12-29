import { describe, expect, it } from '@jest/globals';
import { createPluginReference } from 'src';
import { assertConstructedByContextContainer } from 'src/private/ContextContainerFactoryImpl';

describe('Errors', () => {
  it('Fails if an incorrect token is passed', async () => {
    const token = 4;
    expect(() => assertConstructedByContextContainer(token)).toThrow();
  });

  it('Throws an error if you call PluginReference.typeSpec', () => {
    const pluginReference = createPluginReference<PluginType>();
    expect(() => pluginReference.typeSpec(PluginImplA)).toThrow();
  });
});

type PluginType = {
  double(n: number): number;
};

const PluginImplA: PluginType = {
  double: (n: number) => n * 2,
};
