import { z } from 'zod';

export const groceryItemSchema = z.object({
  name: z.string().min(1, { message: "Item name is required." }),
  price: z.coerce.number().positive({ message: "Price must be positive." }),
  quantity: z.coerce.number().positive({ message: "Quantity must be positive." }),
  unit: z.enum(['kg', 'l', 'piece'], { required_error: "Unit is required." }),
  priority: z.enum(['High', 'Medium', 'Low'], { required_error: "Priority is required." }),
});

export const formSchema = z.object({
  budget: z.coerce.number().min(1, { message: "Budget must be at least ₹1." }),
  items: z.array(groceryItemSchema).min(1, { message: "Please add at least one item." }),
});

export type FormValues = z.infer<typeof formSchema>;
export type GroceryItem = z.infer<typeof groceryItemSchema>;

export interface AllocatedItem {
  name: string;
  price: number;
  desiredQuantity: number;
  priority: 'High' | 'Medium' | 'Low';
  unit: 'kg' | 'l' | 'piece';
  finalQuantity: number;
  totalCost: number;
}
