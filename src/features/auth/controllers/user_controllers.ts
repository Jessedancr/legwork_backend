import { Request, Response } from "express";

export function getUsers(req: Request, res: Response) {
  res.send("I am here");
}

export function getUserById(req: Request, res: Response) {
  res.send({});
}

export function getUserDetails(req: Request, res: Response) {}
