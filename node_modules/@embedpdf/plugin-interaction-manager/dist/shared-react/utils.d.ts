import { Position } from '@embedpdf/models';
import { InteractionManagerCapability, InteractionScope } from '../lib/index.ts';
export declare function createPointerProvider(cap: InteractionManagerCapability, scope: InteractionScope, element: HTMLElement, convertEventToPoint?: (evt: PointerEvent, host: HTMLElement) => Position): () => void;
