'use server';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function greet(prevState: string, formData: FormData) {
  console.log(`Hello, ${formData.get('name')}!`);

  await delay(1000);

  return prevState + formData.get('name');
}
