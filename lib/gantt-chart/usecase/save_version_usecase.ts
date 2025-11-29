import { Version, VersionSnapshot, CreateVersionData } from './types';
import { VersionRepository } from './version_repository';

export class SaveVersionUsecase {
  constructor(private versionRepository: VersionRepository) {}

  async execute(note: string, snapshot: VersionSnapshot): Promise<Version> {
    const data: CreateVersionData = {
      note,
      snapshot
    };

    return await this.versionRepository.create(data);
  }
}
