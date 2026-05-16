import { getUserFromHeaders } from "infra/auth.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).end();
  }

  const user = await getUserFromHeaders(request.headers);
  if (!user) {
    return response.status(401).json({ error: "Não autorizado." });
  }

  response.status(200).json({ user });
}
