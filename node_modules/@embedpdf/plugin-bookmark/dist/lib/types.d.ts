import { BasePluginConfig } from '@embedpdf/core';
import { Task, PdfBookmarkObject, PdfErrorReason } from '@embedpdf/models';
export interface BookmarkPluginConfig extends BasePluginConfig {
}
export interface BookmarkScope {
    getBookmarks(): Task<{
        bookmarks: PdfBookmarkObject[];
    }, PdfErrorReason>;
}
export interface BookmarkCapability {
    getBookmarks: () => Task<{
        bookmarks: PdfBookmarkObject[];
    }, PdfErrorReason>;
    forDocument(documentId: string): BookmarkScope;
}
