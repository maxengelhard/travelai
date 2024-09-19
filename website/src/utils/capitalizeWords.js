export const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  };