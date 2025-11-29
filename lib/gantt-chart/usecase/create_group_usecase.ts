import { Group, CreateGroupData } from './types';
import { GroupRepository } from './group_repository';
import { ValidationError } from './errors';

export class CreateGroupUsecase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(data: CreateGroupData): Promise<Group> {
    // Validate hex color format
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (!hexColorRegex.test(data.color)) {
      throw new ValidationError(
        'Color must be in hex format (#RRGGBB)',
        'color',
        'hex_format'
      );
    }

    // Check name uniqueness (repository will handle this)
    return await this.groupRepository.create(data);
  }
}
