import { ProjectRepository } from './project_repository';

export class DeleteProjectUsecase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.projectRepository.delete(id);
  }
}
