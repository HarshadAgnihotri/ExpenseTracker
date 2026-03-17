import { ExpenseForm } from '@/components/ExpenseForm';

export default function NewExpensePage() {
  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Add expense</h1>
      <ExpenseForm mode="create" />
    </div>
  );
}
