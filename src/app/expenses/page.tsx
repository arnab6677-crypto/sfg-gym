import prisma from '@/lib/prisma';
import ExpensesClient from './ExpensesClient';

export const metadata = {
  title: 'Expense Tracker | SFG Gym',
};

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' }
  });

  return <ExpensesClient expenses={expenses} />;
}
