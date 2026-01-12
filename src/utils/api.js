export async function fetchJsonOrThrow(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = `API Error: ${response.status}`;

    try {
      const text = await response.text();
      if (text) {
        message += ` - ${text.substring(0, 200)}`;
      }
    } catch (e) {
      // Ignore body read errors – status code is usually enough
    }

    throw new Error(message);
  }

  return response.json();
}
