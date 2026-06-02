/**
 * Utility for mapping between CUID and numeric IDs
 * Used for API schema compatibility when database uses string CUIDs
 */

export class IdMapper {
    /**
     * Convert a CUID string to a positive numeric ID
     * Uses a simple hash function that's deterministic
     */
    static cuidToNumericId(cuid: string): number {
        let hash = 0;
        for (let i = 0; i < cuid.length; i++) {
            const char = cuid.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Convert to positive integer
        return Math.abs(hash);
    }
}
