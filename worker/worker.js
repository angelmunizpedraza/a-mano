// A mano · Worker de IA (Cloudflare Workers AI). Hecho por Ángel Muñiz.
// Bindings: AI (Workers AI). Variables: APP_KEY (secreto), ALLOWED_ORIGINS (texto, separadas por comas).
const MODELOS = {
  default: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  complex: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  quick: "@cf/meta/llama-4-scout-17b-16e-instruct"
};
const SISTEMA = "Sigue al pie de la letra las instrucciones y el formato de salida que se te piden. Responde en el idioma del texto que recibes.";

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const permitidos = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const origenOk = !permitidos.length || permitidos.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": origenOk && origin ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-App-Key",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8" } });

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!origenOk) return json({ error: "origin" }, 403);
    if (req.method !== "POST") return json({ ok: true, app: "a-mano-ia" });
    if (!env.APP_KEY || req.headers.get("X-App-Key") !== env.APP_KEY) return json({ error: "auth" }, 401);

    let body;
    try { body = await req.json(); } catch (_) { return json({ error: "bad_request" }, 400); }
    if (body && body.ping) return json({ ok: true });

    const tier = MODELOS[body && body.tier] ? body.tier : "default";
    const input = body && body.input;
    const mensajes = typeof input === "string"
      ? [{ role: "user", content: input }]
      : Array.isArray(input) ? input.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") : [];
    if (!mensajes.length) return json({ error: "bad_request" }, 400);
    if (mensajes.reduce((a, m) => a + m.content.length, 0) > 60000) return json({ error: "too_large" }, 413);

    try {
      const r = await env.AI.run(MODELOS[tier], {
        messages: [{ role: "system", content: SISTEMA }, ...mensajes],
        max_tokens: 3000,
        temperature: tier === "quick" ? 0.4 : 0.9
      });
      let text = typeof r === "string" ? r : r && (r.response ?? (r.result && r.result.response));
      if (text && typeof text !== "string") text = JSON.stringify(text);
      return json({ text: text || "", model: MODELOS[tier] });
    } catch (e) {
      const m = String((e && e.message) || e);
      if (/3036|4006|daily|neuron|limit|429/i.test(m)) return json({ error: "rate_limited" }, 429);
      return json({ error: "upstream" }, 502);
    }
  }
};
