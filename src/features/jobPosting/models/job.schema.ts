import mongoose, { Schema } from "mongoose";
import { JobInterface } from "./job.interface";

const jobSchema = new Schema<JobInterface>(
  {
    jobTitle: { type: String, required: true },
    jobLocation: { type: String, required: true },
    prefDanceStyles: { type: [String], required: true },
    pay: { type: String, required: true },
    amtOfDancers: { type: String, required: true },
    jobDuration: { type: String, required: true },
    jobDescr: { type: String, required: true },
    jobType: { type: String, required: true },
    clientId: {
      type: Schema.Types.ObjectId,
      required: true,
      default: () => mongoose.Types.ObjectId,
    },
    status: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const jobModel = mongoose.model<JobInterface>("job", jobSchema, "jobs");
