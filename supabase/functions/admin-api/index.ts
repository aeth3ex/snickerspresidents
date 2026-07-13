import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/admin-api/, "");
    const body = req.method !== "GET" && req.method !== "DELETE" ? await req.json().catch(() => ({})) : {};

    // ── GET /changelog — public, returns all changelog entries (bilingual) ──
    if (req.method === "GET" && path === "/changelog") {
      const { data, error } = await supabase
        .from("changelog")
        .select("id, version, title, title_en, body, body_en, created_at, sort_order")
        .order("sort_order", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ entries: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET /news — public, returns all news entries (bilingual) ──
    if (req.method === "GET" && path === "/news") {
      const { data, error } = await supabase
        .from("site_news")
        .select("id, title_ru, title_en, body_ru, body_en, sort_order, created_at")
        .order("sort_order", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ entries: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET /version — public, returns current version label ──
    if (req.method === "GET" && path === "/version") {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("current_version")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;
      return new Response(JSON.stringify({ version: data?.current_version || "v1.0" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST /verify-code — verify admin code ──
    if (req.method === "POST" && path === "/verify-code") {
      const { code } = body;
      if (!code) {
        return new Response(JSON.stringify({ error: "Code required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase
        .from("admin_settings")
        .select("admin_code_hash")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return new Response(JSON.stringify({ error: "Admin settings not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const inputHash = await sha256(code);
      return new Response(JSON.stringify({ is_admin: inputHash === data.admin_code_hash }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── All operations below require admin verification ──
    let code: string;
    if (req.method === "DELETE") {
      const raw = await req.text().catch(() => "");
      try { code = JSON.parse(raw).code; } catch { code = ""; }
    } else {
      code = body.code;
    }
    if (!code) {
      return new Response(JSON.stringify({ error: "Admin code required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: settings } = await supabase
      .from("admin_settings")
      .select("admin_code_hash")
      .eq("id", 1)
      .maybeSingle();
    const inputHash = await sha256(code);
    if (!settings || inputHash !== settings.admin_code_hash) {
      return new Response(JSON.stringify({ error: "Invalid admin code" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST /changelog — add bilingual changelog entry ──
    if (req.method === "POST" && path === "/changelog") {
      const { version, title, title_en, body: entryBody, body_en, sort_order } = body;
      if (!version || !title || !entryBody || !title_en || !body_en) {
        return new Response(JSON.stringify({ error: "version, title, title_en, body, body_en required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase
        .from("changelog")
        .insert({ version, title, title_en, body: entryBody, body_en, sort_order: sort_order || 0 })
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ entry: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PUT /changelog/:id — update bilingual changelog entry ──
    if (req.method === "PUT" && path.startsWith("/changelog/")) {
      const id = path.split("/")[2];
      const { version, title, title_en, body: entryBody, body_en, sort_order } = body;
      const updates: Record<string, unknown> = {};
      if (version !== undefined) updates.version = version;
      if (title !== undefined) updates.title = title;
      if (title_en !== undefined) updates.title_en = title_en;
      if (entryBody !== undefined) updates.body = entryBody;
      if (body_en !== undefined) updates.body_en = body_en;
      if (sort_order !== undefined) updates.sort_order = sort_order;
      const { data, error } = await supabase.from("changelog").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ entry: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE /changelog/:id ──
    if (req.method === "DELETE" && path.startsWith("/changelog/")) {
      const id = path.split("/")[2];
      const { error } = await supabase.from("changelog").delete().eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST /news — add bilingual news entry ──
    if (req.method === "POST" && path === "/news") {
      const { title_ru, title_en, body_ru, body_en, sort_order } = body;
      if (!title_ru || !title_en || !body_ru || !body_en) {
        return new Response(JSON.stringify({ error: "title_ru, title_en, body_ru, body_en required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase
        .from("site_news")
        .insert({ title_ru, title_en, body_ru, body_en, sort_order: sort_order || 0 })
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ entry: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PUT /news/:id — update news entry ──
    if (req.method === "PUT" && path.startsWith("/news/")) {
      const id = path.split("/")[2];
      const { title_ru, title_en, body_ru, body_en, sort_order } = body;
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title_ru !== undefined) updates.title_ru = title_ru;
      if (title_en !== undefined) updates.title_en = title_en;
      if (body_ru !== undefined) updates.body_ru = body_ru;
      if (body_en !== undefined) updates.body_en = body_en;
      if (sort_order !== undefined) updates.sort_order = sort_order;
      const { data, error } = await supabase.from("site_news").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ entry: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE /news/:id ──
    if (req.method === "DELETE" && path.startsWith("/news/")) {
      const id = path.split("/")[2];
      const { error } = await supabase.from("site_news").delete().eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PUT /change-code ──
    if (req.method === "PUT" && path === "/change-code") {
      const { new_code } = body;
      if (!new_code || new_code.length < 1) {
        return new Response(JSON.stringify({ error: "new_code required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const newHash = await sha256(new_code);
      const { error } = await supabase
        .from("admin_settings")
        .update({ admin_code_hash: newHash, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PUT /version ──
    if (req.method === "PUT" && path === "/version") {
      const { version } = body;
      if (!version) {
        return new Response(JSON.stringify({ error: "version required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase
        .from("admin_settings")
        .update({ current_version: version, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
      return new Response(JSON.stringify({ version }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
