import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import { JobInterface } from "../models/job.interface";
import {
  fetchAllJobs,
  fetchJobsByClientId,
  findUserById,
  saveJob,
  updateJobStatus,
} from "../../../core/configs/utils";
import UserType from "../../../core/enums/userTypeEnum";

type createJobReqBody = JobInterface;

export async function createJob(
  req: Request<{}, {}, createJobReqBody>,
  res: Response
) {
  const result = validationResult(req);
  console.log("POST jobs/post-job: Validation result: ", result);

  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }

  const data = matchedData<createJobReqBody>(req);

  const clientId = (req.user as any)?._id;

  try {
    const jobData = {
      ...data,
      clientId,
    } as any;
    // * Save the job
    const job = await saveJob(jobData);

    // * Send res back to client
    return res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    console.error("Error creating job: ", error);
    return res.status(500).json({ message: "Unknown server error" });
  }
}

export async function fetchJobs(req: Request, res: Response) {
  const userId = (req.user as any)?._id;
  const userType = (req.user as any).userType;
  try {
    //  * If user is client, return jobs posted by the client
    if (userType == UserType.Client) {
      const jobs = await fetchJobsByClientId(userId);
      if (!jobs) {
        console.log("No jobs created by client with ID: ", userId);
        return res
          .status(404)
          .json({ message: "You have not created any job yet" });
      }
      return res.status(200).json({ message: "Jobs you have posted", jobs });
    }

    // * Else if user is dancer, return all jobs
    else {
      const jobs = await fetchAllJobs();
      if (!jobs) {
        console.log("There are no jobs");
        return res.status(404).json({ message: "No job found" });
      }

      return res.status(200).json({ message: "Jobs found", jobs });
    }
  } catch (error) {
    console.log("Error fetching jobs ", error);
    return res.status(500).json({ message: "Unexpected server error" });
  }
}

export async function changeStatus(req: Request, res: Response) {
  const { jobId } = req.params;
  const { status } = req.body;
  console.log(`Job ID: ${jobId} - status: ${status}`);
  try {
    if (!jobId || jobId === null || jobId === "" || jobId === undefined) {
      return res.status(400).json({ message: "Bad request, no Job ID found" });
    }
    const result = await updateJobStatus(jobId, status);

    if (!result) {
      console.log("Job not found with ID: ", jobId);
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job status updated", result });
  } catch (error) {
    console.log("Unknown server error while updating job status: ", error);
    return res.status(500).json({ message: "unknown server error" });
  }
}
