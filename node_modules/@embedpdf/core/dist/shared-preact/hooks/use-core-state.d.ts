import { CoreState } from '../../lib/index.ts';
/**
 * Hook that provides access to the current core state.
 *
 * Note: This reads from the context which is already subscribed to core state changes
 * in the EmbedPDF component, so there's no additional subscription overhead.
 */
export declare function useCoreState(): CoreState | null;
