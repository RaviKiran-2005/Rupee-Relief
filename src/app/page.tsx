import GroceryBudgetPlanner from '@/components/grocery-budget-planner';
import { ShoppingBasket } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground flex items-center justify-center gap-3">
            <ShoppingBasket className="w-10 h-10 text-foreground transition-all duration-300 hover:text-ring hover:drop-shadow-[0_0_8px_hsl(var(--ring))]" />
            Rupee Relief
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Your Smart Grocery Budget Planner</p>
        </header>
        <GroceryBudgetPlanner />
      </div>
    </div>
  );
}
