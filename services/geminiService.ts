import { GoogleGenAI, Modality } from "@google/genai";
import { BrandKitData } from "../App";

// FIX: Initialize GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to a base64 generative part
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// For PosterStudio
export const generatePoster = async (imageFile: File, prompt: string, brandKit: BrandKitData | null) => {
    const imagePart = await fileToGenerativePart(imageFile);
    let fullPrompt = `Create a promotional poster using the provided image as the main visual element. The theme of the poster is: "${prompt}".`;

    if (brandKit) {
        if (brandKit.logoFile) {
            fullPrompt += ` Incorporate a space for a brand logo, typically in a corner or at the bottom.`;
        }
        if (brandKit.contactNumber) {
            fullPrompt += ` Include the contact number "${brandKit.contactNumber}" in a readable font.`;
        }
        if (brandKit.socialMedia) {
            fullPrompt += ` Include the social media handle "${brandKit.socialMedia}" near the contact information.`;
        }
    }
    
    fullPrompt += ` The output must be a high-quality poster image. Do not just return the original image.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, { text: fullPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error('No poster image was generated.');
};

// For ImagenGenerator
export const generateWithImagen = async (prompt: string, aspectRatio: string) => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const suggestPrompt = async () => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Suggest a creative and visually interesting prompt for an AI image generator. The prompt should be short, just one sentence, and highly descriptive.',
    });
    return response.text.trim();
};

// For ImageAnalyzer
export const analyzeImage = async (file: File) => {
    const imagePart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: "Describe this image in detail, covering the main subject, setting, colors, and mood." }] },
    });
    return response.text;
};

// For ImageAnalyzer & AudioTranscriber
export const generateSpeech = async (text: string) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.[0];
    if (audioPart && audioPart.inlineData) {
        return {
            audioData: audioPart.inlineData.data,
            mimeType: audioPart.inlineData.mimeType,
        };
    }
    throw new Error('Failed to generate speech.');
};

// For AudioTranscriber
export const transcribeAudio = async (file: File) => {
    const audioPart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        contents: { parts: [audioPart, {text: "Transcribe the following audio."}] },
    });
    return response.text;
};

// For DesignReplicator
export const replicateDesign = async (referenceFile: File, prompt: string) => {
    const imagePart = await fileToGenerativePart(referenceFile);
    const fullPrompt = `Replicate the style, layout, color palette, and overall design of the provided reference image. However, replace the main subject or content with the following new subject: "${prompt}". The new generated image should look like it's part of the same design family as the reference image.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, { text: fullPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error('No image was generated for design replication.');
};
