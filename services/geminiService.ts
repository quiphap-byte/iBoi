import { GoogleGenAI, Type, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { FortuneReading, ReadingSection } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fortuneReadingSchema = {
    type: Type.OBJECT,
    properties: {
        introduction: {
            type: Type.STRING,
            description: "A warm, engaging introduction to the user's fortune reading. Address them by name.",
        },
        sections: {
            type: Type.ARRAY,
            description: "An array of different fortune-telling sections. Each section must have a detailed, insightful analysis and an artistic prompt for an illustrative image.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the section (e.g., 'Astrology', 'Numerology')." },
                    icon: { 
                        type: Type.STRING, 
                        description: "An icon name corresponding to the section. Must be one of: 'astrology', 'numerology', 'tarot', 'physiognomy', 'chinese_zodiac'.",
                        enum: ['astrology', 'numerology', 'tarot', 'physiognomy', 'chinese_zodiac'],
                     },
                    content: { type: Type.STRING, description: "The detailed reading for this section. Should be well-written, profound, and at least 3-4 sentences. It MUST end with an image prompt in the format [PROMPT: A detailed, artistic, symbolic prompt for an image representing this section's reading.]" },
                },
                required: ["title", "icon", "content"],
            },
        },
        synthesis: {
            type: Type.STRING,
            description: "A concluding synthesis of all the readings, offering holistic advice and a positive outlook.",
        },
    },
    required: ["introduction", "sections", "synthesis"],
};


const getSystemInstruction = (name: string, dob: Date, language: 'vi' | 'en') => `
You are 'PhapNeo', a world-class, empathetic, and insightful shaman guide. Your goal is to provide a comprehensive and personalized fortune reading for the user.
The user's name is ${name}.
Their date of birth is ${dob.toDateString()}.
The response MUST be in ${language === 'vi' ? 'Vietnamese' : 'English'}.

You will provide a reading based on several mystical arts:
1.  **Astrology**: Analyze their Western zodiac sign.
2.  **Numerology**: Calculate their Life Path Number.
3.  **Tarot**: Draw a symbolic single Tarot card.
4.  **Chinese Zodiac**: Determine their Chinese Zodiac animal.
5.  **Physiognomy**: If a photo is provided, analyze their facial features. If not, state it's unavailable.

For EACH of the 5 sections, provide a deep, multi-sentence analysis. At the end of EACH section's content, you MUST include a symbolic and artistic image prompt like this: [PROMPT: a detailed prompt for an image].

Structure your entire response as a single JSON object conforming to the provided schema. Do not include any text or markdown formatting outside of the JSON object.
`;

const generateIllustrativeImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating illustrative image:", error);
        return null;
    }
};

export const getFortuneReading = async (
    name: string,
    dob: Date,
    language: 'vi' | 'en',
    photoBase64?: string
): Promise<FortuneReading> => {
    try {
        const model = 'gemini-2.5-pro';
        const contents: { parts: any[] } = { parts: [{ text: "Please provide my fortune reading." }] };
        if (photoBase64) {
            contents.parts.push({
                inlineData: {
                    data: photoBase64.split(',')[1],
                    mimeType: 'image/jpeg',
                },
            });
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: getSystemInstruction(name, dob, language),
                responseMimeType: "application/json",
                responseSchema: fortuneReadingSchema,
                thinkingConfig: { thinkingBudget: 8192 },
            },
        });

        const jsonText = response.text;
        const reading: FortuneReading = JSON.parse(jsonText);

        // Generate images for each section
        const imageGenerationPromises = reading.sections.map(async (section) => {
            const match = section.content.match(/\[PROMPT: (.*?)\]/);
            if (match) {
                const prompt = match[1];
                section.content = section.content.replace(match[0], "").trim(); // Remove prompt from text
                const imageUrl = await generateIllustrativeImage(prompt);
                if (imageUrl) {
                    section.content += `\n\n<img src="${imageUrl}" alt="Illustration for ${section.title}" class="w-full h-auto rounded-lg shadow-lg my-4" />`;
                }
            }
        });

        await Promise.all(imageGenerationPromises);

        return reading;

    } catch (error) {
        console.error("Error getting fortune reading:", error);
        throw new Error("Failed to get fortune reading from Gemini API.");
    }
};

