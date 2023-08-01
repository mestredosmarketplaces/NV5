export const dateStat = (offset?: number) => {
  const date = new Date();
  date.setHours(date.getHours() - (offset || 3) + date.getTimezoneOffset() / 60);

  // Format the date in the desired format
  const formattedDate = date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
    });

  return formattedDate;
};

