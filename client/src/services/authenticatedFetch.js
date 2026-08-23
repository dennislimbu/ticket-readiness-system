import { fetchAuthSession } from "aws-amplify/auth";

export const authenticatedFetch = async (
  url,
  options = {}
) => {
  const session = await fetchAuthSession();

  const accessToken =
    session.tokens?.accessToken?.toString();

  if (!accessToken) {
    throw new Error(
      "No authentication token available"
    );
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`
    }
  });
};