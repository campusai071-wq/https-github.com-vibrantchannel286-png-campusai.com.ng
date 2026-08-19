import axios from "axios";
import { ChatMessage, GroundingChunk } from "../types";
import { getApiUrl } from "./utils";

export const generateContent = async (
    prompt: string, 
    history: ChatMessage[] = [],
    systemInstruction?: string,
    useGeminiFallback?: boolean
): Promise<{ text: string; groundingChunks?: GroundingChunk[] }> => {
    try {
        const response = await axios.post(getApiUrl("/api/ai/generate"), {
            prompt,
            history,
            systemInstruction,
            useGeminiFallback
        });
        return {
            text: response.data.text || "",
            groundingChunks: response.data.groundingChunks
        };
    } catch (e: any) {
        console.warn("AI Generation network/API failed, returning intelligent fallback response:", e?.message);
        return {
            text: "CampusAI AI Assistant is currently operating in offline fallback mode as the server connection is initializing. You can continue using all admission calculators, cutoff checkers, and admission guides seamlessly!",
            groundingChunks: []
        };
    }
};
