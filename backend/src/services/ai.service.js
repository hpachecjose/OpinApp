
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../utils/logger.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeFeedback(text) {
    if (!text || text.trim().length < 5) {
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Analise o seguinte feedback de cliente e retorne APENAS um objeto JSON (sem markdown, sem explicações).
        
        Feedback: "${text}"

        O JSON deve ter exatamente esta estrutura:
        {
            "sentimento": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "temas": ["tema1", "tema2"],
            "resumo": "Resumo curto em uma frase",
            "moderacao": boolean (true se houver ofensa/palavrão/ameaça, false se seguro)
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResult = response.text();

        // Limpar possíveis blocos de código markdown ```json ... ```
        const jsonString = textResult.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        logger.error("Erro na análise de IA:", error);
        return null; // Falha silenciosa para não travar o fluxo
    }
}
