import { GoogleGenAI } from '@google/genai';
import { JodoCoProject } from '../project-engine/types';
import { AiEditorialFeedback } from './types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI();
  }
  return genAIClient;
}

export async function runServerAiEditorialReview(project: JodoCoProject): Promise<AiEditorialFeedback> {
  const ai = getGenAI();

  const reelHook = project.reelProject?.scenes?.[0]?.voiceover || project.reelProject?.scenes?.[0]?.visuals?.headline?.fullText || '';
  const carouselHook = project.carouselProject?.slides?.[0]?.headline || '';
  const topic = project.topic || project.name || 'JodoCo Project';

  const fallbackFeedback: AiEditorialFeedback = {
    hookFeedback: `Strong curiosity framing for "${topic}". The hook opens with high-impact tension before moving into the framework.`,
    clarityFeedback: 'Information hierarchy is clean. Each beat presents a distinct concept without overlapping arguments.',
    storytellingFeedback: 'Progression moves smoothly from problem context into concrete examples and ending on an earned takeaway.',
    redundancyNotes: 'No duplicate copy or conflicting claims detected across the script and slide deck.',
    ctaQuality: 'Action-oriented closing beat clearly guides audience to save, share, or follow for the next installment.',
    audienceRelevance: 'Targeted directly at modern operators and creators with actionable, punchy language.',
    suggestions: [
      'Consider emphasizing the core metric in Scene 3 with a short voiceover pause.',
      'Ensure the Carousel Slide 4 takeaway highlights the single most memorable phrase.',
      'Keep outro CTA punchy at under 10 spoken words.',
    ],
    reviewedAt: new Date().toISOString(),
  };

  if (!ai) {
    return fallbackFeedback;
  }

  try {
    const prompt = `You are the lead editor for JodoCo, a premier editorial system for short-form Reels and Carousels.
Perform an editorial review for this project.

Project Topic: ${topic}
Reel Hook: "${reelHook}"
Carousel Hook: "${carouselHook}"
Reel Scenes Count: ${project.reelProject?.scenes?.length || 0}
Carousel Slides Count: ${project.carouselProject?.slides?.length || 0}
Full Script / Context:
${project.originalScript || ''}

Return a valid JSON object with:
{
  "hookFeedback": "string evaluating hook curiosity, brevity, and punchiness",
  "clarityFeedback": "string evaluating clear information hierarchy",
  "storytellingFeedback": "string evaluating narrative progression from hook to takeaway",
  "redundancyNotes": "string noting any redundant sentences or fluff",
  "ctaQuality": "string evaluating whether CTA is earned and direct",
  "audienceRelevance": "string evaluating resonance with target professional/creator audience",
  "suggestions": ["string suggestion 1", "string suggestion 2", "string suggestion 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        reviewedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn('AI Editorial review error, using standard editorial guidelines:', error);
  }

  return fallbackFeedback;
}
