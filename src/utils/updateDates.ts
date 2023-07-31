export function updateDates(this: any, next: Function) {
  const date = new Date();
  const currentDate = date.setHours(date.getHours() - 3 + date.getTimezoneOffset() / 60);

  if (!this.createdAt) {
    this.createdAt = new Date(currentDate);
  }

  this.lastUpdatedAt = new Date(currentDate);

  next();
};