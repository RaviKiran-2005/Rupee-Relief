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
        // For debugging: console.error(validation.error.errors);
        throw new Error("Invalid form data. Please check all fields.");
    }
    const { budget, items } = validation.data;

    let remainingBudget = budget;
    const tempItems: TempItem[] = items.map((item, index) => ({
        ...item,
        allocatedQuantity: 0,
        id: index,
    }));

    const priorities: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low'];

    const ALLOCATION_STEP_DIVISIBLE = 0.05; // For kg/l
    const ALLOCATION_STEP_INDIVISIBLE = 1;  // For pieces

    for (const priority of priorities) {
        const priorityItems = tempItems.filter(item => item.priority === priority);
        let changedInLoop = true;
        
        while (changedInLoop) {
            changedInLoop = false;
            for (const item of priorityItems) {
                const quantityRemaining = item.quantity - item.allocatedQuantity;

                if (quantityRemaining > 0) {
                    const isDivisible = item.unit === 'Kg' || item.unit === 'L';
                    const allocationStep = isDivisible ? ALLOCATION_STEP_DIVISIBLE : ALLOCATION_STEP_INDIVISIBLE;
                    const quantityToAttempt = Math.min(allocationStep, quantityRemaining);
                    
                    // For non-divisible items, we can't attempt a fraction.
                    if (!isDivisible && quantityToAttempt < 1) {
                        continue;
                    }

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
            unit: item.unit,
            finalQuantity: parseFloat(item.allocatedQuantity.toFixed(2)),
            totalCost: parseFloat((item.allocatedQuantity * item.price).toFixed(2)),
        }));

    return {
        allocatedItems,
        remainingBudget: parseFloat(remainingBudget.toFixed(2)),
    };
}
