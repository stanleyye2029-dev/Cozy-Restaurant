/*
  Minimal JavaScript Edge Function for Supabase (Deno runtime)
  Endpoint returns JSON { message: "Hello from hello-js", time: "<iso>" }
*/

Deno.serve(async (req) => {
  try {
    const data = { message: "Hello from hello-js", time: new Date().toISOString() };
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
