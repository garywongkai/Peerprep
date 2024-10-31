
export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    // Decode the value before returning it
    return cookieValue ? decodeURIComponent(cookieValue) : undefined;
  }
  return undefined;
};

export const setCookie = (name: string, value: string, seconds?: number): void => { // I change days to seconds
  let expires = "";
  if (seconds) {
    const date = new Date();
    date.setTime(date.getTime() + seconds * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  // Encode value to handle special characters
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
};
