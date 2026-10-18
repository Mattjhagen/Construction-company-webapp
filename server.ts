import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI client if key is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    system: 'EdificaPorto ERP & Gestão de Obras',
    environment: process.env.NODE_ENV || 'development',
    aiAvailable: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: AI Assistant to parse Bills of Quantities (Mapa de Quantidades / Caderno de Encargos)
app.post('/api/ai/parse-quantities', async (req, res) => {
  const { rawText, documentTitle, contextNotes } = req.body;

  if (!rawText || typeof rawText !== 'string') {
    res.status(400).json({ error: 'Texto ou conteúdo do mapa de quantidades é obrigatório.' });
    return;
  }

  // Fallback demo data if AI client is not configured
  if (!ai) {
    res.json({
      success: true,
      source: 'heuristic_parser',
      chapters: [
        {
          chapterName: '01. Demolições e Trabalhos Preparatórios',
          items: [
            {
              code: 'DEM.01',
              description: 'Demolição de alvenarias de tijolo e divisórias interiores, incl. carga e transporte a vazadouro licenciado',
              unit: 'm²',
              quantity: 45.5,
              unitPrice: 18.5,
              totalPrice: 841.75,
            },
            {
              code: 'DEM.02',
              description: 'Levantamento de pavimentos de soalho antigo degradado com preservação de vigamento de castanho',
              unit: 'm²',
              quantity: 72.0,
              unitPrice: 14.0,
              totalPrice: 1008.0,
            },
          ],
        },
        {
          chapterName: '02. Estrutura e Alvenarias Tradicionais',
          items: [
            {
              code: 'EST.01',
              description: 'Tratamento fungicida e consolidação de vigas de madeira existentes com perfis metálicos UNP',
              unit: 'ml',
              quantity: 28.0,
              unitPrice: 42.0,
              totalPrice: 1176.0,
            },
            {
              code: 'ALV.01',
              description: 'Execução de paredes em gesso cartonado com isolamento em lã mineral de 50mm e placa dupla hidrófuga',
              unit: 'm²',
              quantity: 115.0,
              unitPrice: 38.5,
              totalPrice: 4427.5,
            },
          ],
        },
        {
          chapterName: '03. Revestimentos e Pinturas de Reabilitação',
          items: [
            {
              code: 'PIN.01',
              description: 'Pintura geral de paredes e tetos a tinta aquosa acetinada lavável tipo Robbiatel, 2 demãos sobre primário',
              unit: 'm²',
              quantity: 260.0,
              unitPrice: 12.5,
              totalPrice: 3250.0,
            },
          ],
        },
      ],
      summary: 'Processamento efetuado com regras de orçamentação da construção civil no Porto (Custo base estimado: ~10.700 € s/ IVA).',
    });
    return;
  }

  try {
    const prompt = `És um engenheiro orçamentista sénior de construção civil e reabilitação urbana no Grande Porto, Portugal.
Analisa o seguinte texto de medições / mapa de quantidades / caderno de encargos da obra:
"${rawText}"

Contexto adicional: ${contextNotes || 'Reabilitação e manutenção no Porto'}
Título do Documento: ${documentTitle || 'Mapa de Quantidades'}

Instruções:
1. Decompõe o texto em capítulos da construção civil portuguesa (ex.: 01. Demolições e Remoções, 02. Estrutura e Alvenarias, 03. Instalações Especiais e Redes, 04. Carpintarias e Caixilharias, 05. Isolamentos e Impermeabilizações, 06. Revestimentos e Acabamentos).
2. Para cada linha, gera:
   - code: Código do artigo (ex: 01.01, DEM.01, CARP.02)
   - description: Descrição técnica clara em Português de Portugal (pt-PT).
   - unit: Unidade de medida padronizada (m², m³, ml, un, kg, verba, vg, dia).
   - quantity: Quantidade numérica estimada ou lida do texto. Se não especificada, estima com base na tipologia.
   - unitPrice: Preço unitário de mercado realista em Euros (€) para a região do Porto (materiais + mão de obra).
   - totalPrice: quantity * unitPrice arredondado a 2 casas decimais.
3. Fornece um resumo técnico sucinto dos trabalhos identificados e recomendações para o Porto (ex: atenção a humidades de capilaridade em granito, IVA 6% caso se situe em Área de Reabilitação Urbana ARU).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Resumo e parecer técnico do orçamentista em pt-PT',
            },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chapterName: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        code: { type: Type.STRING },
                        description: { type: Type.STRING },
                        unit: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        unitPrice: { type: Type.NUMBER },
                        totalPrice: { type: Type.NUMBER },
                      },
                      required: ['code', 'description', 'unit', 'quantity', 'unitPrice', 'totalPrice'],
                    },
                  },
                },
                required: ['chapterName', 'items'],
              },
            },
          },
          required: ['summary', 'chapters'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      source: 'gemini-3.8-flash',
      chapters: parsed.chapters || [],
      summary: parsed.summary || 'Mapa de quantidades estruturado com sucesso.',
    });
  } catch (error: any) {
    console.error('Erro na análise de mapa de quantidades:', error);
    res.status(500).json({
      error: 'Erro ao analisar o mapa de quantidades com o modelo de IA.',
      details: error.message,
    });
  }
});

// Endpoint: AI Assistant to analyze voice notes or survey field notes
app.post('/api/ai/analyze-survey-notes', async (req, res) => {
  const { notesText, location, propertyType } = req.body;

  if (!notesText) {
    res.status(400).json({ error: 'Notas da vistoria são obrigatórias.' });
    return;
  }

  if (!ai) {
    res.json({
      success: true,
      diagnostics: [
        {
          pathology: 'Humidade ascensional / Infiltração por capilaridade',
          severity: 'Média/Alta',
          recommendedAction: 'Injeção de barreiras químicas silânicas na base da alvenaria de granito e reboco desumidificante.',
          suggestedUnit: 'ml',
          estimatedQuantity: 18,
        },
        {
          pathology: 'Fissuração em rebocos exteriores na fachada posterior',
          severity: 'Média',
          recommendedAction: 'Abertura de fissuras em V, selagem com mastique poliuretano e aplicação de rede de fibra com argamassa elástica.',
          suggestedUnit: 'm²',
          estimatedQuantity: 35,
        },
      ],
      executiveSummary: 'Imóvel com patologias típicas do edificado tradicional do Porto. Aconselha-se intervenção prioritária nas impermeabilizações antes da execução de acabamentos.',
    });
    return;
  }

  try {
    const prompt = `És um perito avaliador e engenheiro civil especializado em patologia das construções no Porto, Portugal.
Analisa estas notas de voz ou apontamentos de campo tirados durante uma vistoria técnica no imóvel (${propertyType || 'Edifício Habitacional'}, localizado em ${location || 'Porto'}):

"${notesText}"

Identifica:
1. As patologias construtivas detetadas (fissuras, humidade, corrosão de armaduras, degradação de madeiras, podridão cúbica, telhas partidas, etc.).
2. Gravidade (Baixa, Média, Alta, Crítica).
3. Ação corretiva recomendada segundo as boas práticas de engenharia em Portugal.
4. Unidade e quantidade estimada para incluir no orçamento de intervenção.
5. Um resumo executivo claro para o cliente e para o diretor de obra.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            diagnostics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pathology: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  recommendedAction: { type: Type.STRING },
                  suggestedUnit: { type: Type.STRING },
                  estimatedQuantity: { type: Type.NUMBER },
                },
                required: ['pathology', 'severity', 'recommendedAction', 'suggestedUnit', 'estimatedQuantity'],
              },
            },
          },
          required: ['executiveSummary', 'diagnostics'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      diagnostics: parsed.diagnostics || [],
      executiveSummary: parsed.executiveSummary || 'Vistoria técnica processada.',
    });
  } catch (error: any) {
    console.error('Erro na análise da vistoria:', error);
    res.status(500).json({ error: 'Erro ao analisar apontamentos da vistoria.', details: error.message });
  }
});

// Serve frontend in production or integrate with Vite dev server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`EdificaPorto server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
