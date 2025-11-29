'use client';

import { useState } from 'react';
import { useVersionStore } from '../presenter/version_store';
import { format } from '@/lib/shared/utils/date';

interface VersionListProps {
  onClose: () => void;
}

export default function VersionList({ onClose }: VersionListProps) {
  const {
    versions,
    selectedVersionIds,
    diff,
    isComparing,
    selectVersion,
    compareSelected,
    deleteVersion,
    clearSelection
  } = useVersionStore();

  const [showDiff, setShowDiff] = useState(false);

  const handleCompare = async () => {
    await compareSelected();
    setShowDiff(true);
  };

  const handleDelete = async (id: string, versionNumber: number) => {
    if (confirm(`Are you sure you want to delete Version ${versionNumber}?`)) {
      await deleteVersion(id);
    }
  };

  const canCompare = selectedVersionIds.length === 2;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-xl font-bold">Version History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showDiff ? (
          <>
            <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Select 2 versions to compare
                {selectedVersionIds.length > 0 && (
                  <span className="ml-2 font-medium">
                    ({selectedVersionIds.length} selected)
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                {selectedVersionIds.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
                  >
                    Clear Selection
                  </button>
                )}
                <button
                  onClick={handleCompare}
                  disabled={!canCompare || isComparing}
                  className={`px-4 py-1.5 rounded text-sm font-medium ${
                    canCompare && !isComparing
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isComparing ? 'Comparing...' : 'Compare Versions'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {versions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No versions saved yet
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => {
                    const isSelected = selectedVersionIds.includes(version.id);
                    const timestamp = new Date(version.createdAt);

                    return (
                      <div
                        key={version.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                        onClick={() => selectVersion(version.id, !isSelected)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Version {version.number}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {version.note || 'No description'}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {format(timestamp, 'PPpp')}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {version.snapshot.events.length} events, {version.snapshot.groups.length} groups
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(version.id, version.number);
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-auto p-6">
            <button
              onClick={() => setShowDiff(false)}
              className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Version List
            </button>

            {diff && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Comparison Results</h3>

                {/* Added Events */}
                {diff.addedEvents.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">
                      Added Events ({diff.addedEvents.length})
                    </h4>
                    <div className="space-y-2">
                      {diff.addedEvents.map((event) => (
                        <div key={event.id} className="border border-green-300 bg-green-50 rounded p-3">
                          <div className="font-medium">{event.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {event.startDate} to {event.endDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deleted Events */}
                {diff.deletedEvents.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">
                      Deleted Events ({diff.deletedEvents.length})
                    </h4>
                    <div className="space-y-2">
                      {diff.deletedEvents.map((event) => (
                        <div key={event.id} className="border border-red-300 bg-red-50 rounded p-3">
                          <div className="font-medium line-through">{event.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {event.startDate} to {event.endDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modified Events */}
                {diff.modifiedEvents.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">
                      Modified Events ({diff.modifiedEvents.length})
                    </h4>
                    <div className="space-y-3">
                      {diff.modifiedEvents.map((modified) => (
                        <div key={modified.eventId} className="border border-blue-300 bg-blue-50 rounded p-3">
                          <div className="font-medium">{modified.newValue.name}</div>
                          <div className="text-sm mt-2 space-y-1">
                            {modified.changes.name && (
                              <div>
                                <span className="font-medium">Name: </span>
                                <span className="text-red-600 line-through">{modified.changes.name.old}</span>
                                {' → '}
                                <span className="text-green-600">{modified.changes.name.new}</span>
                              </div>
                            )}
                            {modified.changes.startDate && (
                              <div>
                                <span className="font-medium">Start: </span>
                                <span className="text-red-600 line-through">{modified.changes.startDate.old}</span>
                                {' → '}
                                <span className="text-green-600">{modified.changes.startDate.new}</span>
                              </div>
                            )}
                            {modified.changes.endDate && (
                              <div>
                                <span className="font-medium">End: </span>
                                <span className="text-red-600 line-through">{modified.changes.endDate.old}</span>
                                {' → '}
                                <span className="text-green-600">{modified.changes.endDate.new}</span>
                              </div>
                            )}
                            {modified.changes.description && (
                              <div>
                                <span className="font-medium">Description: </span>
                                <span className="text-red-600 line-through">{modified.changes.description.old}</span>
                                {' → '}
                                <span className="text-green-600">{modified.changes.description.new}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group Changes */}
                {diff.groupChanges.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-2">
                      Group Changes ({diff.groupChanges.length})
                    </h4>
                    <div className="space-y-2">
                      {diff.groupChanges.map((change, idx) => (
                        <div key={idx} className="border border-purple-300 bg-purple-50 rounded p-3 text-sm">
                          {change.type === 'added' && change.newValue && (
                            <div>Added group: <span className="font-medium">{change.newValue.name}</span></div>
                          )}
                          {change.type === 'deleted' && change.oldValue && (
                            <div>Deleted group: <span className="font-medium line-through">{change.oldValue.name}</span></div>
                          )}
                          {change.type === 'modified' && change.changes && (
                            <div>
                              <div>Modified group: <span className="font-medium">{change.newValue?.name}</span></div>
                              {change.changes.name && (
                                <div className="ml-4">
                                  Name: <span className="text-red-600">{change.changes.name.old}</span> → <span className="text-green-600">{change.changes.name.new}</span>
                                </div>
                              )}
                              {change.changes.color && (
                                <div className="ml-4">
                                  Color: <span className="text-red-600">{change.changes.color.old}</span> → <span className="text-green-600">{change.changes.color.new}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diff.addedEvents.length === 0 &&
                  diff.deletedEvents.length === 0 &&
                  diff.modifiedEvents.length === 0 &&
                  diff.groupChanges.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No changes detected between these versions
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
