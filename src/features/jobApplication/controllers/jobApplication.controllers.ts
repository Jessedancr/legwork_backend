import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import {
  updateApplicationStatus,
  fetchApplicationsByDancerId,
  fetchApplicationsByJobId,
  saveJobApplication,
} from "../../../core/configs/utils";
import { JobApplicationInterface } from "../models/jobApplication.interface";

export async function applyForJob(req: Request, res: Response) {
  const result = validationResult(req);
  console.log(
    "POST job-applications/apply-for-job: Validation result: ",
    result
  );
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  const data = matchedData(req);

  const dancerId = req.user?.id;

  const { jobId } = req.params;
  try {
    const applicationData = {
      ...data,
      dancerId,
      jobId,
    } as any;

    const { exists, application } = await saveJobApplication(applicationData);

    if (exists) {
      console.log("Duplicate application attempted");
      return res.status(409).json({
        message: "You have already applied for this job",
        application,
      });
    }

    return res
      .status(201)
      .json({ message: "Application submitted", application });
  } catch (error) {
    console.log("Error applying for job: ", error);
    return res.status(500).json({ message: "unknown server error" });
  }
}

export async function getApplicationsForJob(req: Request, res: Response) {
  const { jobId } = req.params;
  const clientId = req.user?.id as string;

  try {
    const applications = await fetchApplicationsByJobId(jobId, clientId);

    if (!applications || applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for this job" });
    }
    return res.status(200).json({ applications });
  } catch (error) {
    console.log("Error fetching applications for job: ", error);
    return res.status(500).json({ message: "Unknown server error" });
  }
}

export async function getApplicationsForDancer(req: Request, res: Response) {
  const dancerId = req.user?.id as string;

  try {
    const appsWithJobs = await fetchApplicationsByDancerId(dancerId);
    if (!appsWithJobs || appsWithJobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for this dancer" });
    }
    return res.status(200).json({ appsWithJobs });
  } catch (error) {
    console.log("Error fetching dancer's applications: ", error);
    return res.status(500).json({ message: "Unknown server error" });
  }
}

export async function acceptApplication(
  req: Request<{ appId: string }, {}, JobApplicationInterface>,
  res: Response
) {
  const { appId } = req.params;
  const { applicationStatus } = req.body;
  console.log(typeof applicationStatus);
  try {
    const app = await updateApplicationStatus(appId, applicationStatus);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    return res.status(200).json({ message: "Application accepted", app });
  } catch (error) {
    console.log("Error accepting application: ", error);
    return res.status(500).json({ message: "Unknown server error" });
  }
}

export async function rejectApplication(
  req: Request<{ appId: string }, {}, JobApplicationInterface>,
  res: Response
) {
  const { appId } = req.params;
  const { applicationStatus } = req.body;
  try {
    const app = await updateApplicationStatus(appId, applicationStatus);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    return res.status(200).json({ message: "Application rejected", app });
  } catch (error) {
    console.log("Error rejecting application: ", error);
    return res.status(500).json({ message: "Unknown server error" });
  }
}
