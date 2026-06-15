import { GpaEntry } from "@/types";
import { create } from "zustand";

interface GpaStore {
    entries: GpaEntry[];
    calculatedGpa: number;
    setGpaState: (entries: GpaEntry[], calculatedGpa: number) => void;
}

export const useGpaStore = create<GpaStore>((set) => ({
    entries: [],
    calculatedGpa: 0,

    setGpaState: (entries, calculatedGpa) => set({ entries, calculatedGpa }),
}));