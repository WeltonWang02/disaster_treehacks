import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@/app/services/llm';
import { IMAGE_CLASSIFICATION_PROMPT } from '@/app/prompts';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const images = formData.getAll('images');

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Convert images to base64
    const imagePromises = images.map(async (image: any) => {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      return `data:${image.type};base64,${buffer.toString('base64')}`;
    });

    const base64Images = await Promise.all(imagePromises);
    
    // Create prompt with images
    const promptWithImages = {
      role: "user",
      content: [
        { type: "text", text: IMAGE_CLASSIFICATION_PROMPT },
        ...base64Images.map(img => ({
          type: "image_url",
          image_url: img
        }))
      ]
    };

    const llmService = LLMService.getInstance();
    const response = await llmService.getResponse(JSON.stringify(promptWithImages));

    return NextResponse.json({ result: response });
  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: 'Error processing images' },
      { status: 500 }
    );
  }
} 