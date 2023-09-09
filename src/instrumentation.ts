import { dbFactory } from '@/faunadbConfig';

export async function register() {
  dbFactory();
}
