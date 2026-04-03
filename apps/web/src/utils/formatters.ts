export const formatTime = (time: string) => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
