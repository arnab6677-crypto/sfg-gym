'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const price = parseFloat(formData.get('price') as string);

  await prisma.product.create({
    data: { name, category, price },
  });

  revalidatePath('/store');
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath('/store');
}

export async function recordSale(formData: FormData) {
  const productId = formData.get('productId') as string;
  const quantity = parseInt(formData.get('quantity') as string);

  // Fetch product to get name, category, and price
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const totalAmount = product.price * quantity;

  await prisma.storeSale.create({
    data: {
      productName: product.name,
      category: product.category,
      quantity,
      totalAmount,
    },
  });

  revalidatePath('/store');
}
