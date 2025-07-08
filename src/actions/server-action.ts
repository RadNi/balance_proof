'use server';

export async function serverAction() {
  console.log('this happens on the server');
  return { success: true };
}
