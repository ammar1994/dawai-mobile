import { create } from 'zustand';
import { SavedAddress } from '../types';
import { StorageKeys, StorageService } from '../services/storage.service';

interface AddressesState {
  addresses : SavedAddress[];
}

interface AddressesActions {
  loadAddresses  : ()                  => void;
  addAddress     : (a: Omit<SavedAddress, 'id'>) => void;
  removeAddress  : (id: string)        => void;
  updateAddress  : (id: string, data: Partial<SavedAddress>) => void;
}

export const useAddressesStore = create<AddressesState & AddressesActions>((set, get) => ({
  addresses: [],

  loadAddresses: () => {
    const saved = StorageService.getObject<SavedAddress[]>(StorageKeys.ADDRESSES);
    set({ addresses: saved ?? [] });
  },

  addAddress: (data) => {
    const id   = Date.now().toString();
    const next = [...get().addresses, { ...data, id }];
    StorageService.setObject(StorageKeys.ADDRESSES, next);
    set({ addresses: next });
  },

  removeAddress: (id) => {
    const next = get().addresses.filter(a => a.id !== id);
    StorageService.setObject(StorageKeys.ADDRESSES, next);
    set({ addresses: next });
  },

  updateAddress: (id, data) => {
    const next = get().addresses.map(a => a.id === id ? { ...a, ...data } : a);
    StorageService.setObject(StorageKeys.ADDRESSES, next);
    set({ addresses: next });
  },
}));
