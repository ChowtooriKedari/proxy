export default async function handler(req, res) {
  const target = req.query.url as string;
  if (!target) { res.status(400).send("missing url"); return; }

  try {
    const t = new URL(target);
    if (t.hostname !== "a.windbornesystems.com") {
      res.status(403).send("forbidden host");
      return;
    }
  } catch {
    res.status(400).send("bad url");
    return;
  }

  const r = await fetch(target, { headers: { "User-Agent": "wb-proxy/1.0" } });
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, OPTIONS");
  res.setHeader("cache-control", "no-store");

  const ct = r.headers.get("content-type") || "application/json";
  res.setHeader("content-type", ct);

  res.status(r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  res.send(buf);
}
