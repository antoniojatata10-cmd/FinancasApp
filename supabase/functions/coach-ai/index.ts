import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `És o Coach Financeiro da aplicação "Finança ao Ponto", um assistente IA especializado em finanças pessoais para o mercado angolano.

IDENTIDADE:
- Nome: Coach Finança ao Ponto
- Especialidade: Finanças pessoais, orçamento, investimentos, dívidas, metas financeiras
- Tom: Amigável, profissional, motivador. Fala em português de Angola.
- Formato: Respostas concisas (máx 3-4 parágrafos). Usa emojis com moderação.

CONTEXTO DO UTILIZADOR:
O utilizador fornece dados financeiros reais. Usa esses dados para dar conselhos personalizados.
Se não tiver dados suficientes, pede mais informações antes de aconselhar.

REGRAS:
1. Nunca inventes dados financeiros. Usa apenas os dados fornecidos.
2. Recomenda acções concretas e exequíveis no contexto angolano.
3. Menciona produtos reais: BTs, OTs, BODIVA, Aurea, Multicaixa Express.
4. Se o utilizador perguntar sobre assuntos não financeiros, responde normalmente mas redireciona suavemente para finanças.
5. Nunca dás aconselhamento profissional de investimento. Avisa sempre que é apenas educativo.
6. Em Angola, 1 USD ≈ 920 Kz. Usa esta referência para conversões.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "message é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "Chave Gemini não configurada no servidor." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context string from user's financial data
    let contextStr = "";
    if (context) {
      const parts: string[] = [];
      if (context.saldoLiquido !== undefined) parts.push(`Saldo líquido: ${Number(context.saldoLiquido).toLocaleString('pt-AO')} Kz`);
      if (context.totalEntradas) parts.push(`Receitas do mês: ${Number(context.totalEntradas).toLocaleString('pt-AO')} Kz`);
      if (context.totalSaidas) parts.push(`Despesas do mês: ${Number(context.totalSaidas).toLocaleString('pt-AO')} Kz`);
      if (context.taxaPoupanca !== undefined) parts.push(`Taxa de poupança: ${context.taxaPoupanca.toFixed(1)}%`);
      if (context.totalDividas) parts.push(`Dívidas activas: ${Number(context.totalDividas).toLocaleString('pt-AO')} Kz`);
      if (context.numLancamentos) parts.push(`Lançamentos este mês: ${context.numLancamentos}`);
      if (context.categorias && context.categorias.length > 0) {
        parts.push("Categorias principais:");
        context.categorias.slice(0, 5).forEach((c: any) => {
          parts.push(`  - ${c.nome}: ${Number(c.total).toLocaleString('pt-AO')} Kz`);
        });
      }
      if (parts.length > 0) {
        contextStr = `\n\nDADOS FINANCEIROS DO UTILIZADOR:\n${parts.join('\n')}`;
      }
    }

    const userContent = SYSTEM_PROMPT + contextStr + `\n\nUTILIZADOR: ${message}`;

    // Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userContent }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.9,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errBody);
      return new Response(
        JSON.stringify({ error: "Erro ao comunicar com a IA. Tente novamente." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Desculpe, não consegui gerar uma resposta. Tente novamente.";

    return Response.json(
      { reply },
      { headers: corsHeaders }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
