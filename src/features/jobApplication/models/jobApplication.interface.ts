import { Document, ObjectId } from "mongoose";

export interface JobApplicationInterface extends Document {
  jobId: ObjectId;
  dancerId: ObjectId;
  clientId: ObjectId;
  applicationStatus: "pending" | "accepted" | "rejected";
  proposal: string;
}
