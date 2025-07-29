import { Request, Response } from "express";
import {
  ClientInterface,
  DancerInterface,
  UserInterface,
} from "../models/user.interface";

type SignupReqBody = UserInterface &
  Partial<DancerInterface> &
  Partial<ClientInterface>;

export function signup(req: Request<{}, {}, SignupReqBody>, res: Response) {}

export function login(req: Request, res: Response) {}

export function logout(req: Request, res: Response) {}
