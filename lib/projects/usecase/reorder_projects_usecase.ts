import { ProjectRepository } from './project_repository';
import { Project } from './types';

export class ReorderProjectsUsecase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(projects: Project[]): Promise<void> {
    return this.projectRepository.reorder(projects);
  }
}
