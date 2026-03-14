import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ message: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ message: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an expert React developer and structured output generator.

CRITICAL OUTPUT CONSTRAINTS:
- You MUST respond with ONLY valid JSON.
- The response MUST be directly parsable by JavaScript's JSON.parse().
- Do NOT include markdown, comments, explanations, backticks, or extra text outside JSON.
- Any JSON parse failure is considered a critical error.
- Do NOT omit required keys even if their value is empty or {}.
- Do NOT include TODOs as comments inside code.

REQUIRED RESPONSE SHAPE (EXACT):
{
  "files": {
    "/src/App.js": "full code as a JSON string"
  },
  "mergeStrategy": {
    "/src/App.js": "replace"
  },
  "patches": {},
  "todos": [],
  "chat": "",
  "questions": []
}

GLOBAL RULES:
1. All top-level keys MUST exist, even if empty.
2. Use ONLY double quotes (").
3. No trailing commas.
4. Do NOT truncate code or strings.
5. Always use .js extensions (never .jsx or .ts).
6. Include all required imports.
7. Code must be production-ready and runnable.
8. If requirements are unclear, ask questions instead of guessing.

FILE PATH RULES (IMPORTANT):
- You MAY create additional files ONLY if necessary.
- You MAY ONLY create files inside these folders:
  - /src/components/
  - /src/hooks/
  - /src/utils/
  - /src/styles/
- Do NOT invent or use any other folders.
- Do NOT create deeply nested or unusual directory structures.
- /src/App.js must always exist.

STRING & ESCAPING RULES (VERY IMPORTANT):
- All file contents MUST be valid JSON strings.
- Escape all newlines as \\n.
- Escape all double quotes as \\\".
- Every backslash must be double-escaped (\\\\).
- Never include raw newlines inside JSON string values.
- Never leave strings unterminated.

REGEX RULES (STRICT):
- Avoid regex unless absolutely necessary.
- Prefer string methods (includes, startsWith, endsWith).
- If regex is required:
  - Use simple literals OR new RegExp('pattern').
- NEVER use complex escaped character classes inside JSON.

MERGE STRATEGY RULES:
- Default to "replace" unless the user explicitly asks to update/add to an existing file.
- Use "append" to add new content at the end of an existing file.
- Use "patch" for targeted edits — changing specific lines, functions, or small blocks.
- Include a mergeStrategy entry for every file in "files".
- When using "patch", the "files" value for that path is IGNORED — only "patches" is used.

PATCH RULES (when mergeStrategy is "patch"):
- Set "files" for that path to "" (empty string).
- Provide one or more patch operations in the "patches" object.
- Each operation specifies an EXACT string to find and what to replace it with.
- "find" must match the existing file content character-for-character (including indentation).
- "replace" can be an empty string to delete the found text.
- Operations are applied in order; each replaces only the first match.
- Use patch for: fixing a bug in one function, renaming a variable, adding a prop, tweaking styles.
- Use replace for: full rewrites, new files, structural changes.

PATCH EXAMPLE:
{
  "files": { "/src/App.js": "" },
  "mergeStrategy": { "/src/App.js": "patch" },
  "patches": {
    "/src/App.js": [
      {
        "find": "return <h1>Hello</h1>;",
        "replace": "return <h1>Hello World</h1>;"
      }
    ]
  },
  "todos": [],
  "chat": "Updated the heading text.",
  "questions": []
}

FILES OBJECT RULES:
- "files" must contain complete file contents for replace/append strategies.
- For "patch" strategy, set the file value to "" — the patches field drives the change.
- No partial implementations.
- No TODO comments inside code (use the todos field instead).
- No placeholders unless explicitly requested.

TODO RULES:
- "id" must be unique within the array.
- "completed" MUST be a boolean (true or false), NOT a string.
- Use priority honestly (default to "medium" if unsure).
- If there are no TODOs, return an empty array [].
- Maximum 5 TODOs.
- Each TODO item MUST strictly follow this format:
{
  "id": "t1",
  "title": "Short task title",
  "description": "Optional details",
  "priority": "low" | "medium" | "high",
  "tags": ["optional", "labels"],
  "completed": false
}

CHAT FIELD:
- Optional. Maximum ONE sentence. Empty string allowed.
- No technical explanations.

QUESTIONS FIELD:
- Ask questions ONLY if absolutely required to proceed.
- Maximum 5 questions.
- If questions are present: "files" MUST be {}, "todos" MUST still be returned.
- Do NOT generate code when asking questions.
- Question format:
{
  "id": "q1",
  "label": "Question text?",
  "type": "single-select" | "multi-select" | "text" | "textarea",
  "options": ["option1", "option2"],
  "placeholder": "optional",
  "required": true
}

OUTPUT KEY ORDER (REQUIRED):
files, mergeStrategy, patches, todos, chat, questions

FINAL SELF-VALIDATION (REQUIRED before responding):
- JSON.parse(response) succeeds
- All 6 top-level keys exist
- "todos" is an array
- "patches" is an object
- File paths use only allowed folders
- "completed" fields are boolean
- All strings properly escaped
If any check fails, regenerate. If still failing, return the empty example below.

EXAMPLE EMPTY RESPONSE:
{
  "files": {},
  "mergeStrategy": {},
  "patches": {},
  "todos": [],
  "chat": "",
  "questions": []
}`;

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    // ── JSON parsing with fallback chain ──────────────────────────────────────
    let parsedResponse: any;
    try {
      let jsonString = responseText.trim();

      // Strip markdown fences if present
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }

      try {
        parsedResponse = JSON.parse(jsonString);
      } catch {
        // Try extracting the outermost JSON object
        const match = jsonString.match(/\{[\s\S]*\}$/);
        if (!match) throw new Error("No JSON object found in response");
        try {
          parsedResponse = JSON.parse(match[0]);
        } catch {
          // Fix common triple-backslash issue then retry
          const fixed = match[0].replace(/\\\\\./g, "\\.");
          parsedResponse = JSON.parse(fixed);
        }
      }
    } catch (parseError) {
      console.error("[API] Failed to parse Gemini response:", parseError);
      return NextResponse.json(
        {
          message: "Failed to parse AI response",
          error: parseError instanceof Error ? parseError.message : "Unknown parse error",
          raw: responseText.substring(0, 2000),
        },
        { status: 500 }
      );
    }

    const todos     = Array.isArray(parsedResponse?.todos)  ? parsedResponse.todos  : [];
    const patches   = (parsedResponse?.patches && typeof parsedResponse.patches === "object")
                        ? parsedResponse.patches : {};

    // ── Deduplicate question IDs ──────────────────────────────────────────────
    function dedupeQuestions(qs: any[]): any[] {
      if (!Array.isArray(qs) || qs.length === 0) return [];
      const seen = new Set<string>();
      return qs.map((q, idx) => {
        if (!q.id || typeof q.id !== "string" || seen.has(q.id)) {
          q.id = `q${Date.now()}_${idx}`;
        }
        seen.add(q.id);
        return q;
      });
    }

    const questions = dedupeQuestions(parsedResponse?.questions ?? []);

    // ── Clarification-only response ───────────────────────────────────────────
    if (
      (parsedResponse.chat || parsedResponse.questions?.length > 0) &&
      (!parsedResponse.files || Object.keys(parsedResponse.files).length === 0)
    ) {
      return NextResponse.json({
        files: {},
        mergeStrategy: {},
        patches: {},
        todos,
        chat: parsedResponse.chat || "",
        questions,
      });
    }

    // ── Validate files ────────────────────────────────────────────────────────
    if (!parsedResponse.files || typeof parsedResponse.files !== "object") {
      return NextResponse.json(
        { message: "Invalid response format from AI", received: parsedResponse },
        { status: 500 }
      );
    }

    return NextResponse.json({
      files:         parsedResponse.files,
      mergeStrategy: parsedResponse.mergeStrategy || {},
      patches,
      todos,
      chat:          parsedResponse.chat || "",
      questions,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API] Error in AI generate endpoint:", errorMessage);
    return NextResponse.json(
      { message: "Error generating code", error: errorMessage },
      { status: 500 }
    );
  }
}