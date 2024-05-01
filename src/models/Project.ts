import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";

export interface IProject extends Document {
  projectName: string
  clientName: string
  description: string
  tasks: PopulatedDoc<ITask & Document>[]
  manager: PopulatedDoc<IUser & Document>
  team: PopulatedDoc<IUser & Document>[]
}

// Mongoose
const ProjectSchema: Schema = new Schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  tasks: [
    {
      type: Types.ObjectId,
      ref: 'Task'
    }
  ],
  manager: {
    type: Types.ObjectId,
    ref: 'User'
  },
  team: [{
    type: Types.ObjectId,
    ref: 'User'
  }]
}, {timestamps: true})

// Middleware
ProjectSchema.pre('deleteOne', {document: true}, async function() {
  const projectId = this._id
  if (!projectId) return

  // Obtenemos todas las tareas
  const tasks = await Task.find({project: projectId})

  // Eliminamos las notas para cada tarea
  for (const task of tasks) {
    await Note.deleteMany({task: task.id})
  }
  
  // Eliminamos todas las tareas del proyecto
  await Task.deleteMany({project: projectId})
  
})

const Project = mongoose.model<IProject>('Project', ProjectSchema)

export default Project