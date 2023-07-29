import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            requestHandledHeader?: {};
        }
    }
}
export declare const handleRequestHeaders: (req: Request, res: Response, next: NextFunction) => void;
