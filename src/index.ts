import {
  ContextContainerFactoryImpl,
  ProofOfBeingCalledByContextContainer,
} from 'src/private/ContextContainerFactoryImpl';

export interface IContextContainerFactory {
  create(
    plugins: ReadonlyArray<PluginSpec<unknown>>,
    timestamp?: Date,
  ): ContextContainer;
}

export const ContextContainerFactory: IContextContainerFactory =
  ContextContainerFactoryImpl;

export interface ContextContainer {
  /**
   * Pattern for using a plugin:
   *
   * // The definition of the plugin type and reference
   * type SerializeObjectPluginType = {serialize: (object: unknown) => string;};
   * const SerializeObjectPlugin = createPluginReference<SerializeObjectPluginType>();
   *
   * // The implementation of the plugin
   * const SerializeObjectPluginImpl: SerializeObjectPluginType = {
   *  serialize: (object: unknown) => JSON.stringify(object),
   * };
   *
   * // At the beginning of handling your web request, script, task executor, etc.:
   * const cc = ContextContainerFactory.create([
   *   {reference: SerializeObjectPlugin, implementation: SerializeObjectPluginImpl},
   * ]);
   * executeProgram(cc, args);
   *
   * // During the handling of your web request, script, etc., in some application-specific
   * // function that needs to know about SerializeObjectPlugin, but should not know about
   * // SerializeObjectPluginImpl:
   * function doSomething(cc: ContextContainer, data: unknown) {
   *   const serializedData = cc.getPlugin(SerializeObjectPlugin).serialize(data);
   * }
   */
  getPlugin<TPlugin>(ref: PluginReference<TPlugin>): TPlugin;

  /**
   * Pattern for using a singleton:
   *
   * // The definition of the singleton class
   * class AuthenticatedViewer extends ContextualSingleton {
   *   private viewer: Viewer | undefined;
   *   public set(viewer: Viewer) { this.viewer = viewer; }
   *   public get(): Viewer {
   *     const viewer = this.viewer;
   *     if (viewer == null) {
   *       throw new Error('Viewer not set');
   *     }
   *     return viewer;
   *   }
   * }
   *
   * // At the beginning of handling your web request, script, task executor, etc.:
   * const cc = ContextContainerFactory.create([...plugins]);
   * ...
   * const viewer = authenticateUser(...);
   * cc.getSingleton(AuthenticatedViewer).set(viewer);
   * executeProgram(cc, args);
   *
   * // During the handling of your job (web request, script, task executor, etc.),
   * // in some application-specific function that needs to get the
   * // authenticated viewer for this particular job:
   * function doSomething(cc: ContextContainer) {
   *   const viewer = cc.getSingleton(AuthenticatedViewer).get();
   *   ...
   * }
   */
  getSingleton<TSingleton extends ContextualSingleton>(
    singletonClass: SingletonClass<TSingleton>,
  ): TSingleton;

  /**
   * Memoization here is done in the context of a
   * particular job (web request, script, task executor, etc.). That means memoized
   * values are not shared between different jobs, and are discarded at the end of
   * the job. If your jobs are short-lived, this is usually a reasonable way of avoiding
   * having stale data in your memoization cache.
   *
   * This also means that if your job is done with the same user permissions for the
   * entire job, then you can memoize results that are subject to user permission checks.
   * E.g., if user A is logged in, and they attempt to access resource X, then you can memoize
   * the value that is returned to them, which includes both the resource X and the fact that
   * they are allowed to access it. However, if you do this, be careful about any resources
   * that may change while the job is running, particularly if the job may change the resource
   * or the permissions associated with it.
   *
   * As a more cautious alternative, you can memoize the fetched resource (perhaps as a
   * permission-less database proxy object), and then check the permissions on the resource
   * every time you access it. This is more expensive, but it is safer.
   *
   * Pattern for using memoization:
   * // At the beginning of handling your web request, script, task executor, etc.:
   * const cc = ContextContainerFactory.create([...plugins]);
   *
   * // Defining a memoized function:
   * class UserEmailPreferences {
   *  public static async load(
   *    cc: ContextContainer,
   *    userID: string,
   *  ): Promise<UserEmailPreferences> {
   *    const dbProxy = await cc.memoize(
   *      this,
   *      userID,
   *      async () => await cc.getPlugin(DatabasePlugin).loadUserEmailPreferences(userID),
   *    );
   *    if (!(await UserEmailPreferencesPrivacyImpl.canRead(cc, userID, dbProxy))) {
   *      throw new PermissionError();
   *    }
   *    return new UserEmailPreferences(cc, userID, dbProxy);
   *  }
   * }
   *
   * // During the handling of your job (web request, script, task executor, etc.),
   * // in some application-specific function:
   * async function doSomething(cc: ContextContainer, userID: string) {
   *   const userEmailPreferences = await UserEmailPreferences.load(cc, userID);
   *   ...
   * }
   */
  memoize<T>(scope: unknown, key: string, fn: () => T): T;

