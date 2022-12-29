import { ContextContainerImpl } from 'src/private/ContextContainerImpl';
import { PluginCollection } from 'src/private/PluginCollection';
import { ContextContainer, PluginSpec } from 'src/public/ContextContainer';

const TOKEN = Math.random();

export function assertConstructedByContextContainer(token: number): void {
  if (token !== TOKEN) {
    throw new Error('Attempted to construct ContextModuleClass directly');
  }
}

export class ProofOfBeingCalledByContextContainer {
  // If we were to change the argument list from
  // `private token: number` to `token: number`, then the following code
  // would pass TypeScript's type checker:
  // class Foo extends ContextModule {}
  // new Foo(1);
  // Because I guess Number has the same constructor signature as this class.
  // But if we make it a private member variable, then the compiler realizes
  // that the constructor signature is different, and it complains.

  // The whole point of this class is to make it impossible to construct
  // a ContextModule directly.
  public constructor(private token: number) {
    assertConstructedByContextContainer(this.token);
  }
}

export const ContextContainerFactoryImpl = {
  create(
    plugins: ReadonlyArray<PluginSpec<unknown>>,
    timestamp?: Date,
  ): ContextContainer {
    return new ContextContainerImpl(
      new ProofOfBeingCalledByContextContainer(TOKEN),
      new PluginCollection(plugins),
      timestamp ?? new Date(),
    );
  },
};
