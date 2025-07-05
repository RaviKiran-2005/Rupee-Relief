"use server";

import { z } from 'zod';
import { formSchema, type GroceryItem, type AllocatedItem } from '@/lib/definitions';

type TempItem = GroceryItem & {
    allocatedQuantity: number;
    id: number;
};

const getStep = (quantity: number): number => {
    // If quantity has decimals, it's likely divisible (like kg/l).
    // Using 0.25 for divisible items as per prompt.
    // Otherwise, it's a whole unit.
    return quantity.toString().includes('.') ? 0.25 : 1;
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

    for (const priority of priorities) {
        const priorityItems = tempItems.filter(item => item.priority === priority);
        let changedInLoop = true;
        
        while (changedInLoop) {
            changedInLoop = false;
            for (const item of priorityItems) {
                const step = getStep(item.quantity);
                const costOfStep = item.price * step;
                
                if (item.allocatedQuantity < item.quantity && remainingBudget >= costOfStep) {
                    item.allocatedQuantity += step;
                    // Ensure we don't overallocate due to floating point inaccuracies
                    item.allocatedQuantity = Math.min(item.allocatedQuantity, item.quantity);
                    remainingBudget -= costOfStep;
                    changedInLoop = true;
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
