import { PluginPackage } from '@embedpdf/core';
import { BookmarkPluginConfig } from './types';
import { BookmarkPlugin } from './bookmark-plugin';
export declare const BookmarkPluginPackage: PluginPackage<BookmarkPlugin, BookmarkPluginConfig>;
export * from './bookmark-plugin';
export * from './types';
export * from './manifest';
