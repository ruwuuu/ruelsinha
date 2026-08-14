export { Fragment, useEffect, useRef, useCallback, useState, useMemo } from 'react';
export type { ReactNode, HTMLAttributes, CSSProperties, FormEvent, MouseEvent } from 'react';
export declare const selectProps: (isMultiple: boolean, selectedValues: string[]) => {
    value: string | string[];
};
export declare const optionProps: (isMultiple: boolean, selectedValues: string[], optionValue: string) => {};
