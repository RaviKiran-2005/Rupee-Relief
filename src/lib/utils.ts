import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AllocatedItem } from "./definitions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function formatQuantity(quantity: number, unit: AllocatedItem['unit']): string {
    if (unit === 'Piece' || quantity % 1 === 0) {
        return `${quantity} ${unit}`;
    }

    const wholePart = Math.floor(quantity);
    const decimalPart = quantity - wholePart;

    if (decimalPart === 0) {
        return `${wholePart} ${unit}`;
    }

    const precision = 100;
    let numerator = Math.round(decimalPart * precision);
    let denominator = precision;

    const commonDivisor = gcd(numerator, denominator);
    numerator /= commonDivisor;
    denominator /= commonDivisor;
    
    const wholeStr = wholePart > 0 ? `${wholePart} ` : '';

    if (numerator === 0) {
        return `${wholePart} ${unit}`;
    }

    return `${wholeStr}${numerator}/${denominator} ${unit}`;
}
