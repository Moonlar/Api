import bcrypt from 'bcrypt';

const saltRounds = process.env.SALT_ROUNDS || 10;
const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*()_'.split(
    ''
  );

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function hash(password: string): string {
  return bcrypt.hashSync(password, saltRounds);
}

export function compare(hashPassword: string, password: string): boolean {
  return bcrypt.compareSync(password, hashPassword);
}

export function random(length: number = 12): string {
  return Array.from({ length })
    .map(() => CHARS[randomNumber(0, CHARS.length)])
    .join('');
}

export default { hash, compare, random };
