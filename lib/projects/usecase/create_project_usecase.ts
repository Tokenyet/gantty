import { ProjectRepository } from './project_repository';
import { Project } from './types';

export class CreateProjectUsecase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(name: string): Promise<Project> {
    return this.projectRepository.create(name);
  }
}
