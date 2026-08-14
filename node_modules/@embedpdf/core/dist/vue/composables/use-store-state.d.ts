import { CoreState, StoreState } from '../../lib/index.ts';
/**
 * Reactive getter for the *entire* global store.
 * Re‑emits whenever any slice changes.
 *
 * @example
 * const state = useStoreState();              // Ref<StoreState<CoreState>>
 * console.log(state.value.core.scale);
 */
export declare function useStoreState<T = CoreState>(): import('vue').Ref<StoreState<T> | undefined, StoreState<T> | undefined>;
