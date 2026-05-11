import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BrandImage {
  id: string;
  medium: "Billboard" | "Newspaper" | "Social Post";
  url: string;
  prompt: string;
}

export async function generateProductDescription(userDescription: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      You are a world-class advertising creative. 
      The user has described a product: "${userDescription}".
      Create a highly detailed, photorealistic visual description of this product that can be used to maintain consistency across multiple images.
      Focus on texture, material, color, branding logo (describe it if not provided), and specific design elements.
      CRITICAL: Do NOT include any people in the description.
      Keep the description concise but visually rich (about 3-4 sentences).
    `,
  });

  return response.text ?? "";
}

export async function generateBrandImage(
  productVisualDescription: string,
  medium: "Billboard" | "Newspaper" | "Social Post"
): Promise<string> {
  let mediumContext = "";
  let aspectRatio: "1:1" | "16:9" | "4:3" | "3:4" | "9:16" = "1:1";

  switch (medium) {
    case "Billboard":
      mediumContext = "An outdoor giant billboard in a clean urban setting, daylight, minimalist background, high angle. The billboard features an artistic advertisement for the product.";
      aspectRatio = "16:9";
      break;
    case "Newspaper":
      mediumContext = "An elegant, high-end newspaper layout on a clean marble table. The newspaper page features a prominent display ad for the product with sophisticated typography. Monochrome or vintage color palette.";
      aspectRatio = "4:3";
      break;
    case "Social Post":
      mediumContext = "A sleek, modern social media post layout, centered composition, soft studio lighting, perfectly minimalist background. High-end product photography style.";
      aspectRatio = "1:1";
      break;
  }

  const prompt = `
    HIGH-END COMMERCIAL PHOTOGRAPHY.
    PRODUCT: ${productVisualDescription}
    ENVIRONMENT: ${mediumContext}
    COMPOSITION: Clean, centered, balanced, minimalist.
    STYLES: Professional studio lighting, sharp focus, vibrant yet sophisticated colors.
    STRICT NEGATIVE CONSTRAINT: NO HUMANS. NO PEOPLE. NO HANDS. NO MANNEQUINS. NO PART OF A PERSON. 
    The product must be the sole focus of the image.
    If it is a billboard, show the urban environment but with NO pedestrians or people in cars.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
}
