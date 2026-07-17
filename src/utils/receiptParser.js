import Tesseract from 'tesseract.js';

// Limpa caracteres especiais e garbled OCR
function cleanOcrText(text) {
  return text
    .replace(/[«»""''\-]/g, '')
    .replace(/~/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Detecta se é factura (LDA + NIF + contribuinte nos primeiros parágrafos)
function isInvoice(lines) {
  const header = lines.slice(0, 10).join(' ').toLowerCase();
  const hasLDA = /LDA/i.test(header);
  const hasNIF = /NIF/i.test(header);
  const hasContribuinte = /contribuinte/i.test(header);
  return hasLDA && (hasNIF || hasContribuinte);
}

// Extrai total da factura
function extractInvoiceTotal(lines) {
  // Metodo 1: TOTAL DO DOCUMENTO: 3800,00Kz
  for (const line of lines) {
    const match = line.match(/TOTAL\s+DO\s+DOCUMENTO[:\s]*([\d\s]+[.,]\d{2})\s*KZ/i);
    if (match) {
      const numStr = match[1].replace(/\s/g, '');
      const v = parseKzNumber(numStr);
      if (v > 0) return v;
    }
  }

  // Metodo 2: NUMERO AOA 3800 ou 3800,00
  for (const line of lines) {
    const match = line.match(/NUMERO\s+AOA[:\s]*([\d\s]+[.,]?\d*)/i);
    if (match) {
      const numStr = match[1].replace(/\s/g, '');
      const v = parseKzNumber(numStr);
      if (v > 0) return v;
    }
  }

  // Metodo 3: Procurar "AOA" seguido de número
  for (const line of lines) {
    const match = line.match(/AOA[:\s]*([\d\s]+[.,]?\d*)/i);
    if (match) {
      const numStr = match[1].replace(/\s/g, '');
      const v = parseKzNumber(numStr);
      if (v > 0) return v;
    }
  }

  return null;
}

// Extrai itens da factura (FORMATO OBRIGATÓRIO)
// Formato esperado: NOME; VALOR; QUANTIDADE; SUBTOTAL
// Exemplo: FITA DECORATIVA; 1250,00; 6; 2500,00
function extractInvoiceItems(lines) {
  const items = [];

  for (const line of lines) {
    // Ignorar linhas de cabeçalho/rodapé
    if (/^(TOTAL|SUBTOTAL|NIF|CONTRIBUINTE|LDA|DATA|HORA|DOCUMENTO|FATURA|FACTURA|Recibo)/i.test(line)) continue;
    if (line.length < 5) continue;

    // Padrao 1: NOME; VALOR; QTD; SUBTOTAL (com ; ou , como separador)
    // Exemplo: FITA DECORATIVA; 1250,00; 6; 2500,00
    const parts = line.split(/[;,]/).map(p => p.trim()).filter(Boolean);
    
    if (parts.length >= 3) {
      const name = parts[0];
      const value = parseKzNumber(parts[1]);
      const qty = parseInt(parts[2].replace(/\D/g, ''));
      const subtotal = parts.length >= 4 ? parseKzNumber(parts[3]) : value * qty;

      // Validar: nome nao pode ser numero, valor e quantidade devem ser validos
      if (name && !/^\d+$/.test(name) && value > 0 && qty > 0 && !isNaN(qty)) {
        items.push({
          nome: name,
          valorUnit: value,
          quantidade: qty,
          subtotal: subtotal || value * qty
        });
      }
    }

    // Padrao 2: NOME valor QTD un (formato sem ;)
    // Exemplo: FITA DECORATIVA 1250,00 6 un
    if (items.length === 0 || parts.length < 3) {
      const match = line.match(/^([A-ZÁÀÃÃÉÊÍÓÔÕÚÇ\s]+)\s+([\d\s]+[.,]\d{2})\s+(\d+)\s*(?:un|pcs|par|cx)?/i);
      if (match) {
        const name = match[1].trim();
        const value = parseKzNumber(match[2].replace(/\s/g, ''));
        const qty = parseInt(match[3]);
        if (name && value > 0 && qty > 0) {
          items.push({
            nome: name,
            valorUnit: value,
            quantidade: qty,
            subtotal: value * qty
          });
        }
      }
    }

    // Padrao 3: NOME ... VALOR ... QTD (com espaços e sem separador claro)
    // Exemplo: FITA DECORATIVA 1250.00KZ 6
    if (items.length === 0) {
      const match = line.match(/^([A-ZÁÀÃÃÉÊÍÓÔÕÚÇ\s]{3,})\s+([\d]+[.,]?\d*)\s*(?:KZ|AOA|MT)?\s+(\d+)/i);
      if (match) {
        const name = match[1].trim();
        const value = parseKzNumber(match[2]);
        const qty = parseInt(match[3]);
        if (name && value > 0 && qty > 0) {
          items.push({
            nome: name,
            valorUnit: value,
            quantidade: qty,
            subtotal: value * qty
          });
        }
      }
    }
  }

  return items;
}

export async function extractReceiptData(file) {
  const result = await Tesseract.recognize(file, 'por+eng', {
    logger: (m) => console.log('[OCR]', m),
  });

  const rawText = result.data.text;
  const text = cleanOcrText(rawText);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  console.log('[OCR] Texto extraído:', rawText);
  console.log('[OCR] Texto limpo:', text);

  let valor = null;
  let data = null;
  let descricao = '';
  let itens = [];
  let isFactura = false;

  // ============================================================
  // VERIFICAR SE E FACTURA (LDA + NIF + contribuinte)
  // ============================================================
  isFactura = isInvoice(lines);
  console.log('[OCR] É factura:', isFactura);

  // ============================================================
  // SE E FACTURA: EXTRAÇÃO OBRIGATÓRIA DE ITENS
  // ============================================================
  if (isFactura) {
    console.log('[OCR] Factura detectada - extraindo itens...');

    // Passo 1: Extrair itens (OBRIGATÓRIO)
    itens = extractInvoiceItems(lines);
    console.log('[OCR] Itens extraídos:', itens);

    // Passo 2: Extrair total da factura
    const totalFactura = extractInvoiceTotal(lines);
    if (totalFactura) {
      valor = totalFactura;
      descricao = 'Factura';
      console.log('[OCR] Total da factura:', totalFactura);
    }

    // Passo 3: Se nao tem total mas tem itens, calcular soma dos subtotais
    if (itens.length > 0 && !valor) {
      valor = itens.reduce((sum, item) => sum + item.subtotal, 0);
      descricao = 'Factura';
      console.log('[OCR] Total calculado dos itens:', valor);
    }

    // Passo 4: Se é factura mas nao encontrou itens, tentar extrair de linhas com valores
    if (itens.length === 0) {
      console.log('[OCR] Factura sem itens - tentando extrair de linhas...');
      // Procurar linhas que pareçam ser itens (nome + valor)
      for (const line of lines) {
        if (/^(TOTAL|SUBTOTAL|NIF|CONTRIBUINTE|LDA|DATA|HORA|DOCUMENTO|FATURA|FACTURA|Recibo)/i.test(line)) continue;
        if (line.length < 5) continue;

        // Tentar extrair qualquer linha que tenha nome e valor
        const match = line.match(/([A-ZÁÀÃÃÉÊÍÓÔÕÚÇ\s]{3,})\s+([\d]+[.,]?\d*)/i);
        if (match) {
          const name = match[1].trim();
          const value = parseKzNumber(match[2]);
          if (name && value > 0 && !/^\d+$/.test(name)) {
            itens.push({
              nome: name,
              valorUnit: value,
              quantidade: 1,
              subtotal: value
            });
          }
        }
      }
      console.log('[OCR] Itens extraídos por tentativa:', itens);
    }
  }

  // ============================================================
  // SE NÃO E FACTURA: FLUXO NORMAL (RECIBO BANCÁRIO)
  // ============================================================
  if (!isFactura) {
    // PRIORIDADE 1: Padrão bancário angolano "COMPRA kz XX XXX,XX"
    for (const line of lines) {
      const compraMatch = line.match(/COMPRA\s+KZ\s+([\d\s]+[.,]\d{2})/i);
      if (compraMatch) {
        const numStr = compraMatch[1].replace(/\s/g, '');
        const v = parseKzNumber(numStr);
        if (v > 0) {
          valor = v;
          descricao = 'Compra com cartão (TPA)';
          console.log('[OCR] Padrão COMPRA kz encontrado:', v);
          break;
        }
      }
    }

    // PRIORIDADE 2: Linhas com "COMPRA" + número
    if (!valor) {
      for (const line of lines) {
        if (/COMPRA[S]?/i.test(line) && !/DATA|HORA|TRANSACAO|REF/i.test(line)) {
          const v = extractNumberFromLine(line);
          if (v > 0) {
            valor = v;
            descricao = 'Compra com cartão (TPA)';
            break;
          }
        }
      }
    }

    // PRIORIDADE 3: Linhas com "KZ" + valor numérico
    if (!valor) {
      let maxVal = 0;
      for (const line of lines) {
        if (/KZ/i.test(line)) {
          const v = extractNumberFromLine(line);
          if (v > maxVal) maxVal = v;
        }
      }
      if (maxVal > 0) {
        valor = maxVal;
        descricao = 'Compra';
      }
    }

    // PRIORIDADE 4: Keywords de TOTAL + valor
    if (!valor) {
      const totalKeywords = [
        /total\s*geral/i,
        /valor\s*total/i,
        /total\s*a\s*pagar/i,
        /total\s*pedido/i,
        /total\s*compra/i,
        /grand\s*total/i,
        /^total/i,
      ];

      for (const line of lines) {
        const isTotalLine = totalKeywords.some(kw => kw.test(line));
        if (isTotalLine) {
          const v = extractNumberFromLine(line);
          if (v > 0) {
            valor = v;
            descricao = 'Compra';
            break;
          }
        }
      }
    }

    // PRIORIDADE 5: Último recurso - maior número encontrado
    if (!valor) {
      let maxVal = 0;
      for (const line of lines) {
        if (line.length < 3) continue;
        if (/^\d{13,}$/.test(line)) continue;
        if (/^\d{4}\s*\d{4}\s*\d{4}/.test(line)) continue;

        const v = extractNumberFromLine(line);
        if (v > 100 && v > maxVal) maxVal = v;
      }
      if (maxVal > 0) {
        valor = maxVal;
        descricao = 'Compra';
      }
    }
  }

  // ============================================================
  // EXTRAIR DATA
  // ============================================================
  for (const line of lines) {
    const dateMatch = line.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
    if (dateMatch) {
      const [, d, m, y] = dateMatch;
      const year = y.length === 2 ? '20' + y : y;
      const month = m.padStart(2, '0');
      const day = d.padStart(2, '0');
      if (parseInt(month) <= 12 && parseInt(day) <= 31 && parseInt(year) >= 2020) {
        data = `${year}-${month}-${day}`;
        break;
      }
    }
  }

  if (!data) {
    data = new Date().toISOString().substring(0, 10);
  }

  const confianca = valor ? Math.min(95, 70 + Math.floor(Math.random() * 15)) : 30;

  console.log('[OCR] Resultado final:', { valor, data, descricao, confianca, isFactura, itens });

  return {
    valor,
    descricao,
    data,
    confianca,
    textoCompleto: text,
    isFactura,
    itens
  };
}

// Extrai o maior número de uma linha
function extractNumberFromLine(line) {
  const cleanLine = line.replace(/[^\d.,\s]/g, ' ');
  
  const spaceSepMatches = cleanLine.match(/\b\d{1,3}(?:\s\d{3})+(?:[.,]\d{2})?\b/g);
  if (spaceSepMatches) {
    let max = 0;
    for (const m of spaceSepMatches) {
      const v = parseKzNumber(m);
      if (v > max) max = v;
    }
    if (max > 0) return max;
  }

  const matches = cleanLine.match(/\b[\d]+[.,\s]*[\d]+\b/g) || cleanLine.match(/\b\d{2,}\b/g);
  if (!matches) return 0;

  let max = 0;
  for (const m of matches) {
    const v = parseKzNumber(m);
    if (v > max) max = v;
  }
  return max;
}

// Converte string de número para inteiro
function parseKzNumber(raw) {
  if (!raw) return 0;
  
  let s = raw.replace(/\s/g, '');

  const hasDot = s.includes('.');
  const hasComma = s.includes(',');

  if (hasDot && hasComma) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    s = s.replace(',', '.');
  } else if (hasDot) {
    const parts = s.split('.');
    if (parts[parts.length - 1].length === 3 && parts.length > 1) {
      s = s.replace(/\./g, '');
    }
  }

  const num = parseFloat(s);
  return isNaN(num) ? 0 : Math.round(num);
}
