import { ProjectRepository } from './project_repository';
import { Project } from './types';

export class GetProjectsUsecase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectRepository.getAll();
  }
}
