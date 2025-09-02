const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;

if (!GAS_URL) {
  throw new Error('NEXT_PUBLIC_GAS_URL environment variable is not configured');
}

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
    const res = await fetch(GAS_URL as string + qs, { method: "GET" });
    const body = await res.text();
    return new Response(body, { 
      status: res.status, 
      headers: { ...CORS, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error('GET request to GAS failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: "Failed to fetch from GAS", details: errorMessage }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch(GAS_URL as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const txt = await res.text();
    return new Response(txt, { 
      status: res.status, 
      headers: { ...CORS, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error('POST request to GAS failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: "Failed to post to GAS", details: errorMessage }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
}
