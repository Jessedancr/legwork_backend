import mongoose, { Schema } from "mongoose";
import { JobApplicationInterface } from "./jobApplication.interface";

const jobApplicationSchema = new Schema<JobApplicationInterface>(
  {
    jobId: { type: Schema.Types.ObjectId, required: true },
    dancerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    clientId: { type: Schema.Types.ObjectId, required: true },
    applicationStatus: { type: String, default: "pending" },
    proposal: { type: String, required: true },
  },
  { timestamps: true }
);

export const jobApplicationModel = mongoose.model<JobApplicationInterface>(
  "jobApplication",
  jobApplicationSchema
);
