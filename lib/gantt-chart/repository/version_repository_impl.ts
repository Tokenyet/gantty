import { VersionRepository } from '../usecase/version_repository';
import { Version, CreateVersionData } from '../usecase/types';
import { StorageService } from './storage_service';
import {
  getProjectScopedKey,
  VERSION_METADATA_BASE_KEY,
  VERSIONS_BASE_KEY
} from './project_scope';

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface StoredVersions {
  version: string;
  lastUpdated: string;
  data: Version[];
}

interface Metadata {
  version: string;
  nextVersionNumber: number;
  initialized: boolean;
}

export class VersionRepositoryImpl implements VersionRepository {
  constructor(private storage: StorageService) {}

  async getAll(): Promise<Version[]> {
    const stored = await this.storage.get<StoredVersions>(this.getVersionsKey());
    if (!stored || !stored.data) {
      return [];
    }
    // Sort by number descending (newest first)
    return stored.data.sort((a, b) => b.number - a.number);
  }

  async getById(id: string): Promise<Version | null> {
    const versions = await this.getAll();
    return versions.find(v => v.id === id) || null;
  }

  async getByNumber(number: number): Promise<Version | null> {
    const versions = await this.getAll();
    return versions.find(v => v.number === number) || null;
  }

  async create(data: CreateVersionData): Promise<Version> {
    const nextNumber = await this.getNextVersionNumber();

    const version: Version = {
      id: generateUUID(),
      number: nextNumber,
      createdAt: new Date().toISOString(),
      note: data.note,
      snapshot: data.snapshot
    };

    const versions = await this.getAll();
    versions.push(version);
    await this.saveVersions(versions);

    // Update metadata
    await this.updateMetadata(nextNumber + 1);

    return version;
  }

  async delete(id: string): Promise<boolean> {
    const versions = await this.getAll();
    const filtered = versions.filter(v => v.id !== id);

    if (filtered.length === versions.length) {
      return false; // Version not found
    }

    await this.saveVersions(filtered);
    return true;
  }

  async getNextVersionNumber(): Promise<number> {
    const metadata = await this.storage.get<Metadata>(this.getMetadataKey());
    if (!metadata || !metadata.initialized) {
      await this.initializeMetadata();
      return 1;
    }
    return metadata.nextVersionNumber;
  }

  private async saveVersions(versions: Version[]): Promise<void> {
    const stored: StoredVersions = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      data: versions
    };
    await this.storage.set(this.getVersionsKey(), stored);
  }

  private async initializeMetadata(): Promise<void> {
    const metadata: Metadata = {
      version: '1.0',
      nextVersionNumber: 1,
      initialized: true
    };
    await this.storage.set(this.getMetadataKey(), metadata);
  }

  private async updateMetadata(nextVersionNumber: number): Promise<void> {
    const metadata: Metadata = {
      version: '1.0',
      nextVersionNumber,
      initialized: true
    };
    await this.storage.set(this.getMetadataKey(), metadata);
  }

  private getVersionsKey(): string {
    return getProjectScopedKey(VERSIONS_BASE_KEY);
  }

  private getMetadataKey(): string {
    return getProjectScopedKey(VERSION_METADATA_BASE_KEY);
  }
}
