import prisma from '@/lib/prisma';
import ExpensesClient from './ExpensesClient';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata = {
  title: 'Expense Tracker | SFG Gym',
};

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' }
  });

  return (
    <LayoutWrapper>
      <ExpensesClient expenses={expenses} />
    </LayoutWrapper>
  );
}
