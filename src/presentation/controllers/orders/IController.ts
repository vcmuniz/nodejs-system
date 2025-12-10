import { Request, Response } from "express";

export interface IController {
  handle(req: Request, res: Response): void;
}