import { Component } from 'svelte';
import { BaseComponentProps } from '../types';
/**
 * Component Registry
 *
 * Stores custom components that can be referenced in the UI schema.
 */
export interface ComponentRegistry {
    register(id: string, component: Component<BaseComponentProps>): void;
    unregister(id: string): void;
    get(id: string): Component<BaseComponentProps> | undefined;
    has(id: string): boolean;
    getRegisteredIds(): string[];
}
export declare function createComponentRegistry(initialComponents?: Record<string, Component<BaseComponentProps>>): ComponentRegistry;
export declare function provideComponentRegistry(initialComponents?: Record<string, Component<BaseComponentProps>>): ComponentRegistry;
export declare function useComponentRegistry(): ComponentRegistry;
