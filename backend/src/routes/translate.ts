import { Router, Request, Response } from "express";
import { z } from "zod";
import { translateRateLimiter } from "../middleware/rateLimiter";
import { logger } from "../middleware/logger";

export const translateRouter = Router();

const SUPPORTED_LANGUAGES = ["en", "fr", "es", "de", "it", "pt", "ru", "ja", "zh", "ar"] as const;

// Input validation schema
const translateSchema = z.object({
  text: z
    .string()
    .min(1, "Text cannot be empty")
    .max(5000, "Text too long (max 5000 characters)"),
  targetLanguage: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({ message: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(", ")}` }),
  }),
});

translateRouter.post("/", translateRateLimiter, async (req: Request, res: Response) => {
  // Validate input
  const parsed = translateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { text, targetLanguage } = parsed.data;

  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "auto");
    url.searchParams.set("tl", targetLanguage);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", text);

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) {
      throw new Error(`Translation service returned ${response.status}`);
    }

    const data = await response.json();
    const translatedText = (data[0] as [string, string][])
      ?.map(([chunk]) => chunk)
      .join("") ?? text;
    const detectedLanguage: string = data[2] ?? "unknown";

    logger.info("Translation successful", {
      targetLanguage,
      detectedLanguage,
      textLength: text.length,
    });

    return res.json({
      translation: translatedText,
      detectedLanguage,
      original: text,
    });
  } catch (err) {
    logger.error("Translation failed", { error: (err as Error).message });
    return res.status(502).json({ error: "Translation service unavailable" });
  }
});
