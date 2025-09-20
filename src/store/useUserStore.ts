import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; // ✅ Import persist middleware

// Define the shape of the user data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Define the shape of the store
interface UserStore {
  user: User | null; // User can be null initially
  isLoggedIn: boolean; // Track if the user is logged in
  setUser: (user: User) => void; // Method to set user data
  fetchUser: () => Promise<void>; // Method to fetch user data
  logout: () => void; // Method to logout (clear user data)
}

// Create the store using Zustand and persist middleware
export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      user: null, // Initially, user is null (no logged in user)
      isLoggedIn: false, // User is not logged in initially

      // Method to set the user data
      setUser: (user) => set({ user, isLoggedIn: true }),

      // Fetch user data from an API
      fetchUser: async () => {
        try {
          const response = await fetch("/api/frontend/check-auth", {
            method: "POST",
          });

          if (!response.ok) {
            console.log("Failed to fetch user data");
            return;
          }

          const userData = await response.json();
          set({ user: userData.data, isLoggedIn: true }); // Store the fetched user data and set logged in
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      },

      // Logout: reset the user state and remove from localStorage
      logout: () => {
        set({ user: null, isLoggedIn: false }); // Reset Zustand state (clear user data)
        localStorage.removeItem("user-store"); // Remove persisted user data from localStorage
      },
    }),
    {
      name: "user-store", // The key to store the data in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    }
  )
);
