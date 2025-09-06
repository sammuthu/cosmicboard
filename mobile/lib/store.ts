import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, Task, Media, UploadProgress } from '@/types';
import apiClient from './api-client';

// Projects Store
interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  createProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const projects = await apiClient.getProjects();
          set({ projects, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch projects',
            isLoading: false 
          });
        }
      },

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      createProject: async (project) => {
        set({ isLoading: true, error: null });
        try {
          const newProject = await apiClient.createProject(project);
          set(state => ({
            projects: [...state.projects, newProject],
            isLoading: false
          }));
          return newProject;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create project',
            isLoading: false 
          });
          throw error;
        }
      },

      updateProject: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProject = await apiClient.updateProject(id, updates);
          set(state => ({
            projects: state.projects.map(p => p.id === id ? updatedProject : p),
            currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update project',
            isLoading: false 
          });
        }
      },

      deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.deleteProject(id);
          set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete project',
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'projects-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        projects: state.projects,
        currentProject: state.currentProject 
      }),
    }
  )
);

// Tasks Store
interface TasksState {
  tasksByProject: Record<string, Task[]>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasksByProject: {},
      isLoading: false,
      error: null,

      fetchTasks: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await apiClient.getTasks(projectId);
          set(state => ({
            tasksByProject: {
              ...state.tasksByProject,
              [projectId]: tasks
            },
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tasks',
            isLoading: false 
          });
        }
      },

      createTask: async (task) => {
        if (!task.projectId) return;
        
        set({ isLoading: true, error: null });
        try {
          const newTask = await apiClient.createTask(task);
          set(state => ({
            tasksByProject: {
              ...state.tasksByProject,
              [task.projectId!]: [
                ...(state.tasksByProject[task.projectId!] || []),
                newTask
              ]
            },
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create task',
            isLoading: false 
          });
        }
      },

      updateTask: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTask = await apiClient.updateTask(id, updates);
          set(state => ({
            tasksByProject: Object.keys(state.tasksByProject).reduce((acc, projectId) => {
              acc[projectId] = state.tasksByProject[projectId].map(task =>
                task.id === id ? updatedTask : task
              );
              return acc;
            }, {} as Record<string, Task[]>),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update task',
            isLoading: false 
          });
        }
      },

      completeTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTask = await apiClient.completeTask(id);
          set(state => ({
            tasksByProject: Object.keys(state.tasksByProject).reduce((acc, projectId) => {
              acc[projectId] = state.tasksByProject[projectId].map(task =>
                task.id === id ? updatedTask : task
              );
              return acc;
            }, {} as Record<string, Task[]>),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to complete task',
            isLoading: false 
          });
        }
      },

      deleteTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.deleteTask(id);
          set(state => ({
            tasksByProject: Object.keys(state.tasksByProject).reduce((acc, projectId) => {
              acc[projectId] = state.tasksByProject[projectId].filter(task => task.id !== id);
              return acc;
            }, {} as Record<string, Task[]>),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete task',
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'tasks-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Media Store
interface MediaState {
  mediaByProject: Record<string, Media[]>;
  isLoading: boolean;
  error: string | null;
  uploadProgress: Record<string, UploadProgress>;
  
  // Actions
  fetchMedia: (projectId: string, type?: 'photo' | 'screenshot' | 'pdf') => Promise<void>;
  uploadMedia: (
    file: { uri: string; type: string; name: string },
    projectId: string,
    type: 'photo' | 'screenshot' | 'pdf',
    customName?: string,
    onProgress?: (progress: UploadProgress) => void
  ) => Promise<Media>;
  uploadScreenshot: (imageBase64: string, projectId: string, customName?: string) => Promise<Media>;
  updateMedia: (id: string, updates: { name: string }) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  clearError: () => void;
  setUploadProgress: (uploadId: string, progress: UploadProgress) => void;
  clearUploadProgress: (uploadId: string) => void;
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      mediaByProject: {},
      isLoading: false,
      error: null,
      uploadProgress: {},

      fetchMedia: async (projectId, type) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getMedia({ projectId, type });
          set(state => ({
            mediaByProject: {
              ...state.mediaByProject,
              [projectId]: response.media
            },
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch media',
            isLoading: false 
          });
        }
      },

      uploadMedia: async (file, projectId, type, customName, onProgress) => {
        const uploadId = `${Date.now()}-${file.name}`;
        
        try {
          const progressCallback = (progress: UploadProgress) => {
            set(state => ({
              uploadProgress: {
                ...state.uploadProgress,
                [uploadId]: progress
              }
            }));
            if (onProgress) {
              onProgress(progress);
            }
          };

          const media = await apiClient.uploadFile(file, projectId, type, customName, progressCallback);
          
          // Add to store
          set(state => ({
            mediaByProject: {
              ...state.mediaByProject,
              [projectId]: [
                ...(state.mediaByProject[projectId] || []),
                media
              ]
            }
          }));

          // Clear upload progress
          set(state => {
            const newProgress = { ...state.uploadProgress };
            delete newProgress[uploadId];
            return { uploadProgress: newProgress };
          });

          return media;
        } catch (error) {
          set(state => {
            const newProgress = { ...state.uploadProgress };
            delete newProgress[uploadId];
            return { 
              uploadProgress: newProgress,
              error: error instanceof Error ? error.message : 'Upload failed'
            };
          });
          throw error;
        }
      },

      uploadScreenshot: async (imageBase64, projectId, customName) => {
        set({ error: null });
        try {
          const media = await apiClient.uploadScreenshot(imageBase64, projectId, customName);
          
          set(state => ({
            mediaByProject: {
              ...state.mediaByProject,
              [projectId]: [
                ...(state.mediaByProject[projectId] || []),
                media
              ]
            }
          }));

          return media;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Screenshot upload failed'
          });
          throw error;
        }
      },

      updateMedia: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedMedia = await apiClient.updateMedia(id, updates);
          set(state => ({
            mediaByProject: Object.keys(state.mediaByProject).reduce((acc, projectId) => {
              acc[projectId] = state.mediaByProject[projectId].map(media =>
                media.id === id ? updatedMedia : media
              );
              return acc;
            }, {} as Record<string, Media[]>),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update media',
            isLoading: false 
          });
        }
      },

      deleteMedia: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.deleteMedia(id);
          set(state => ({
            mediaByProject: Object.keys(state.mediaByProject).reduce((acc, projectId) => {
              acc[projectId] = state.mediaByProject[projectId].filter(media => media.id !== id);
              return acc;
            }, {} as Record<string, Media[]>),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete media',
            isLoading: false 
          });
        }
      },

      setUploadProgress: (uploadId, progress) => {
        set(state => ({
          uploadProgress: {
            ...state.uploadProgress,
            [uploadId]: progress
          }
        }));
      },

      clearUploadProgress: (uploadId) => {
        set(state => {
          const newProgress = { ...state.uploadProgress };
          delete newProgress[uploadId];
          return { uploadProgress: newProgress };
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'media-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        mediaByProject: state.mediaByProject
      }),
    }
  )
);