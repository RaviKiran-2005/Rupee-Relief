"use client";

import React, { useState, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Calculator, PlusCircle, Trash2, Wallet, Loader2, IndianRupee } from 'lucide-react';
import { formSchema, type FormValues, type AllocatedItem } from '@/lib/definitions';
import { calculateAllocation } from '@/app/actions';
import { useToast } from "@/hooks/use-toast"

export default function GroceryBudgetPlanner() {
    const [isPending, startTransition] = useTransition();
    const [results, setResults] = useState<{ allocatedItems: AllocatedItem[]; remainingBudget: number } | null>(null);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            budget: undefined,
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const onSubmit = (data: FormValues) => {
        setResults(null);
        startTransition(async () => {
            try {
                const result = await calculateAllocation(data);
                setResults(result);
            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: "Calculation Error",
                    description: error instanceof Error ? error.message : "An unknown error occurred.",
                })
            }
        });
    };

    return (
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8 w-full">
            <Card className="w-full lg:max-w-3xl rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                        <Wallet className="w-6 h-6" />
                        Budget & Items
                    </CardTitle>
                    <CardDescription>Enter your budget and the groceries you need.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="budget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg">Total Budget (₹)</FormLabel>
                                        <FormControl>
                                             <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 2500"
                                                    className="pl-10 text-base"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    value={field.value === undefined || Number.isNaN(field.value) ? '' : field.value}
                                                />
                                             </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Separator />
                            <div>
                                <h3 className="text-lg font-medium mb-4">Grocery List</h3>
                                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                                    {fields.map((item, index) => (
                                        <div key={item.id} className="grid grid-cols-12 gap-2 p-3 bg-background rounded-lg border">
                                            <div className="col-span-12 sm:col-span-6">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.name`}
                                                    render={({ field }) => <Input placeholder="Item Name" {...field} />}
                                                />
                                            </div>
                                            <div className="col-span-6 sm:col-span-3">
                                                 <FormField
                                                    control={form.control}
                                                    name={`items.${index}.price`}
                                                    render={({ field }) => <Input type="number" placeholder="Price" {...field} />}
                                                />
                                            </div>
                                            <div className="col-span-6 sm:col-span-3">
                                                 <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => <Input type="number" step="0.1" placeholder="Qty" {...field} />}
                                                />
                                            </div>
                                            <div className="col-span-10 sm:col-span-11">
                                                 <FormField
                                                    control={form.control}
                                                    name={`items.${index}.priority`}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Priority" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="High">High Priority</SelectItem>
                                                                <SelectItem value="Medium">Medium Priority</SelectItem>
                                                                <SelectItem value="Low">Low Priority</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => append({ name: '', price: 0, quantity: 1, priority: 'Medium' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                                <FormMessage>{form.formState.errors.items?.root?.message}</FormMessage>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full text-lg py-6" disabled={isPending}>
                                {isPending ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Calculator className="mr-2 h-5 w-5" />
                                )}
                                Calculate
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <div className="w-full lg:max-w-lg">
                {results && (
                     <Card className="lg:sticky lg:top-8 rounded-2xl shadow-lg animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
                        <CardHeader>
                             <CardTitle className="text-2xl font-headline">Allocation Results</CardTitle>
                             <CardDescription>Here's what you can buy within your budget.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-primary/10 p-4 rounded-lg mb-6 text-center">
                                <p className="text-lg text-primary-foreground/80">Remaining Budget</p>
                                <p className="text-4xl font-bold text-primary-foreground">₹{results.remainingBudget.toFixed(2)}</p>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.allocatedItems.map((item) => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.priority}</TableCell>
                                            <TableCell className="text-right">{item.finalQuantity} / {item.desiredQuantity}</TableCell>
                                            <TableCell className="text-right">₹{item.totalCost.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {results.allocatedItems.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                No items could be allocated with the current budget.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
