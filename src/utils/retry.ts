/**
 * Generic retry helpers for API calls and DOM/test conditions.
 *
 * Design notes:
 * - Default min 5 attempts (Wave 4 decision: retry > static waits)
 * - Exponential backoff with optional jitter
 * - Optional AbortSignal support for cancellation
 * - TypeScript strict mode compatible
 */

export interface RetryAsyncOptions {
    /** Max attempts including the first try. Default 5. */
    maxAttempts?: number;
    /** Base delay in ms for attempt #1. Default 300ms. */
    baseDelayMs?: number;
    /** Exponential backoff factor. Default 1.8. */
    factor?: number;
    /** Add small random jitter to spread contention. Default true. */
    jitter?: boolean;
    /** Optional hook per attempt, useful for logging. */
    onAttempt?: (attempt: number, error?: unknown) => void;
    /** Optional abort signal to cancel retries. */
    abortSignal?: AbortSignal;
}

export async function retryAsync<T>(
    fn: () => Promise<T>,
    {
        maxAttempts = 5,
        baseDelayMs = 300,
        factor = 1.8,
        jitter = true,
        onAttempt,
        abortSignal,
    }: RetryAsyncOptions = {}
): Promise<T> {
    let attempt = 1;
    for (; ;) {
        if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError');
        try {
            onAttempt?.(attempt);
            return await fn();
        } catch (err) {
            onAttempt?.(attempt, err);
            if (attempt >= maxAttempts) throw err;
            const delay = Math.ceil(baseDelayMs * Math.pow(factor, attempt - 1));
            const wait = jitter ? delay + Math.floor(Math.random() * 100) : delay;
            await new Promise((r) => setTimeout(r, wait));
            attempt++;
        }
    }
}

/**
 * Retry a synchronous probe function (e.g., DOM query) until it returns a truthy value.
 * Throws after maxAttempts.
 */
export async function findWithRetry<T>(
    probe: () => T,
    { maxAttempts = 5, delayMs = 300 }: { maxAttempts?: number; delayMs?: number } = {}
): Promise<T> {
    let attempt = 1;
    for (; ;) {
        try {
            const res = probe();
            if (!res) throw new Error('Falsy result');
            return res;
        } catch {
            if (attempt >= maxAttempts) throw new Error('Max attempts reached');
            await new Promise((r) => setTimeout(r, delayMs * attempt));
            attempt++;
        }
    }
}


