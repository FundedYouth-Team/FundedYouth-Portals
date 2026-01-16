// Cloudflare Pages Function to proxy Eventbrite API requests
// This handles all requests to /api/eventbrite/* in production

interface Env {
  EVENTBRITE_PRIVATE_TOKEN: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  // Get the path segments after /api/eventbrite/
  const pathSegments = params.path as string[];
  const eventbritePath = pathSegments ? pathSegments.join("/") : "";

  // Build the Eventbrite API URL
  const url = new URL(request.url);
  const eventbriteUrl = `https://www.eventbriteapi.com/${eventbritePath}${url.search}`;

  // Make the request to Eventbrite with the auth token
  const response = await fetch(eventbriteUrl, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${env.EVENTBRITE_PRIVATE_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  // Return the response with CORS headers
  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
