'use client';

import { Group } from '../usecase/types';
import { useFilterStore } from '../presenter/filter_store';

interface GroupFilterProps {
  groups: Group[];
  onFilterChange?: () => void;
}

export default function GroupFilter({ groups, onFilterChange }: GroupFilterProps) {
  const { visibleGroupIds, toggleGroupVisibility, setAllGroupsVisibility } = useFilterStore();

  const handleToggle = (groupId: string) => {
    toggleGroupVisibility(groupId);
    onFilterChange?.();
  };

  const handleSelectAll = () => {
    const allVisible = groups.every(g => visibleGroupIds.has(g.id));
    setAllGroupsVisibility(!allVisible, groups.map(g => g.id));
    onFilterChange?.();
  };

  const allSelected = groups.length > 0 && groups.every(g => visibleGroupIds.has(g.id));
  const someSelected = groups.some(g => visibleGroupIds.has(g.id)) && !allSelected;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Filter by Group</h3>
        <button
          onClick={handleSelectAll}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      <div className="space-y-2">
        {groups.map((group) => {
          const isChecked = visibleGroupIds.has(group.id);
          
          return (
            <label
              key={group.id}
              className="flex items-center cursor-pointer hover:bg-gray-50 rounded px-2 py-1.5"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(group.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <div className="ml-3 flex items-center flex-1">
                <div
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-sm text-gray-700">{group.name}</span>
              </div>
            </label>
          );
        })}
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-gray-500 italic">No groups available</p>
      )}
    </div>
  );
}