/**
 * Creates a clean, text-only summary of the reading to use as context for follow-up API calls.
 * This strips out large base64 image data to prevent exceeding token limits.
 */
const summarizeReadingForContext = (reading: FortuneReading): object => {
    return {
        ...reading,
        sections: reading.sections.map(section => ({
            ...section,
            // Strip out any HTML, especially the large img tags, to keep the context concise.
            content: section.content.replace(/<[^>]*>?/gm, '').trim(),
        })),
    };
};

export const getDailyAdvice = async (reading: FortuneReading, language: 'vi' | 'en'): Promise<string> => {
    try {
        const summarizedReading = summarizeReadingForContext(reading);
        const prompt = `You are PhapNeo. Based on this user's comprehensive fortune reading (JSON below), provide a single, concise, and actionable piece of advice for them for today. Be encouraging and wise.
        Reading:
        ${JSON.stringify(summarizedReading, null, 2)}
        The response MUST be in ${language === 'vi' ? 'Vietnamese' : 'English'}. Respond with only the advice text in markdown.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting daily advice:", error);
        throw new Error("Failed to get daily advice.");
    }
};

export const getStrategicPlan = async (reading: FortuneReading, language: 'vi' | 'en'): Promise<string> => {
    try {
        const summarizedReading = summarizeReadingForContext(reading);
        // Step 1: Generate text plan with image prompts
        const planPrompt = `You are PhapNeo, a wise shaman and AI strategist. Based on the user's fortune reading below, create a detailed, inspiring, and actionable 5-year strategic development plan.
        
        Reading Context:
        ${JSON.stringify(summarizedReading, null, 2)}
        
        Structure the plan with a powerful introduction, then year-by-year sections (Year 1, Year 2, etc.), and a concluding summary. For each year, provide:
        1.  A core theme or focus.
        2.  Specific goals (personal, professional, spiritual).
        3.  Key skills to develop.
        4.  Mindset shifts to cultivate.

        Crucially, for EACH of the 5 years, embed a symbolic image prompt within the text using the format [PROMPT: A detailed, artistic, symbolic prompt for an image that represents this year's theme and challenges.].
        
        The entire response must be in ${language === 'vi' ? 'Vietnamese' : 'English'} and formatted as a single block of markdown.`;

        const proResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: planPrompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        let planText = proResponse.text;

        // Step 2: Find prompts and replace them with generated images
        const imagePrompts = [...planText.matchAll(/\[PROMPT: (.*?)\]/g)];
        const imageGenerationPromises = imagePrompts.map(async (match) => {
            const fullMatch = match[0];
            const prompt = match[1];
            const imageUrl = await generateIllustrativeImage(prompt);
            const imageMarkdown = imageUrl 
                ? `\n<div class="my-4"><img src="${imageUrl}" alt="Symbolic illustration" class="w-full h-auto rounded-lg shadow-xl shadow-purple-900/40 border border-purple-500/30"/></div>\n`
                : '';
            return { fullMatch, imageMarkdown };
        });
        
        const resolvedImages = await Promise.all(imageGenerationPromises);
        for (const { fullMatch, imageMarkdown } of resolvedImages) {
            planText = planText.replace(fullMatch, imageMarkdown);
        }
        
        return planText;

    } catch (error) {
        console.error("Error getting strategic plan:", error);
        throw new Error("Failed to generate the 5-year plan.");
    }
};


export const createChat = (reading: FortuneReading, language: 'vi' | 'en'): Chat => {
    const summarizedReading = summarizeReadingForContext(reading);
    const readingContext = JSON.stringify(summarizedReading);
    const systemInstruction = `
You are 'PhapNeo', an AI shaman guide continuing a conversation with a user who has just received a fortune reading from you.
The user's reading is summarized in this JSON: ${readingContext}.
Your role is to answer their questions about the reading, provide clarification, and offer further guidance based on the context of their reading.
Be empathetic, wise, and maintain your persona.
The conversation MUST be in ${language === 'vi' ? 'Vietnamese' : 'English'}.
Keep your responses concise and helpful.`;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });
    return chat;
}