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
    console.log("=== VERCEL PROXY DEBUG ===");
    console.log("proxy received data:", JSON.stringify(data, null, 2));
    console.log("data type:", typeof data);
    console.log("data keys:", Object.keys(data));
    console.log("sending to GAS with Content-Type: application/json");
    console.log("GAS_URL:", process.env.GAS_URL);
    
    const requestBody = JSON.stringify(data);
    console.log("request body:", requestBody);
    console.log("request body length:", requestBody.length);

    const res = await fetch(process.env.GAS_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    const txt = await res.text();
    console.log("GAS response status:", res.status);
    console.log("GAS response headers:", Object.fromEntries(res.headers.entries()));
    console.log("GAS response text:", txt);
    console.log("=== END VERCEL PROXY DEBUG ===");

    return new Response(txt, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
