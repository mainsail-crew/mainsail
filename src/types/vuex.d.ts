declare module 'vuex' {
    import type { App, InjectionKey, WatchOptions } from 'vue'
    import type {
        Store as VuexStore,
        StoreOptions as VuexStoreOptions,
        Dispatch as VuexDispatch,
        Commit as VuexCommit,
        ActionContext as VuexActionContext,
        SubscribeOptions as VuexSubscribeOptions,
        DispatchOptions as VuexDispatchOptions,
        CommitOptions as VuexCommitOptions,
        Payload as VuexPayload,
        MutationPayload as VuexMutationPayload,
        ActionPayload as VuexActionPayload,
        ActionSubscriber as VuexActionSubscriber,
        ActionErrorSubscriber as VuexActionErrorSubscriber,
        ActionSubscribersObject as VuexActionSubscribersObject,
        ActionHandler as VuexActionHandler,
        ActionObject as VuexActionObject,
        Getter as VuexGetter,
        Action as VuexAction,
        Mutation as VuexMutation,
        Plugin as VuexPlugin,
        Module as VuexModule,
        ModuleOptions as VuexModuleOptions,
        GetterTree as VuexGetterTree,
        ActionTree as VuexActionTree,
        MutationTree as VuexMutationTree,
        ModuleTree as VuexModuleTree,
        Store as VuexStoreClass,
    } from 'vuex/types/index'
    import {
        mapState,
        mapMutations,
        mapGetters,
        mapActions,
        createNamespacedHelpers,
        createLogger,
        storeKey,
        createStore as vuexCreateStore,
        useStore as vuexUseStore,
        Store as VuexStoreCtor,
    } from 'vuex/types/index'

    export type Store<S> = VuexStore<S>
    export type StoreOptions<S> = VuexStoreOptions<S>
    export type Dispatch = VuexDispatch
    export type Commit = VuexCommit
    export type ActionContext<S, R> = VuexActionContext<S, R>
    export type SubscribeOptions = VuexSubscribeOptions
    export type DispatchOptions = VuexDispatchOptions
    export type CommitOptions = VuexCommitOptions
    export type Payload = VuexPayload
    export type MutationPayload = VuexMutationPayload
    export type ActionPayload = VuexActionPayload
    export type ActionSubscriber<P, S> = VuexActionSubscriber<P, S>
    export type ActionErrorSubscriber<P, S> = VuexActionErrorSubscriber<P, S>
    export type ActionSubscribersObject<P, S> = VuexActionSubscribersObject<P, S>
    export type ActionHandler<S, R> = VuexActionHandler<S, R>
    export type ActionObject<S, R> = VuexActionObject<S, R>
    export type Getter<S, R> = VuexGetter<S, R>
    export type Action<S, R> = VuexAction<S, R>
    export type Mutation<S> = VuexMutation<S>
    export type Plugin<S> = VuexPlugin<S>
    export type Module<S, R> = VuexModule<S, R>
    export type ModuleOptions = VuexModuleOptions
    export type GetterTree<S, R> = VuexGetterTree<S, R>
    export type ActionTree<S, R> = VuexActionTree<S, R>
    export type MutationTree<S> = VuexMutationTree<S>
    export type ModuleTree<R> = VuexModuleTree<R>

    export { App, WatchOptions, InjectionKey }
    export { mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers, createLogger, storeKey }
    export const createStore: typeof vuexCreateStore
    export const useStore: typeof vuexUseStore
    export const Store: typeof VuexStoreCtor
    export default VuexStoreClass
}
