import { Request, Response, NextFunction } from 'express';

const filterRequestBody = (fieldsAccepted: string[]) => {
  const acceptedFieldsSet = new Set(fieldsAccepted);

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body || typeof req.body === 'object') {
      req.body = Object.keys(req.body).reduce((filteredBody: { [key: string]: any }, field) => {
        if (acceptedFieldsSet.has(field)) {
          filteredBody[field] = req.body[field];
        }
        return filteredBody;
      }, {});
    }

    next();
  };
};

export { filterRequestBody };