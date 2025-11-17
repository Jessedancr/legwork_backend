"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyForJob = applyForJob;
exports.getApplicationsForJob = getApplicationsForJob;
exports.getApplicationsForDancer = getApplicationsForDancer;
exports.acceptApplication = acceptApplication;
exports.rejectApplication = rejectApplication;
const express_validator_1 = require("express-validator");
const utils_1 = require("../../../core/configs/utils");
async function applyForJob(req, res) {
    const result = (0, express_validator_1.validationResult)(req);
    console.log("POST job-applications/apply-for-job: Validation result: ", result);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    const data = (0, express_validator_1.matchedData)(req);
    const dancerId = req.user?.id;
    const { jobId } = req.params;
    try {
        const applicationData = {
            ...data,
            dancerId,
            jobId,
        };
        const { exists, application } = await (0, utils_1.saveJobApplication)(applicationData);
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
    }
    catch (error) {
        console.log("Error applying for job: ", error);
        return res.status(500).json({ message: "unknown server error" });
    }
}
async function getApplicationsForJob(req, res) {
    const { jobId } = req.params;
    const clientId = req.user?.id;
    try {
        const applications = await (0, utils_1.fetchApplicationsByJobId)(jobId, clientId);
        if (!applications || applications.length === 0) {
            return res
                .status(404)
                .json({ message: "No applications found for this job" });
        }
        return res.status(200).json({ applications });
    }
    catch (error) {
        console.log("Error fetching applications for job: ", error);
        return res.status(500).json({ message: "Unknown server error" });
    }
}
async function getApplicationsForDancer(req, res) {
    const dancerId = req.user?.id;
    try {
        const appsWithJobs = await (0, utils_1.fetchApplicationsByDancerId)(dancerId);
        if (!appsWithJobs || appsWithJobs.length === 0) {
            return res
                .status(404)
                .json({ message: "No applications found for this dancer" });
        }
        return res.status(200).json({ appsWithJobs });
    }
    catch (error) {
        console.log("Error fetching dancer's applications: ", error);
        return res.status(500).json({ message: "Unknown server error" });
    }
}
async function acceptApplication(req, res) {
    const { appId } = req.params;
    const { applicationStatus } = req.body;
    console.log(typeof applicationStatus);
    try {
        const app = await (0, utils_1.updateApplicationStatus)(appId, applicationStatus);
        if (!app) {
            return res.status(404).json({ message: "Application not found" });
        }
        return res.status(200).json({ message: "Application accepted", app });
    }
    catch (error) {
        console.log("Error accepting application: ", error);
        return res.status(500).json({ message: "Unknown server error" });
    }
}
async function rejectApplication(req, res) {
    const { appId } = req.params;
    const { applicationStatus } = req.body;
    try {
        const app = await (0, utils_1.updateApplicationStatus)(appId, applicationStatus);
        if (!app) {
            return res.status(404).json({ message: "Application not found" });
        }
        return res.status(200).json({ message: "Application rejected", app });
    }
    catch (error) {
        console.log("Error rejecting application: ", error);
        return res.status(500).json({ message: "Unknown server error" });
    }
}
