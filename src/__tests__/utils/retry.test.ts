import { retryAsync, findWithRetry } from '../../utils/retry'
import { describe, test, expect } from 'vitest'

describe('retryAsync', () => {
    test('succeeds before max attempts', async () => {
        let calls = 0
        const result = await retryAsync(async () => {
            calls++
            if (calls < 3) throw new Error('not yet')
            return 42
        }, { maxAttempts: 5, baseDelayMs: 1, factor: 1 })
        expect(result).toBe(42)
        expect(calls).toBe(3)
    })

    test('fails after max attempts', async () => {
        let calls = 0
        await expect(retryAsync(async () => {
            calls++
            throw new Error('always')
        }, { maxAttempts: 3, baseDelayMs: 1, factor: 1 })).rejects.toThrow('always')
        expect(calls).toBe(3)
    })
})

describe('findWithRetry', () => {
    test('returns truthy value within attempts', async () => {
        let n = 0
        const v = await findWithRetry(() => (++n >= 2 ? 'ok' : ''), { maxAttempts: 5, delayMs: 1 })
        expect(v).toBe('ok')
    })

    test('throws when condition never met', async () => {
        await expect(findWithRetry(() => null, { maxAttempts: 2, delayMs: 1 })).rejects.toThrow(
            'Max attempts reached'
        )
    })
})


