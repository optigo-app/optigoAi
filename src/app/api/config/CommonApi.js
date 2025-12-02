import { APIURL, getHeaders } from "./config";

export const CommonAPI = async (body) => {
  try {
    const init = JSON.parse(sessionStorage.getItem("taskInit")) || {};
    const headers = getHeaders(init);

    const response = await fetch(APIURL, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
