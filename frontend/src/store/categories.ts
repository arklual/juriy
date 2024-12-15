import { create } from 'zustand';
import { categories } from '../services/api';
import type { CategorySchema } from '../types/api';

interface CategoriesState {
  items: CategorySchema[];
  followedCategories: CategorySchema[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchFollowedCategories: () => Promise<void>;
  followCategory: (categoryName: string) => Promise<void>;
  unfollowCategory: (categoryName: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  items: [],
  followedCategories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await categories.getAll();
      set({ items: data });
    } catch (error) {
      set({ error: 'Failed to fetch categories' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFollowedCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await categories.getFollowed();
      set({ followedCategories: data });
    } catch (error) {
      set({ error: 'Failed to fetch followed categories' });
    } finally {
      set({ isLoading: false });
    }
  },

  followCategory: async (categoryName) => {
    try {
      await categories.follow({ category_name: categoryName });
      const { data } = await categories.getFollowed();
      set({ followedCategories: data });
    } catch (error) {
      set({ error: 'Failed to follow category' });
    }
  },

  unfollowCategory: async (categoryName) => {
    try {
      await categories.unfollow({ category_name: categoryName });
      const currentFollowed = get().followedCategories;
      set({ 
        followedCategories: currentFollowed.filter(
          cat => cat.title !== categoryName
        ) 
      });
    } catch (error) {
      set({ error: 'Failed to unfollow category' });
    }
  },
}));