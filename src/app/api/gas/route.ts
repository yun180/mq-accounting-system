const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qs = url.search;
    const res = await fetch(GAS_URL + qs, { method: "GET" });
    const body = await res.text();
    return new Response(body, { 
      status: res.status, 
      headers: { ...CORS, "Content-Type": "application/json" } 
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch from GAS" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
    });
    const txt = await res.text();
    return new Response(txt, { 
      status: res.status, 
      headers: { ...CORS, "Content-Type": "application/json" } 
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to post to GAS" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
}
