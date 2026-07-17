import prisma from '@/lib/prisma';
import ExpensesClient from './ExpensesClient';

export const metadata = {
  title: 'Expense Tracker | SFG Gym',
};

export default async function ExpensesPage() {
  const [expenses, settings] = await Promise.all([
    prisma.expense.findMany({ orderBy: { date: 'desc' } }),
    prisma.settings.findFirst()
  ]);

  const categories = settings?.expenseCategories?.split(',').map((c: string) => c.trim()).filter(Boolean) || [
    "Rent", "Utilities", "Salary", "Maintenance", "Equipment", "Supplies", "Marketing", "Drinks", "Other"
  ];

  return <ExpensesClient expenses={expenses} categories={categories} />;
}
