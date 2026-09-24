"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

const buttonClass = "grid h-11 w-11 place-items-center text-default transition-colors duration-150 ease-out hover:bg-background disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function QuantityStepper({ value, onChange, min = 1, max = 10000 }: QuantityStepperProps) {
    return (
        <div className="inline-flex items-center rounded-sm border border-border">
            <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className={buttonClass}>
                <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-12 text-center font-mono text-sm" aria-live="polite">{value}</span>
            <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className={buttonClass}>
                <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}
