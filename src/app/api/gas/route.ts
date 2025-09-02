const GAS_URL = process.env.GAS_URL;

if (!GAS_URL) {
  throw new Error('GAS_URL environment variable is not configured');
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qs = url.search;
    const res = await fetch(GAS_URL! + qs, { method: "GET" });
    const body = await res.text();
    return new Response(body, { 
      status: res.status, 
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error('GET request to GAS failed:', error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("proxy received data:", data);

    const res = await fetch(GAS_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const txt = await res.text();

    return new Response(txt, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
    });
  } catch (error) {
    console.error('POST request to GAS failed:', error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
}
