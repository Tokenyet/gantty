import { Project } from './types';

export interface ProjectRepository {
  getAll(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  create(name: string): Promise<Project>;
  rename(id: string, name: string): Promise<Project>;
  delete(id: string): Promise<boolean>;
  reorder(ordered: Project[]): Promise<void>;
}
