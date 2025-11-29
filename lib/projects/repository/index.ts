import { storageService } from '@/lib/gantt-chart/repository';
import { ProjectRepositoryImpl } from './project_repository_impl';

// Factory for DI
export const projectRepository = new ProjectRepositoryImpl(storageService);
