import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export class AuthUtils {
  /**
   * Hash a plain text password
   */
  static async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  /**
   * Verify a plain text password against a hashed password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate hashed passwords for default users
   */
  static async generateDefaultPasswords(): Promise<{ medico: string; experto: string }> {
    const [medicoHash, expertoHash] = await Promise.all([
      this.hashPassword('1234'),
      this.hashPassword('1234')
    ]);
    
    return {
      medico: medicoHash,
      experto: expertoHash
    };
  }
}