import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password securely.
 */
export async function hashPassword(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Compare a plaintext password with a hashed password.
 */
export async function comparePassword(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
}
