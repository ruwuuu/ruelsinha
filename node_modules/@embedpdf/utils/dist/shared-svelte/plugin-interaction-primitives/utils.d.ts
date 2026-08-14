import { Position } from '@embedpdf/models';
import { ResizeHandle, DragResizeConfig } from './drag-resize-controller';
export type QuarterTurns = 0 | 1 | 2 | 3;
export interface ResizeUI {
    handleSize?: number;
    spacing?: number;
    offsetMode?: 'outside' | 'inside' | 'center';
    includeSides?: boolean;
    zIndex?: number;
    rotationAwareCursor?: boolean;
}
export interface VertexUI {
    vertexSize?: number;
    zIndex?: number;
}
export interface RotationUI {
    /** Handle size in px (default 32) */
    handleSize?: number;
    /** Screen-pixel gap between bounding box edge and handle center (default 30) */
    margin?: number;
    /** z-index of the rotation handle (default 5) */
    zIndex?: number;
    /** Whether to show the connector line from center to handle (default true) */
    showConnector?: boolean;
    /** Connector line width in px (default 1) */
    connectorWidth?: number;
}
/** Screen-pixel gap between the rect edge and the rotation handle center (default orbit margin). */
export declare const ROTATION_HANDLE_MARGIN = 35;
export interface HandleDescriptor {
    handle: ResizeHandle;
    style: Record<string, number | string>;
    attrs?: Record<string, any>;
}
export interface RotationHandleDescriptor {
    /** Style for the rotation handle itself */
    handleStyle: Record<string, number | string>;
    /** Style for the connector line (if shown) */
    connectorStyle: Record<string, number | string>;
    /** Orbit radius in screen pixels used to position the handle. */
    radius: number;
    /** Attributes for the handle element */
    attrs?: Record<string, any>;
}
export declare function describeResizeFromConfig(cfg: DragResizeConfig, ui?: ResizeUI): HandleDescriptor[];
export declare function describeVerticesFromConfig(cfg: DragResizeConfig, ui?: VertexUI, liveVertices?: Position[]): HandleDescriptor[];
/**
 * Describe the rotation handle position and style.
 * The rotation handle orbits around the center of the bounding box based on the current angle.
 *
 * @param cfg - The drag/resize config containing the element rect and scale
 * @param ui - UI customization options
 * @param currentAngle - The current rotation angle in degrees (0 = top, clockwise positive)
 */
export declare function describeRotationFromConfig(cfg: DragResizeConfig, ui?: RotationUI, currentAngle?: number): RotationHandleDescriptor;
