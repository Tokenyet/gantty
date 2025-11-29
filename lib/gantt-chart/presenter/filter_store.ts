import { create } from 'zustand';
import { Event } from '../usecase/types';
import { FilterEventsUsecase } from '../usecase/filter_events_usecase';

interface FilterStoreState {
  // State
  searchKeyword: string;
  visibleGroupIds: Set<string>;
  filteredEvents: Event[];

  // Actions
  setSearchKeyword: (keyword: string) => void;
  toggleGroupVisibility: (groupId: string) => void;
  setAllGroupsVisibility: (visible: boolean, groupIds: string[]) => void;
  applyFilters: (allEvents: Event[]) => void;
}

const filterUsecase = new FilterEventsUsecase();

export const useFilterStore = create<FilterStoreState>((set, get) => ({
  // Initial state
  searchKeyword: '',
  visibleGroupIds: new Set<string>(),
  filteredEvents: [],

  // Actions
  setSearchKeyword: (keyword: string) => {
    set({ searchKeyword: keyword });
  },

  toggleGroupVisibility: (groupId: string) => {
    set((state) => {
      const newVisibleGroupIds = new Set(state.visibleGroupIds);
      if (newVisibleGroupIds.has(groupId)) {
        newVisibleGroupIds.delete(groupId);
      } else {
        newVisibleGroupIds.add(groupId);
      }
      return { visibleGroupIds: newVisibleGroupIds };
    });
  },

  setAllGroupsVisibility: (visible: boolean, groupIds: string[]) => {
    if (visible) {
      set({ visibleGroupIds: new Set(groupIds) });
    } else {
      set({ visibleGroupIds: new Set() });
    }
  },

  applyFilters: (allEvents: Event[]) => {
    const { searchKeyword, visibleGroupIds } = get();
    
    const filtered = filterUsecase.execute(allEvents, {
      searchKeyword,
      visibleGroupIds: Array.from(visibleGroupIds),
    });

    set({ filteredEvents: filtered });
  },
}));
