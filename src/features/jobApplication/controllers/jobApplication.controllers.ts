import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import { saveJobApplication } from "../../../core/configs/utils";

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

export async function getApplicationsForJob(req: Request, res: Response) {}
