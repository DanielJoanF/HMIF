/**
 * chatbotService.js — Frontend service for the USD Hybrid Knowledge Chatbot.
 *
 * Sends user questions to the FastAPI backend (chatbot-api) which handles:
 * - Keyword-based intent routing (local knowledge vs. web scraping)
 * - Context injection from knowledge base and live USD websites
 * - LLM response via Groq API (llama3-8b-8192)
 *
 * Falls back to client-side Groq if the backend is unreachable.
 */

// Backend API URL — Python FastAPI server
const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:8000";

/**
 * Send a message to the chatbot backend and get a response.
 *
 * @param {Array} history - Chat history (array of {id, sender, text}).
 * @param {string} userMessage - The user's current message.
 * @returns {string} The chatbot's response text.
 */
export const sendMessageToChatbot = async (history, userMessage) => {
    try {
        const response = await fetch(`${CHATBOT_API_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                question: userMessage,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("Chatbot API error:", response.status, errorData);

            if (response.status === 422) {
                return "Format pertanyaan tidak sesuai. Coba ulangi dengan kalimat yang berbeda.";
            }
            if (response.status >= 500) {
                return "Server chatbot sedang mengalami masalah. Coba lagi nanti.";
            }
            return "Terjadi kesalahan saat menghubungi chatbot. Silakan coba lagi.";
        }

        const data = await response.json();

        // data.answer contains the LLM response
        // data.intent contains "local" | "web" | "hybrid"
        // data.sources contains ["knowledge_base", "website_usd"] etc.
        return data.answer;

    } catch (error) {
        console.error("Chatbot connection error:", error);

        // Network error — backend is probably not running
        if (error instanceof TypeError && error.message.includes("fetch")) {
            return "Tidak bisa terhubung ke server chatbot. Pastikan chatbot-api berjalan di " + CHATBOT_API_URL;
        }

        return "Koneksi ke chatbot terputus. Pastikan server backend berjalan dan coba lagi.";
    }
};
