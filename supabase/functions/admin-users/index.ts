import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, user_id } = await req.json();

    if (!action || !user_id) {
      return new Response(
        JSON.stringify({ error: "action e user_id são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verificar quem chamou
    const supabaseUser = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: adminUser } } = await supabaseUser.auth.getUser();
    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", adminUser.id)
      .single();

    if (!adminProfile || !["admin", "superadmin"].includes(adminProfile.role?.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: "Apenas administradores podem executar esta ação" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── BLOQUEAR UTILIZADOR ──────────────────────────────────────────────────────
    // Bloqueia no Auth (impede login) e marca is_active=false no perfil
    if (action === "block") {
      // 1. Banir no Supabase Auth — duração de ~100 anos
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        ban_duration: "876000h",
      });
      if (banError) throw banError;

      // 2. Marcar is_active=false no perfil
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ is_active: false })
        .eq("id", user_id);
      if (profileError) throw profileError;

      return Response.json(
        { success: true, message: "Utilizador bloqueado. O login foi desativado." },
        { headers: corsHeaders }
      );
    }

    // ── DESBLOQUEAR UTILIZADOR ───────────────────────────────────────────────────
    // Remove o ban do Auth e restaura is_active=true no perfil
    if (action === "unblock") {
      // 1. Remover ban no Supabase Auth
      const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        ban_duration: "none",
      });
      if (unbanError) throw unbanError;

      // 2. Restaurar is_active=true no perfil
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ is_active: true })
        .eq("id", user_id);
      if (profileError) throw profileError;

      return Response.json(
        { success: true, message: "Utilizador desbloqueado. O acesso foi restaurado." },
        { headers: corsHeaders }
      );
    }

    // ── ELIMINAR UTILIZADOR COMPLETAMENTE ────────────────────────────────────────
    // Todas as tabelas têm ON DELETE CASCADE a partir de profiles(id) → auth.users(id)
    // Basta eliminar de auth.users e o Supabase cascade-apaga tudo.
    if (action === "delete") {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (deleteError) throw deleteError;

      return Response.json(
        { success: true, message: "Utilizador e todos os seus dados foram eliminados definitivamente." },
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação desconhecida" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});