"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDates = void 0;
function updateDates(next) {
    const date = new Date();
    const currentDate = date.setHours(date.getHours() - 3 + date.getTimezoneOffset() / 60);
    if (!this.createdAt) {
        this.createdAt = new Date(currentDate);
    }
    this.lastUpdatedAt = new Date(currentDate);
    next();
}
exports.updateDates = updateDates;
;
