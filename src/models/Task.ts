import mongoose, { Schema, Document, Types } from 'mongoose';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'ACTIVE' | 'COMPLETED' | 'DELETED';

export interface ITask extends Document {
  projectId: Types.ObjectId;
  title: string;
  contentHtml?: string;
  dueDate?: Date;
  priority: Priority;
  status: Status;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    contentHtml: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'DELETED'],
      default: 'ACTIVE',
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ status: 1, priority: -1, dueDate: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);