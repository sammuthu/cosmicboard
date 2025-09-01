import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import Reference from '@/models/Reference';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const importData = await request.json();
    
    // Validate import data structure
    if (!importData.version || !importData.data) {
      return NextResponse.json(
        { error: 'Invalid import file format' },
        { status: 400 }
      );
    }
    
    const { projects, tasks, references } = importData.data;
    
    // Create ID mapping for projects (old ID -> new ID)
    const projectIdMap = new Map();
    
    // Import projects
    const importedProjects = [];
    for (const project of projects || []) {
      const { _id, ...projectData } = project;
      const newProject = await Project.create(projectData);
      projectIdMap.set(_id, newProject._id.toString());
      importedProjects.push(newProject);
    }
    
    // Import tasks with updated project IDs
    const importedTasks = [];
    for (const task of tasks || []) {
      const { _id, projectId, ...taskData } = task;
      const newProjectId = projectIdMap.get(projectId) || projectId;
      const newTask = await Task.create({
        ...taskData,
        projectId: newProjectId
      });
      importedTasks.push(newTask);
    }
    
    // Import references with updated project IDs
    const importedReferences = [];
    for (const reference of references || []) {
      const { _id, projectId, ...refData } = reference;
      const newProjectId = projectIdMap.get(projectId) || projectId;
      const newReference = await Reference.create({
        ...refData,
        projectId: newProjectId
      });
      importedReferences.push(newReference);
    }
    
    return NextResponse.json({
      success: true,
      imported: {
        projects: importedProjects.length,
        tasks: importedTasks.length,
        references: importedReferences.length
      }
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}