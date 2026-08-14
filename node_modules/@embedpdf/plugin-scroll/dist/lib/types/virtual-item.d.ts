export interface PageLayout {
    pageNumber: number;
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotatedWidth: number;
    rotatedHeight: number;
    elevated: boolean;
}
export interface VirtualItem {
    id: string;
    x: number;
    y: number;
    offset: number;
    width: number;
    height: number;
    pageLayouts: PageLayout[];
    pageNumbers: number[];
    index: number;
}
