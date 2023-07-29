"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterRequestBody = void 0;
const filterRequestBody = (fieldsAccepted) => {
    const acceptedFieldsSet = new Set(fieldsAccepted);
    return (req, res, next) => {
        if (req.body || typeof req.body === 'object') {
            req.body = Object.keys(req.body).reduce((filteredBody, field) => {
                if (acceptedFieldsSet.has(field)) {
                    filteredBody[field] = req.body[field];
                }
                return filteredBody;
            }, {});
        }
        next();
    };
};
exports.filterRequestBody = filterRequestBody;
