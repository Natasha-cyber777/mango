// Import the Genkit core libraries and plugins.
import {genkit, z} from "genkit";
import {googleAI, gemini15Flash} from "@genkit-ai/googleai";

// Cloud Functions for Firebase supports Genkit natively.
// The onCallGenkit function creates a callable function from a Genkit action.
import {onCallGenkit} from "firebase-functions/https";

// Genkit models generally depend on an API key. APIs should be stored in
// Cloud Secret Manager so that access to these sensitive values can be controlled.
import {defineSecret} from "firebase-functions/params";

const apiKey = defineSecret("GOOGLE_GENAI_API_KEY");

const ai = genkit({
  plugins: [
    // Load the Google AI plugin. You can optionally specify your API key
    // by passing in a config object; if you don't, the Google AI plugin uses
    // the value from the GOOGLE_GENAI_API_KEY environment variable.
    googleAI(),
  ],
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
const menuSuggestionFlow = ai.defineFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z
      .string()
      .describe("A restaurant theme")
      .default("seafood"),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (subject, {sendChunk}) => {
    // eslint-disable-next-line max-len
    const prompt = `Suggest an item for the menu of a ${subject} 
    themed restaurant`;
    const {response, stream} = ai.generateStream({
      model: gemini15Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    for await (const chunk of stream) {
      sendChunk(chunk.text);
    }

    // Handle the response from the model API.
    return (await response).text;
  }
);

export const menuSuggestion = onCallGenkit(
  {
    // Uncomment to enable AppCheck. This can reduce costs by ensuring
    // only your Verified app users can use your API.
    // enforceAppCheck: true,

    // Grant access to the API key to this function:
    secrets: [apiKey],
  },
  menuSuggestionFlow
);
