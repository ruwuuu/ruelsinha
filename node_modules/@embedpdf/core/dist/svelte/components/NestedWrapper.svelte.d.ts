import { Component, Snippet } from 'svelte';
import { default as NestedWrapper } from './NestedWrapper.svelte';
interface Props {
    wrappers: Component[];
    utilities?: Component[];
    children?: Snippet;
}
declare const NestedWrapper: Component<Props, {}, "">;
type NestedWrapper = ReturnType<typeof NestedWrapper>;
export default NestedWrapper;
