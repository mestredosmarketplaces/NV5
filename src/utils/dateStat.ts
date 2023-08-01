export const dateStat = (offset?: number) => {
  const date = new Date();
  return date.setHours(date.getHours() - (offset || 3) + date.getTimezoneOffset() / 60);
};

