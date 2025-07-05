"use server";

import { z } from 'zod';
import { formSchema, type GroceryItem, type AllocatedItem } from '@/lib/definitions';

type TempItem = GroceryItem & {
    allocatedQuantity: number;
    id: number;
};

export async function calculateAllocation(data: unknown) {
    const validation = formSchema.safeParse(data);
    if (!validation.success) {
        throw new Error("Invalid form data.");
    }
    const { budget, items } = validation.data;

    let remainingBudget = budget;
    const tempItems: TempItem[] = items.map((item, index) => ({
        ...item,
        allocatedQuantity: 0,
        id: index,
    }));

    const priorities: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low'];

    // This determines the smallest fraction of an item we can allocate.
    // A smaller value gives more precise allocation for divisible goods.
    const ALLOCATION_STEP = 0.05; // e.g., 50g or 50ml increments

    for (const priority of priorities) {
        const priorityItems = tempItems.filter(item => item.priority === priority);
        let changedInLoop = true;
        
        while (changedInLoop) {
            changedInLoop = false;
            for (const item of priorityItems) {
                const quantityRemaining = item.quantity - item.allocatedQuantity;

                if (quantityRemaining > 0) {
                    // Determine the quantity to attempt to add in this step.
                    // It's the smaller of our allocation step or the actual remaining desired quantity.
                    const quantityToAttempt = Math.min(ALLOCATION_STEP, quantityRemaining);
                    const costToAttempt = item.price * quantityToAttempt;
                    
                    if (remainingBudget >= costToAttempt) {
                        item.allocatedQuantity += quantityToAttempt;
                        remainingBudget -= costToAttempt;
                        changedInLoop = true;
                    }
                }
            }
        }
    }

    const allocatedItems: AllocatedItem[] = tempItems
        .filter(item => item.allocatedQuantity > 0)
        .map(item => ({
            name: item.name,
            price: item.price,
            desiredQuantity: item.quantity,
            priority: item.priority,
            finalQuantity: parseFloat(item.allocatedQuantity.toFixed(2)),
            totalCost: parseFloat((item.allocatedQuantity * item.price).toFixed(2)),
        }));

    return {
        allocatedItems,
        remainingBudget: parseFloat(remainingBudget.toFixed(2)),
    };
}
