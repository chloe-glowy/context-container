import { PluginReference, PluginSpec } from 'src';

export class PluginCollection {
  private plugins: Map<PluginReference<unknown>, unknown> = new Map();

  public constructor(plugins: ReadonlyArray<PluginSpec<unknown>>) {
    for (const plugin of plugins) {
      this.plugins.set(plugin.reference, plugin.implementation);
    }
  }

  public get<TPlugin>(ref: PluginReference<TPlugin>): TPlugin {
    const plugin = this.plugins.get(ref);
    if (plugin == null) {
      throw new Error('Plugin not set');
    }
    return plugin as TPlugin;
  }
}
