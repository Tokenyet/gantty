import { ProjectRepository } from './project_repository';
import { Project } from './types';

export class RenameProjectUsecase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(id: string, name: string): Promise<Project> {
    return this.projectRepository.rename(id, name);
  }
}
