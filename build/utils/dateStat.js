"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateStat = void 0;
const dateStat = (offset) => {
    const date = new Date();
    return date.setHours(date.getHours() - (offset || 3) + date.getTimezoneOffset() / 60);
};
exports.dateStat = dateStat;
