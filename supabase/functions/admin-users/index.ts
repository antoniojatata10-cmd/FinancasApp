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
        JSON.stringify({
          error: "action e user_id são obrigatórios",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Não autorizado",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // Cliente normal para descobrir quem chamou
    const supabaseUser = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const {
      data: { user: adminUser },
    } = await supabaseUser.auth.getUser();

    if (!adminUser) {
      return new Response(
        JSON.stringify({
          error: "Sessão inválida",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", adminUser.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") {
      return new Response(
        JSON.stringify({
          error: "Apenas administradores podem executar esta ação",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // BLOQUEAR UTILIZADOR
    if (action === "block") {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          is_active: false,
        })
        .eq("id", user_id);

      if (error) throw error;

      return Response.json(
        {
          success: true,
          message: "Utilizador bloqueado",
        },
        { headers: corsHeaders }
      );
    }

    // DESBLOQUEAR UTILIZADOR
    if (action === "unblock") {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          is_active: true,
        })
        .eq("id", user_id);

      if (error) throw error;

      return Response.json(
        {
          success: true,
          message: "Utilizador desbloqueado",
        },
        { headers: corsHeaders }
      );
    }

    // ELIMINAR UTILIZADOR COMPLETAMENTE
    if (action === "delete") {
      const { error } =
        await supabaseAdmin.auth.admin.deleteUser(user_id);

      if (error) throw error;

      return Response.json(
        {
          success: true,
          message: "Utilizador eliminado definitivamente",
        },
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Ação desconhecida",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});