import { Document, ObjectId } from "mongoose";

export interface JobInterface extends Document {
  jobTitle: string;
  jobLocation: string;
  prefDanceStyles: [string];
  pay: string;
  amtOfDancers: string;
  jobDuration: string;
  jobDescr: string;
  jobType: string;
  clientId: ObjectId;
  status: boolean;
}
