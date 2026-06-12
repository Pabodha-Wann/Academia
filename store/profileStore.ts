import { createProfile, getProfile, updateProfile } from "@/database/queries/profile";
import { Profile } from "@/types";
import { create } from "zustand";

interface ProfileStore {
    profile: Profile | null;
    loadProfile: () => void;
    initProfile: (name: string, reg_number: string) => void;
    saveProfile: (
        name: string, reg_number: string, gpa: number, credits: number, avatar_uri?: string | null
    ) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
    profile: null,

    loadProfile: () => {
        const profile = getProfile();
        set({ profile })
    },

    initProfile: (name, reg_number) => {
        createProfile(name, reg_number)
        const profile = getProfile()
        set({ profile })
    },

    saveProfile: (name, reg_number, gpa, credits, avatar_uri = null) => {
        updateProfile(name, reg_number, gpa, credits, avatar_uri ?? null)
        const profile = getProfile();
        set({ profile })
    }


}))