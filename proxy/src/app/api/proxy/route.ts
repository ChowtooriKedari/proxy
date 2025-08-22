import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) return new Response("missing url", { status: 400 });

  let u: URL;
  try {
    u = new URL(target);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  // tighten to Windborne only
  if (u.hostname !== "a.windbornesystems.com") {
    return new Response("forbidden host", { status: 403 });
  }

  const r = await fetch(u.toString(), {
    headers: { "User-Agent": "wb-proxy/1.0" },
    cache: "no-store",
  });

  const h = new Headers(r.headers);
  h.set("access-control-allow-origin", "*");
  h.set("access-control-allow-methods", "GET, OPTIONS");
  h.set("cache-control", "no-store");
  if (!h.get("content-type")) h.set("content-type", "application/json");

  return new Response(r.body, { status: r.status, headers: h });
}

// handle preflight just in case
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
    },
  });
}
