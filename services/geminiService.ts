import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

// Function to generate a poster by either creating a new image or editing an existing one
export const generatePoster = async (prompt: string, imageFile?: File | null): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  const parts: any[] = [{ text: prompt }];

  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    parts.unshift(imagePart); // For editing, image should come first
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
  }

  throw new Error("No image was generated.");
};

// Function to replicate the design of a reference image with new content
export const replicateDesign = async (referenceImageFile: File, newContentPrompt: string): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    const imagePart = await fileToGenerativePart(referenceImageFile);
    const textPrompt = `Analyze the provided image's style, layout, color palette, and overall aesthetic. Replicate that design to create a new image. However, replace the original subject and text with the following new content: "${newContentPrompt}". The goal is a new poster that looks like it was designed by the same artist as the original, but for this new purpose.`;

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, { text: textPrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }

    throw new Error("No image was generated for the design replication.");
};


// Function to generate an image with Imagen
export const generateWithImagen = async (prompt: string, aspectRatio: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// Function to suggest a prompt for image generation
export const suggestPrompt = async (): Promise<string> => {
    const prompt = "Suggest a creative and visually interesting prompt for an AI image generator. The prompt should be short, just the prompt itself, without any introductory text.";
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim().replace(/^"|"$/g, ''); // Clean up quotes
};

// Function to analyze an image and return a description
export const analyzeImage = async (imageFile: File): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const imagePart = await fileToGenerativePart(imageFile);
    const promptPart = { text: "Describe this image in detail." };

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, promptPart] },
    });

    return response.text;
};

// Function to generate speech from text (TTS)
export const generateSpeech = async (text: string): Promise<{ audioData: string, mimeType: string }> => {
    const model = 'gemini-2.5-flash-preview-tts';
    const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        return {
            audioData: part.inlineData.data,
            mimeType: part.inlineData.mimeType
        };
    }

    throw new Error("Failed to generate audio.");
};


// Function to transcribe audio to text
export const transcribeAudio = async (audioFile: File): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const audioPart = await fileToGenerativePart(audioFile);
    const promptPart = { text: "Transcribe this audio." };
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [audioPart, promptPart] },
    });
    
    return response.text;
};
