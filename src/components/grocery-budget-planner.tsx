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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formSchema, type FormValues, type AllocatedItem } from '@/lib/definitions';
import { calculateAllocation } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { cn, formatQuantity } from '@/lib/utils';

export default function GroceryBudgetPlanner() {
    const [isPending, startTransition] = useTransition();
    const [results, setResults] = useState<{ allocatedItems: AllocatedItem[]; remainingBudget: number } | null>(null);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            budget: undefined,
            items: [{ name: '', price: undefined, quantity: undefined, priority: 'Medium', unit: 'Kg' }],
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
        <div className={cn("w-full flex justify-center items-start gap-8 transition-all duration-500 ease-in-out",
            results ? 'items-start' : 'items-center'
        )}>
             <Card className={cn("w-full rounded-2xl shadow-lg transition-all duration-500 ease-in-out", 
                results ? 'lg:max-w-2xl' : 'lg:max-w-3xl'
             )}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                        <Wallet className="w-6 h-6" />
                        Budget & Items
                    </CardTitle>
                    <CardDescription>Enter your budget and the groceries you need.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                         <TooltipProvider>
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
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Input
                                                                type="number"
                                                                placeholder="Enter your total budget"
                                                                className="pl-10 text-base shadow-sm hover:shadow-md focus-visible:shadow-md"
                                                                {...field}
                                                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                                                                value={field.value === undefined || isNaN(field.value) ? '' : field.value}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>The maximum amount you want to spend on groceries.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
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
                                            <div key={item.id} className="grid grid-cols-12 gap-3 p-3 bg-background rounded-lg border">
                                                <div className="col-span-12 sm:col-span-3">
                                                    <FormField control={form.control} name={`items.${index}.name`} render={({ field }) => (
                                                         <FormControl>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Input placeholder="Item Name" {...field} className="shadow-sm hover:shadow-md focus-visible:shadow-md" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>The name of the grocery item you want to buy.</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </FormControl>
                                                    )} />
                                                </div>
                                                <div className="col-span-6 sm:col-span-2">
                                                     <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => ( 
                                                        <FormControl>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Input type="number" placeholder="Price / Unit" className="shadow-sm hover:shadow-md focus-visible:shadow-md" {...field} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} value={field.value === undefined || Number.isNaN(field.value) ? '' : field.value} />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Price for one standard unit (e.g., price per Kg, per L, or per Piece).</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </FormControl>
                                                      )} />
                                                </div>
                                                <div className="col-span-6 sm:col-span-2">
                                                     <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => ( 
                                                        <FormControl>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Input type="number" step="0.1" placeholder="Desired Qty" className="shadow-sm hover:shadow-md focus-visible:shadow-md" {...field} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} value={field.value === undefined || Number.isNaN(field.value) ? '' : field.value} />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>The quantity you want, like 2.5 for Kg/L or 5 for Pieces.</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </FormControl>
                                                     )} />
                                                </div>
                                                <div className="col-span-6 sm:col-span-2">
                                                    <FormField control={form.control} name={`items.${index}.unit`} render={({ field }) => (
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <SelectTrigger className="shadow-sm hover:shadow-md focus-visible:shadow-md"><SelectValue placeholder="Unit" /></SelectTrigger>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Select the measurement unit for this item.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <SelectContent>
                                                                    <SelectItem value="Kg">Kg</SelectItem>
                                                                    <SelectItem value="L">L</SelectItem>
                                                                    <SelectItem value="Piece">Piece</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                    )} />
                                                </div>
                                                <div className="col-span-6 sm:col-span-2">
                                                     <FormField control={form.control} name={`items.${index}.priority`} render={({ field }) => (
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <SelectTrigger className="shadow-sm hover:shadow-md focus-visible:shadow-md"><SelectValue placeholder="Priority" /></SelectTrigger>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>How important is this item? High priority items are purchased first.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <SelectContent>
                                                                    <SelectItem value="High">High</SelectItem>
                                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                                    <SelectItem value="Low">Low</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                     )} />
                                                </div>
                                                <div className="col-span-12 sm:col-span-1 flex items-center justify-end">
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" className="mt-4 w-full shadow-sm hover:shadow-md" onClick={() => append({ name: '', price: undefined, quantity: undefined, priority: 'Medium', unit: 'Kg' })}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                    </Button>
                                    <FormMessage>{form.formState.errors.items?.root?.message}</FormMessage>
                                </div>
                            </CardContent>
                        </TooltipProvider>
                        <CardFooter className="justify-center">
                            <Button
                                type="submit"
                                size="lg"
                                className="px-8 text-lg transition-transform duration-200 ease-out hover:scale-110 active:scale-95"
                                disabled={isPending}>
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

            {results && (
                <div className="w-full lg:max-w-lg">
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
                                        <TableHead className="text-right">Desired</TableHead>
                                        <TableHead className="text-right">Allocated</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.allocatedItems.map((item) => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.priority}</TableCell>
                                            <TableCell className="text-right">{item.desiredQuantity} {item.unit}</TableCell>
                                            <TableCell className="text-right">{formatQuantity(item.finalQuantity, item.unit)}</TableCell>
                                            <TableCell className="text-right">₹{item.totalCost.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {results.allocatedItems.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No items could be allocated with the current budget.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
