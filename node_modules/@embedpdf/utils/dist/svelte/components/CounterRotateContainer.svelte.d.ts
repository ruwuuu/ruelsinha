import { Snippet } from 'svelte';
import { Rect, Rotation } from '@embedpdf/models';
import { MenuWrapperProps } from './types';
interface CounterRotateProps {
    rect: Rect;
    rotation: Rotation;
}
interface CounterRotateChildrenProps {
    matrix: string;
    rect: Rect;
    menuWrapperProps: MenuWrapperProps;
}
interface Props extends CounterRotateProps {
    children?: Snippet<[CounterRotateChildrenProps]>;
}
declare const CounterRotateContainer: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {}, "">;
type CounterRotateContainer = ReturnType<typeof CounterRotateContainer>;
export default CounterRotateContainer;
