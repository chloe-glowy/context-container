import { describe, expect, it } from '@jest/globals';
import { ContextContainerFactory, createPluginReference } from 'src';

describe('Plugins', () => {
  it('Gets the plugin that was set', () => {
    const pluginReference = createPluginReference<PluginType>();
    const cc = ContextContainerFactory.create([
      {
        implementation: PluginImplA,
        reference: pluginReference,
      },
    ]);
    expect(cc.getPlugin(pluginReference)).toBe(PluginImplA);
  });

  it('Fails to get plugin if not set', () => {
    const pluginReference = createPluginReference<PluginType>();
    const cc = ContextContainerFactory.create([]);
    expect(() => cc.getPlugin(pluginReference)).toThrow();
  });

  it('Can store different plugins for different context containers', () => {
    const pluginReference = createPluginReference<PluginType>();
    const ccA = ContextContainerFactory.create([
      {
        implementation: PluginImplA,
        reference: pluginReference,
      },
    ]);
    const ccB = ContextContainerFactory.create([
      {
        implementation: PluginImplB,
        reference: pluginReference,
      },
    ]);
    expect(ccA.getPlugin(pluginReference)).toBe(PluginImplA);
    expect(ccB.getPlugin(pluginReference)).toBe(PluginImplB);
  });
});

type PluginType = {
  double(n: number): number;
};

const PluginImplA: PluginType = {
  double: (n: number) => n * 2,
};

const PluginImplB: PluginType = {
  double: (n: number) => n + n,
};
