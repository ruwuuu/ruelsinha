import { ComponentType, ReactNode } from '../../preact/adapter.ts';
import { BaseComponentProps } from '../types';
/**
 * Component Registry
 *
 * Stores custom components that can be referenced in the UI schema.
 */
export interface ComponentRegistry {
    register(id: string, component: ComponentType<BaseComponentProps>): void;
    unregister(id: string): void;
    get(id: string): ComponentType<BaseComponentProps> | undefined;
    has(id: string): boolean;
    getRegisteredIds(): string[];
}
export interface ComponentRegistryProviderProps {
    children: ReactNode;
    initialComponents?: Record<string, ComponentType<BaseComponentProps>>;
}
export declare function ComponentRegistryProvider({ children, initialComponents, }: ComponentRegistryProviderProps): import("preact").JSX.Element;
export declare function useComponentRegistry(): ComponentRegistry;
