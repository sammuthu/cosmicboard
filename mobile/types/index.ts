export interface Project {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  _id?: string;
  counts?: {
    tasks: {
      active: number;
      completed: number;
      deleted: number;
    };
    references: {
      total: number;
      snippets: number;
      documentation: number;
    };
    media: number;
  };
}

export interface Task {
  id: string;
  projectId: string;
  priority: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DELETED';
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  projectId: string;
  type: 'photo' | 'screenshot' | 'pdf';
  name: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
  createdAt: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface MediaListResponse {
  media: Media[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
}

export interface CacheData<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface OfflineQueueItem {
  id: string;
  type: 'upload' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Projects: undefined;
  ProjectDetail: { projectId: string };
  MediaGallery: { projectId: string; type?: 'photo' | 'screenshot' | 'pdf' };
  MediaViewer: { mediaId: string };
  Tasks: { projectId: string };
  Camera: { projectId: string };
  Settings: undefined;
};

// Store types
export interface AppState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  isOffline: boolean;
  uploadProgress: Record<string, UploadProgress>;
}

export interface MediaState {
  mediaByProject: Record<string, Media[]>;
  isLoading: boolean;
  uploadProgress: Record<string, UploadProgress>;
}

export interface TaskState {
  tasksByProject: Record<string, Task[]>;
  isLoading: boolean;
}