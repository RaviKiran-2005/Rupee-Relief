import GroceryBudgetPlanner from '@/components/grocery-budget-planner';

export default function Home() {
  return (
    <main className="min-h-screen w-full p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
      <header className="text-center my-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
          Rupee Relief
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Your Smart Grocery Budget Planner</p>
      </header>
      <div className="w-full flex justify-center">
        <GroceryBudgetPlanner />
      </div>
    </main>
  );
}
