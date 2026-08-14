import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { BookmarkCapability, BookmarkPluginConfig } from './types';
export declare class BookmarkPlugin extends BasePlugin<BookmarkPluginConfig, BookmarkCapability> {
    static readonly id: "bookmark";
    constructor(id: string, registry: PluginRegistry);
    initialize(_: BookmarkPluginConfig): Promise<void>;
    protected buildCapability(): BookmarkCapability;
    private createBookmarkScope;
    private getBookmarks;
}
