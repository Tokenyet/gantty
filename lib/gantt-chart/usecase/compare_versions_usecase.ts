import {
  Version,
  VersionDiff,
  ModifiedEvent,
  EventChanges,
  GroupChange,
  FieldChange,
  Event,
  Group
} from './types';
import { VersionRepository } from './version_repository';
import { NotFoundError } from './errors';

export class CompareVersionsUsecase {
  constructor(private versionRepository: VersionRepository) {}

  async execute(versionId1: string, versionId2: string): Promise<VersionDiff> {
    const v1 = await this.versionRepository.getById(versionId1);
    const v2 = await this.versionRepository.getById(versionId2);

    if (!v1) throw new NotFoundError('Version', versionId1);
    if (!v2) throw new NotFoundError('Version', versionId2);

    // Determine which is older/newer
    const [older, newer] = v1.number < v2.number ? [v1, v2] : [v2, v1];

    return this.compareSnapshots(older, newer);
  }

  private compareSnapshots(older: Version, newer: Version): VersionDiff {
    const eventDiff = this.compareEvents(older.snapshot.events, newer.snapshot.events);
    const groupChanges = this.compareGroups(older.snapshot.groups, newer.snapshot.groups);

    return {
      addedEvents: eventDiff.added,
      deletedEvents: eventDiff.deleted,
      modifiedEvents: eventDiff.modified,
      groupChanges
    };
  }

  private compareEvents(oldEvents: Event[], newEvents: Event[]) {
    const oldMap = new Map(oldEvents.map(e => [e.id, e]));
    const newMap = new Map(newEvents.map(e => [e.id, e]));

    // Added: in new but not in old
    const added = newEvents.filter(e => !oldMap.has(e.id));

    // Deleted: in old but not in new
    const deleted = oldEvents.filter(e => !newMap.has(e.id));

    // Modified: in both but different
    const modified: ModifiedEvent[] = [];
    for (const newEvent of newEvents) {
      const oldEvent = oldMap.get(newEvent.id);
      if (oldEvent) {
        const changes = this.detectEventChanges(oldEvent, newEvent);
        if (Object.keys(changes).length > 0) {
          modified.push({
            eventId: newEvent.id,
            oldValue: oldEvent,
            newValue: newEvent,
            changes
          });
        }
      }
    }

    return { added, deleted, modified };
  }

  private detectEventChanges(oldEvent: Event, newEvent: Event): EventChanges {
    const changes: EventChanges = {};

    if (oldEvent.name !== newEvent.name) {
      changes.name = { old: oldEvent.name, new: newEvent.name };
    }

    if (oldEvent.description !== newEvent.description) {
      changes.description = { old: oldEvent.description, new: newEvent.description };
    }

    if (oldEvent.startDate !== newEvent.startDate) {
      changes.startDate = { old: oldEvent.startDate, new: newEvent.startDate };
    }

    if (oldEvent.endDate !== newEvent.endDate) {
      changes.endDate = { old: oldEvent.endDate, new: newEvent.endDate };
    }

    if (oldEvent.groupId !== newEvent.groupId) {
      changes.groupId = { old: oldEvent.groupId, new: newEvent.groupId };
    }

    return changes;
  }

  private compareGroups(oldGroups: Group[], newGroups: Group[]): GroupChange[] {
    const oldMap = new Map(oldGroups.map(g => [g.id, g]));
    const newMap = new Map(newGroups.map(g => [g.id, g]));

    const changes: GroupChange[] = [];

    // Added groups
    for (const newGroup of newGroups) {
      if (!oldMap.has(newGroup.id)) {
        changes.push({
          type: 'added',
          groupId: newGroup.id,
          newValue: newGroup
        });
      }
    }

    // Deleted groups
    for (const oldGroup of oldGroups) {
      if (!newMap.has(oldGroup.id)) {
        changes.push({
          type: 'deleted',
          groupId: oldGroup.id,
          oldValue: oldGroup
        });
      }
    }

    // Modified groups
    for (const newGroup of newGroups) {
      const oldGroup = oldMap.get(newGroup.id);
      if (oldGroup) {
        const groupChanges = this.detectGroupChanges(oldGroup, newGroup);
        if (groupChanges) {
          changes.push({
            type: 'modified',
            groupId: newGroup.id,
            oldValue: oldGroup,
            newValue: newGroup,
            changes: groupChanges
          });
        }
      }
    }

    return changes;
  }

  private detectGroupChanges(
    oldGroup: Group,
    newGroup: Group
  ): { name?: FieldChange<string>; color?: FieldChange<string> } | undefined {
    const changes: { name?: FieldChange<string>; color?: FieldChange<string> } = {};

    if (oldGroup.name !== newGroup.name) {
      changes.name = { old: oldGroup.name, new: newGroup.name };
    }

    if (oldGroup.color !== newGroup.color) {
      changes.color = { old: oldGroup.color, new: newGroup.color };
    }

    return Object.keys(changes).length > 0 ? changes : undefined;
  }
}
