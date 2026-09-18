import { describe, it, expect } from 'vitest';
import { validators } from '../validators';

describe('validators', () => {
    describe('email', () => {
        it('should return valid for correct email', () => {
            const result = validators.email('test@example.com');
            expect(result.isValid).toBe(true);
        });

        it('should return invalid for incorrect email', () => {
            const result = validators.email('invalid-email');
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should return valid for empty email (optional)', () => {
            const result = validators.email('');
            expect(result.isValid).toBe(true);
        });
    });

    describe('phone', () => {
        it('should return valid for correct phone', () => {
            const result = validators.phone('(11) 99999-9999');
            expect(result.isValid).toBe(true);
        });

        it('should return valid for correct phone without formatting', () => {
            const result = validators.phone('11999999999');
            expect(result.isValid).toBe(true);
        });

        it('should return invalid for phone with few digits', () => {
            const result = validators.phone('119999');
            expect(result.isValid).toBe(false);
        });
    });

    describe('required', () => {
        it('should return valid for non-empty string', () => {
            const result = validators.required('Value');
            expect(result.isValid).toBe(true);
        });

        it('should return invalid for empty string', () => {
            const result = validators.required('');
            expect(result.isValid).toBe(false);
        });
    });
});
