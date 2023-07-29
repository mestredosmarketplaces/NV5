import { Request, Response, NextFunction } from 'express';
declare const filterRequestBody: (fieldsAccepted: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export { filterRequestBody };
