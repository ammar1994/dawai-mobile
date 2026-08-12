import { create } from 'zustand';
import { Pharmacy } from '../types';
import { StorageKeys, StorageService } from '../services/storage.service';

interface FavoritesState {
  favorites : Pharmacy[];
}

interface FavoritesActions {
  loadFavorites   : ()               => void;
  addFavorite     : (p: Pharmacy)    => void;
  removeFavorite  : (id: string)     => void;
  isFavorite      : (id: string)     => boolean;
  toggleFavorite  : (p: Pharmacy)    => void;
}

export const useFavoritesStore = create<FavoritesState & FavoritesActions>((set, get) => ({
  favorites: [],

  loadFavorites: () => {
    const saved = StorageService.getObject<Pharmacy[]>(StorageKeys.FAVORITES);
    set({ favorites: saved ?? [] });
  },

  addFavorite: (pharmacy) => {
    const next = [...get().favorites.filter(f => f.id !== pharmacy.id), pharmacy];
    StorageService.setObject(StorageKeys.FAVORITES, next);
    set({ favorites: next });
  },

  removeFavorite: (id) => {
    const next = get().favorites.filter(f => f.id !== id);
    StorageService.setObject(StorageKeys.FAVORITES, next);
    set({ favorites: next });
  },

  isFavorite: (id) => get().favorites.some(f => f.id === id),

  toggleFavorite: (pharmacy) => {
    if (get().isFavorite(pharmacy.id)) {
      get().removeFavorite(pharmacy.id);
    } else {
      get().addFavorite(pharmacy);
    }
  },
}));
