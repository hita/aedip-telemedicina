import bcrypt from 'bcrypt';
import crypto from 'crypto';

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
   * Generate anonymous nickname from user data
   */
  static generateAnonymousNickname(nombre: string, email: string): string {
    const data = `${nombre}-${email}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    const shortHash = hash.substring(0, 8);
    return `Anónimo ${shortHash}`;
  }

  /**
   * Generate unique case hash ID (4 characters: letters and numbers)
   */
  static generateCaseHashId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate hashed passwords for default users
   */
  static async generateDefaultPasswords(): Promise<{ medico: string; experto: string; medico2: string }> {
    const [medicoHash, expertoHash, medico2Hash] = await Promise.all([
      this.hashPassword('1234'),
      this.hashPassword('1234'),
      this.hashPassword('1234')
    ]);
    
    return {
      medico: medicoHash,
      experto: expertoHash,
      medico2: medico2Hash
    };
  }
}