import { create } from 'zustand';
import { cards } from '../services/api';
import type { CardSchema, GetCardsParams } from '../services/api';

interface CardsState {
  items: CardSchema[];
  favorites: CardSchema[];
  isLoading: boolean;
  error: string | null;
  fetchCards: (params: GetCardsParams) => Promise<void>;
  fetchFavorites: (params: Pick<GetCardsParams, 'start' | 'count' | 'sort'>) => Promise<void>;
  searchCards: (params: GetCardsParams & { req: string }) => Promise<void>;
  addToFavorites: (cardId: number) => Promise<void>;
  removeFromFavorites: (cardId: number) => Promise<void>;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  items: [],
  favorites: [],
  isLoading: false,
  error: null,

  fetchCards: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await cards.getAll(params);
      set({ items: data });
    } catch (error) {
      set({ error: 'Failed to fetch cards' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFavorites: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await cards.getFavorites(params);
      set({ favorites: data });
    } catch (error) {
      set({ error: 'Failed to fetch favorites' });
    } finally {
      set({ isLoading: false });
    }
  },

  searchCards: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await cards.search(params);
      set({ items: data });
    } catch (error) {
      set({ error: 'Failed to search cards' });
    } finally {
      set({ isLoading: false });
    }
  },

  addToFavorites: async (cardId) => {
    try {
      await cards.addFavorite({ card_id: cardId });
      const currentFavorites = get().favorites;
      const cardToAdd = get().items.find(item => item.id === cardId);
      if (cardToAdd) {
        set({ favorites: [...currentFavorites, cardToAdd] });
      }
    } catch (error) {
      set({ error: 'Failed to add to favorites' });
    }
  },

  removeFromFavorites: async (cardId) => {
    try {
      await cards.deleteFavorite(cardId);
      const currentFavorites = get().favorites;
      set({ 
        favorites: currentFavorites.filter(item => item.id !== cardId) 
      });
    } catch (error) {
      set({ error: 'Failed to remove from favorites' });
    }
  },
}));