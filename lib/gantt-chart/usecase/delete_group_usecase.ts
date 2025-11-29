import { GroupRepository } from './group_repository';
import { EventRepository } from './event_repository';
import { BusinessRuleViolationError } from './errors';

export class DeleteGroupUsecase {
  constructor(
    private groupRepository: GroupRepository,
    private eventRepository: EventRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    // Check if group has associated events
    const eventsInGroup = await this.eventRepository.getByGroupId(id);
    
    if (eventsInGroup.length > 0) {
      throw new BusinessRuleViolationError(
        `Cannot delete group with ${eventsInGroup.length} associated event(s). Please reassign or delete the events first.`,
        'group_has_events'
      );
    }

    return await this.groupRepository.delete(id);
  }
}
