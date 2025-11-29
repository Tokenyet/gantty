import { Group, UpdateGroupData } from './types';
import { GroupRepository } from './group_repository';
import { ValidationError } from './errors';

export class UpdateGroupUsecase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(id: string, data: UpdateGroupData): Promise<Group> {
    // Validate hex color format if provided
    if (data.color) {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      if (!hexColorRegex.test(data.color)) {
        throw new ValidationError(
          'Color must be in hex format (#RRGGBB)',
          'color',
          'hex_format'
        );
      }
    }

    return await this.groupRepository.update(id, data);
  }
}
