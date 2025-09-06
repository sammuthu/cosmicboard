import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

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

export interface ApiConfig {
  baseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

class ApiClient {
  private config: ApiConfig;
  private uploadQueue: Array<{ id: string; upload: () => Promise<any> }> = [];
  private isProcessingQueue = false;

  constructor() {
    this.config = this.getConfig();
  }

  private getConfig(): ApiConfig {
    // In development, default to backend server
    const isDev = __DEV__;
    
    if (isDev) {
      return {
        baseUrl: 'http://localhost:7779',
        environment: 'development'
      };
    }
    
    // In production, use environment variables or fallback
    return {
      baseUrl: Constants.expoConfig?.extra?.backendUrl || 'https://api.cosmicboard.com',
      environment: 'production'
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(error.error || `Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed [${endpoint}]:`, error);
      throw error;
    }
  }

  // Projects API
  async getProjects(): Promise<Project[]> {
    return this.makeRequest<Project[]>('/api/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.makeRequest<Project>(`/api/projects/${id}`);
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return this.makeRequest<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    return this.makeRequest<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.makeRequest<void>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks API
  async getTasks(projectId: string): Promise<Task[]> {
    return this.makeRequest<Task[]>(`/api/tasks?projectId=${projectId}`);
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    return this.makeRequest<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return this.makeRequest<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async completeTask(id: string): Promise<Task> {
    return this.makeRequest<Task>(`/api/tasks/${id}/complete`, {
      method: 'POST',
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.makeRequest<void>(`/api/tasks/${id}/delete`, {
      method: 'POST',
    });
  }

  // Media API
  async getMedia(params: {
    projectId: string;
    type?: 'photo' | 'screenshot' | 'pdf';
    page?: number;
    limit?: number;
  }): Promise<MediaListResponse> {
    const searchParams = new URLSearchParams({
      projectId: params.projectId,
      ...(params.type && { type: params.type }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
    });

    return this.makeRequest<MediaListResponse>(`/api/media?${searchParams}`);
  }

  async getMediaItem(id: string): Promise<Media> {
    return this.makeRequest<Media>(`/api/media/${id}`);
  }

  async uploadFile(
    file: {
      uri: string;
      type: string;
      name: string;
    },
    projectId: string,
    type: 'photo' | 'screenshot' | 'pdf',
    customName?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Media> {
    const formData = new FormData();
    
    // Add file to form data
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
    
    formData.append('projectId', projectId);
    formData.append('type', type);
    if (customName) {
      formData.append('name', customName);
    }

    const url = `${this.config.baseUrl}/api/media/upload`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || `Upload failed: ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.open('POST', url);
      xhr.send(formData);
    });
  }

  async uploadScreenshot(
    imageBase64: string,
    projectId: string,
    customName?: string
  ): Promise<Media> {
    return this.makeRequest<Media>('/api/media/screenshot', {
      method: 'POST',
      body: JSON.stringify({
        image: imageBase64,
        projectId,
        ...(customName && { name: customName }),
      }),
    });
  }

  async updateMedia(id: string, updates: { name: string }): Promise<Media> {
    return this.makeRequest<Media>(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMedia(id: string): Promise<void> {
    return this.makeRequest<void>(`/api/media/${id}`, {
      method: 'DELETE',
    });
  }

  // Offline support
  async queueUpload(upload: () => Promise<any>): Promise<string> {
    const id = Date.now().toString();
    this.uploadQueue.push({ id, upload });
    
    // Store in AsyncStorage for persistence
    await AsyncStorage.setItem(
      `upload_queue_${id}`,
      JSON.stringify({ id, timestamp: Date.now() })
    );
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processUploadQueue();
    }
    
    return id;
  }

  private async processUploadQueue(): Promise<void> {
    if (this.isProcessingQueue || this.uploadQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.uploadQueue.length > 0) {
      const { id, upload } = this.uploadQueue.shift()!;
      
      try {
        await upload();
        // Remove from AsyncStorage on success
        await AsyncStorage.removeItem(`upload_queue_${id}`);
      } catch (error) {
        console.error(`Upload queue item ${id} failed:`, error);
        // Re-queue for retry (put back at end)
        this.uploadQueue.push({ id, upload });
        // Stop processing if we hit an error to prevent infinite loops
        break;
      }
    }

    this.isProcessingQueue = false;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp?: string }> {
    return this.makeRequest<{ status: string; timestamp?: string }>('/health');
  }
}

export default new ApiClient();