  /**
   * Timestamp is included here because it is common to use a single timestamp as the
   * canonical time that things occurred in a job (web request, script, task executor, etc.).
   *
   * For example, if you are processing a web request, you may want to use the timestamp
   * that the request started as the updatedTime when updating an object in persistent storage.
   * If updating multiple objects, you may want to use the same timestamp for all of them,
   * rather than the exact timestamp that the code happened to be running at when handling
   * that particular object.
   *
   * If you want to customize the timestamp, rather than using the time that the ContextContainer
   * was created, you can pass a timestamp as an argument to ContextContainerFactory.create().
   *
   * Timestamp could have been implemented as a Singleton. In fact, that's how it was originally
   * implemented. But because it's so common and so useful, it's worth having a dedicated API
   * for it. If you're considering attaching similar data to the ContextContainer, consider
   * using a Singleton instead. For example, this is how RequestStartTime was implemented:
   *
   * // Singleton definition
   * class RequestStartTime extends ContextualSingleton {
   *   private timestamp_: Date | undefined;
   *
   *   public get timestamp(): Date {
   *     if (this.timestamp_ == null) {
   *       throw new Error('Expected timestamp to be set');
   *     }
   *     return this.timestamp_;
   *   }
   *
   *   public setRequestTime(timestamp: Date): void {
   *     if (this.timestamp_ != null) {
   *       throw new Error('Attempted to set request time twice');
   *     }
   *     this.timestamp_ = timestamp;
   *   }
   * }
   *
   * // At the beginning of handling your web request, script, task executor, etc.:
   * const cc = ContextContainerFactory.create([...plugins]);
   * cc.getSingleton(RequestStartTime).setRequestTime(new Date());
   *
   * // During the handling of your job (web request, script, task executor, etc.),
   * // in some application-specific function that needs to get the
   * // request start time for this particular job:
   * function doSomething(cc: ContextContainer) {
   *   const requestStartTime = cc.getSingleton(RequestStartTime).timestamp;
   *   ...
   * }
   */
  get timestamp(): Date;
}

export type CC = ContextContainer;

/**
 * Do not implement this interface directly. Instead, use createPluginReference.
 */
export interface PluginReference<TPlugin> {
  typeSpec(pluginType: TPlugin): never;
}

export type PluginSpec<TPlugin> = Readonly<{
  reference: PluginReference<TPlugin>;
  implementation: TPlugin;
}>;

export function createPluginReference<T>(): PluginReference<T> {
  return {
    typeSpec(_pluginType: T): never {
      throw new Error('Do not call this function');
    },
  };
}

/**
 * A ContextualSingleton is a class that has at most one instance per ContextContainer.
 * The first time you call getSingleton on a ContextContainer, it will create an instance
 * of the class and store it in the ContextContainer. Subsequent calls to getSingleton
 * will return the same instance.
 *
 * Do not construct a subclass of this class directly. Instead, call cc.get(YourSingletonClass).
 *
 * Do not override the constructor of a ContextualSingleton. Instead, if you need to
 * initialize your singleton with some data, create an initialize method and
 * call it after calling cc.get(YourSingletonClass), like this:
 *
 * const singleton = cc.get(YourSingletonClass);
 * singleton.initialize(initializationParams);
 * ...
 * // Later, when you need to get data from the singleton:
 * const data = singleton.getData();
 *
 * getData() should throw an exception if initialize() has not been called.
 */
export class ContextualSingleton {
  public constructor(proof: ProofOfBeingCalledByContextContainer) {
    proof;
  }
}

export type SingletonClass<T extends ContextualSingleton> = new (
  token: ProofOfBeingCalledByContextContainer,
) => T;
