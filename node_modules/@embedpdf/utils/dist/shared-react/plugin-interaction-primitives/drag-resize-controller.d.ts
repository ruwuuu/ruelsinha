import { Position, Rect } from '@embedpdf/models';
export interface DragResizeConfig {
    element: Rect;
    /**
     * Optional world-space pivot to use for rotation interactions.
     * Defaults to the center of `element`.
     */
    rotationCenter?: Position;
    /**
     * Optional rect used for rotation-handle orbit layout (typically the visible AABB container).
     * Defaults to `element`.
     */
    rotationElement?: Rect;
    vertices?: Position[];
    constraints?: {
        minWidth?: number;
        minHeight?: number;
        maxWidth?: number;
        maxHeight?: number;
        boundingBox?: {
            width: number;
            height: number;
        };
    };
    maintainAspectRatio?: boolean;
    pageRotation?: number;
    /** Rotation of the annotation itself in degrees (used to project mouse deltas into local space for resize/vertex-edit) */
    annotationRotation?: number;
    scale?: number;
    rotationSnapAngles?: number[];
    rotationSnapThreshold?: number;
}
export type InteractionState = 'idle' | 'dragging' | 'resizing' | 'vertex-editing' | 'rotating';
export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w';
export interface TransformData {
    type: 'move' | 'resize' | 'vertex-edit' | 'rotate';
    changes: {
        rect?: Rect;
        vertices?: Position[];
        rotation?: number;
    };
    metadata?: {
        handle?: ResizeHandle;
        vertexIndex?: number;
        maintainAspectRatio?: boolean;
        /** The rotation angle in degrees */
        rotationAngle?: number;
        /** The center point used for rotation */
        rotationCenter?: Position;
        rotationDelta?: number;
        isSnapped?: boolean;
        snappedAngle?: number;
        /** Screen-space cursor position during the gesture */
        cursorPosition?: {
            clientX: number;
            clientY: number;
        };
    };
}
export interface InteractionEvent {
    state: 'start' | 'move' | 'end';
    transformData?: TransformData;
}
/**
 * Pure geometric controller that manages drag/resize/vertex-edit/rotate logic.
 */
export declare class DragResizeController {
    private config;
    private onUpdate;
    private state;
    private startPoint;
    private startElement;
    private startRotationElement;
    private gestureRotationCenter;
    private activeHandle;
    private currentPosition;
    private activeVertexIndex;
    private startVertices;
    private currentVertices;
    private rotationCenter;
    private centerScreen;
    private initialRotation;
    private lastComputedRotation;
    private rotationDelta;
    private rotationSnappedAngle;
    constructor(config: DragResizeConfig, onUpdate: (event: InteractionEvent) => void);
    updateConfig(config: Partial<DragResizeConfig>): void;
    startDrag(clientX: number, clientY: number): void;
    startResize(handle: ResizeHandle, clientX: number, clientY: number): void;
    startVertexEdit(vertexIndex: number, clientX: number, clientY: number): void;
    startRotation(clientX: number, clientY: number, initialRotation?: number, orbitRadiusPx?: number): void;
    move(clientX: number, clientY: number, buttons?: number, lockAspectRatio?: boolean): void;
    end(): void;
    cancel(): void;
    private reset;
    private calculateDelta;
    private transformDelta;
    /**
     * Calculate delta projected into the annotation's local (unrotated) coordinate space.
     * Used for resize and vertex-edit where mouse movement must be mapped to the
     * annotation's own axes, accounting for its rotation.
     */
    private calculateLocalDelta;
    private clampPoint;
    private calculateVertexPosition;
    private calculateDragPosition;
    /**
     * Calculate the angle from the center to a point in screen coordinates.
     */
    private calculateAngleFromMouse;
    private applyRotationSnapping;
}
