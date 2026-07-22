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
        console.error("AI Generation failed:", e);
        throw new Error(e.response?.data?.error || "All AI providers failed.");
    }
};
