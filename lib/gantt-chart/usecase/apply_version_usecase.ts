import { VersionRepository } from './version_repository';
import { EventRepository } from './event_repository';
import { GroupRepository } from './group_repository';
import { NotFoundError } from './errors';
import { VersionSnapshot } from './types';

/**
 * Restore events/groups from a saved version snapshot.
 */
export class ApplyVersionUsecase {
  constructor(
    private versionRepository: VersionRepository,
    private eventRepository: EventRepository,
    private groupRepository: GroupRepository
  ) {}

  /**
   * Replace current data with the snapshot from the specified version.
   * @returns The snapshot that was restored (for UI updates)
   */
  async execute(versionId: string): Promise<VersionSnapshot> {
    const version = await this.versionRepository.getById(versionId);
    if (!version) throw new NotFoundError('Version', versionId);

    const { snapshot } = version;

    // Replace groups first so events have valid references
    await this.groupRepository.replaceAll(snapshot.groups);
    await this.eventRepository.replaceAll(snapshot.events);

    return snapshot;
  }
}
