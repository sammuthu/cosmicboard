import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReference extends Document {
  projectId: Types.ObjectId;
  title: string;
  content: string;
  category?: string; // e.g., 'prompt', 'snippet', 'documentation', 'link'
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReferenceSchema = new Schema<IReference>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Reference title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Reference content is required'],
    },
    category: {
      type: String,
      enum: ['prompt', 'snippet', 'documentation', 'link', 'other'],
      default: 'other',
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
ReferenceSchema.index({ projectId: 1, category: 1 });
ReferenceSchema.index({ tags: 1 });

export default mongoose.models.Reference || mongoose.model<IReference>('Reference', ReferenceSchema);