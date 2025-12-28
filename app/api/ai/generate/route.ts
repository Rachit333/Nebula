// import {
//   GoogleGenerativeAI,
//   HarmCategory,
//   HarmBlockThreshold,
// } from "@google/generative-ai";
// import { NextRequest, NextResponse } from "next/server";

// // Initialize Gemini API
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { prompt } = body;

//     console.log("🔵 [API] AI Generate endpoint called");
//     console.log("📝 [API] Prompt received:", prompt.substring(0, 100) + "...");

//     if (!prompt || !prompt.trim()) {
//       console.log("❌ [API] Empty prompt");
//       return NextResponse.json(
//         { message: "Prompt is required" },
//         { status: 400 }
//       );
//     }

//     if (!process.env.GEMINI_API_KEY) {
//       console.log("❌ [API] GEMINI_API_KEY not configured");
//       return NextResponse.json(
//         { message: "GEMINI_API_KEY is not configured" },
//         { status: 500 }
//       );
//     }

//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash",
//     });

//     // Create a detailed prompt that instructs Gemini to return structured code
//     //     const systemPrompt = `You are an expert React developer. Generate clean, well-structured React code based on user requests.

//     // CRITICAL: You MUST respond with ONLY valid JSON that can be parsed by JavaScript's JSON.parse(). Do NOT include markdown, comments, or extra text.

//     // Your response MUST be exactly this JSON structure:
//     // {
//     //   "files": {
//     //     "/src/App.js": "code content as a string"
//     //   },
//     //   "mergeStrategy": {
//     //     "/src/App.js": "replace"
//     //   },
//     //   "chat": "optional message",
//     //   "questions": []
//     // }

//     // Rules for generating code strings:
//     // - IMPORTANT: For regex patterns in JavaScript code, use simple string concatenation or write regex safely
//     // - Example GOOD: const pattern = new RegExp('^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$');
//     // - Example GOOD: const pattern = /^[\\w.-]+@[\\w.-]+\\.\\w+$/; (already valid in JS)
//     // - Example BAD: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ (backslash escaping gets confusing in JSON)
//     // - In JSON strings, EVERY backslash must be escaped: \\\\ becomes \\\\\\\\ in the JSON value
//     // - Prefer email validation using a simpler approach: email.includes('@') && email.includes('.')
//     // - Escape double quotes in strings: use \\"
//     // - Escape newlines: use \\n (not actual newlines in the JSON value)
//     // - JSON string values must be complete and valid
//     // - Do NOT truncate code or end in the middle of a string

//     // File Structure:
//     // 1. "files": Required object with file paths as keys and complete code as string values
//     // 2. "mergeStrategy": Object specifying "replace" or "append" for each file (optional, defaults to "replace")
//     // 3. "chat": Optional brief message explaining your approach (one sentence max when with code)
//     // 4. "questions": Optional array of up to 5 clarifying questions when you need more info

//     // Question Format (if needed):
//     // {
//     //   "id": "q1",
//     //   "label": "Question text here?",
//     //   "type": "single-select",
//     //   "options": ["option1", "option2"],
//     //   "placeholder": "optional",
//     //   "required": true
//     // }

//     // Valid question types:
//     // - "single-select": User picks one from a list
//     // - "multi-select": User picks multiple from a list
//     // - "text": Single line text
//     // - "textarea": Multi-line text

//     // Rules:
//     // 1. Always use .js extension
//     // 2. Include all necessary imports
//     // 3. Make code production-ready
//     // 4. Return ONLY valid JSON, nothing else
//     // 5. Ensure all code strings are complete and properly escaped
//     // 6. Do NOT use markdown backticks or code blocks
//     // 7. Do NOT include explanations outside the JSON
//     // 8. When using regex, prefer simple patterns or string methods to avoid escaping issues`;

//     const systemPrompt = `You are an expert React developer and structured output generator.

// CRITICAL OUTPUT CONSTRAINTS:
// - You MUST respond with ONLY valid JSON.
// - The response MUST be directly parsable by JavaScript's JSON.parse().
// - Do NOT include markdown, comments, explanations, backticks, or extra text outside JSON.
// - Any JSON parse failure is considered a critical error.
// - Do NOT omit required keys even if their value is empty or {}.

// REQUIRED RESPONSE SHAPE (EXACT):
// {
//   "files": {
//     "/src/App.js": "full code as a JSON string"
//   },
//   "mergeStrategy": {
//     "/src/App.js": "replace"
//   },
//   "todos": [],
//   "chat": "",
//   "questions": []
// }

// GLOBAL RULES:
// 1. All top-level keys MUST exist, even if empty.
// 2. Use ONLY double quotes (").
// 3. No trailing commas.
// 4. Do NOT truncate code or strings.
// 5. Always use .js extensions (never .jsx or .ts).
// 6. Include all required imports.
// 7. Code must be production-ready and runnable.
// 8. If requirements are unclear, ask questions instead of guessing.

// FILE PATH RULES (IMPORTANT):
// - You MAY create additional files ONLY if necessary.
// - You MAY ONLY create files inside these folders:
//   - /src/components/
//   - /src/hooks/
//   - /src/utils/
//   - /src/styles/
// - Do NOT invent or use any other folders.
// - Do NOT create deeply nested or unusual directory structures.
// - /src/App.js must always exist.

// STRING & ESCAPING RULES (VERY IMPORTANT):
// - All file contents MUST be valid JSON strings.
// - Escape all newlines as \\n.
// - Escape all double quotes as \\\".
// - Every backslash must be double-escaped (\\\\).
// - Never include raw newlines inside JSON string values.
// - Never leave strings unterminated.

// REGEX RULES (STRICT):
// - Avoid regex unless absolutely necessary.
// - Prefer string methods (includes, startsWith, endsWith).
// - If regex is required:
//   - Use simple literals OR new RegExp('pattern').
// - NEVER use complex escaped character classes inside JSON.
// - GOOD:
//   - email.includes('@') && email.includes('.')
//   - new RegExp('^[a-z0-9]+$', 'i')
// - BAD:
//   - /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ (escape-prone)

// FILES OBJECT RULES:
// - "files" must contain complete file contents.
// - No partial implementations.
// - No TODO comments inside code (use the todos field instead).
// - No placeholders unless explicitly requested.

// MERGE STRATEGY RULES:
// - Default to "replace" unless explicitly instructed otherwise.
// - Include mergeStrategy entries for every file returned.

// TODO RULES:
// - "id" must be unique within the array.
// - "completed" MUST be a boolean (true or false), NOT a string.
// - Use priority honestly (default to "medium" if unsure).
// - If there are no TODOs, return an empty array [].
// - Use this field to return pending work, limitations, future improvements, or skipped edge cases.
// - Do NOT include TODOs as comments inside code.
// - Each TODO item MUST strictly follow this format (STRICT):

// {
//   "id": "string",
//   "title": "Short task title",
//   "description": "Optional details about the task",
//   "priority": "low" | "medium" | "high",
//   "tags": ["optional", "labels"],
//   "completed": true | false
// }

// CHAT FIELD:
// - Optional.
// - Maximum ONE sentence.
// - Empty string allowed.
// - No technical explanations.

// QUESTIONS FIELD:
// - Ask questions ONLY if absolutely required to proceed.
// - Maximum 5 questions.
// - If questions are present:
//   - "files" MUST be {}
//   - "todos" MUST still be returned (can be empty)
//   - Do NOT generate code yet.

// QUESTION FORMAT (STRICT):
// {
//   "id": "q1",
//   "label": "Question text?",
//   "type": "single-select" | "multi-select" | "text" | "textarea",
//   "options": ["option1", "option2"],
//   "placeholder": "optional",
//   "required": true
// }

// FINAL CHECK BEFORE RESPONDING:
// - JSON.parse(response) must succeed.
// - All required top-level keys exist.
// - File paths comply with the allowed folder list.
// - "completed" fields are boolean.
// - All strings are properly escaped.
// - Output ONLY the JSON object.

// MANDATORY FIELD ENFORCEMENT:
// - The "todos" field is REQUIRED in ALL responses.
// - Even when empty, it MUST be returned as: "todos": [].
// - Omitting "todos" is a HARD FAILURE and INVALID RESPONSE.

// SELF-VALIDATION STEP (REQUIRED):
// Before responding, verify:
// - "todos" key exists at top level
// - "todos" is an array (empty or populated)
// If any check fails, regenerate the response.

// If any required top-level key is missing, regenerate the response once.
// If it still fails, respond with an empty JSON object {}.


// OUTPUT ORDER RULE:
// - Top-level keys MUST appear in this order:
// files, mergeStrategy, todos, chat, questions

// EXAMPLE EMPTY RESPONSE (STRICT):
// {
//   "files": {},
//   "mergeStrategy": {},
//   "todos": [],
//   "chat": "",
//   "questions": []
// }
// `;

//     const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

//     console.log("🤖 [API] Calling Gemini API with model: gemini-2.5-flash");
//     const result = await model.generateContent(fullPrompt);
//     const responseText = result.response.text();

//     console.log(
//       "✅ [API] Gemini response received, length:",
//       responseText.length
//     );
//     console.log(
//       "📄 [API] Response preview:",
//       responseText.substring(0, 200) + "..."
//     );

//     // Parse the JSON response
//     let parsedResponse;
//     try {
//       console.log("📝 [API] Raw response text length:", responseText.length);
//       console.log("📝 [API] First 500 chars:", responseText.substring(0, 500));

//       // Try to extract JSON object
//       let jsonString = responseText.trim();

//       // If response is wrapped in markdown code blocks, extract it
//       if (jsonString.startsWith("```json")) {
//         jsonString = jsonString
//           .replace(/^```json\n?/, "")
//           .replace(/\n?```$/, "");
//       } else if (jsonString.startsWith("```")) {
//         jsonString = jsonString.replace(/^```\n?/, "").replace(/\n?```$/, "");
//       }

//       // Try direct parse first
//       let parseAttempt = 1;
//       let lastError: any = null;
//       try {
//         parsedResponse = JSON.parse(jsonString);
//         console.log("✅ [API] JSON parsed successfully on first attempt");
//       } catch (e1: any) {
//         // If direct parse fails, try regex extraction
//         lastError = e1;
//         console.log("⚠️ [API] Direct parse failed, trying regex extraction");
//         parseAttempt = 2;
//         const jsonMatch = jsonString.match(/\{[\s\S]*\}$/);
//         if (jsonMatch) {
//           let jsonToParse = jsonMatch[0];
//           try {
//             parsedResponse = JSON.parse(jsonToParse);
//             console.log(
//               "✅ [API] JSON parsed successfully with regex extraction"
//             );
//           } catch (e2: any) {
//             // If regex extraction fails, try fixing common escape issues
//             lastError = e2;
//             console.log("⚠️ [API] Regex extraction failed, trying escape fix");
//             parseAttempt = 3;

//             // Fix improperly escaped backslashes in string content
//             // The issue is often: \\\. should be \\. (reduce triple backslashes to double)
//             let fixedJson = jsonToParse.replace(/\\\\\./g, "\\.");

//             try {
//               parsedResponse = JSON.parse(fixedJson);
//               console.log("✅ [API] JSON parsed successfully with escape fix");
//             } catch (e3: any) {
//               // Last resort: try replacing problematic escape sequences
//               lastError = e3;
//               console.log(
//                 "⚠️ [API] Escape fix failed, trying sequence replacement"
//               );
//               parseAttempt = 4;

//               // Replace common problematic patterns
//               // \\\\ -> \\ (quad backslash to double)
//               // \\n outside of strings is likely meant to be \\\\n
//               let fixedJson2 = jsonToParse
//                 .replace(/([^\\])\\\\\\\\/g, "$1\\\\") // \\\\ -> \\
//                 .replace(/\\\\\\"/g, '\\"'); // \\\" -> \"

//               try {
//                 parsedResponse = JSON.parse(fixedJson2);
//                 console.log(
//                   "✅ [API] JSON parsed successfully with sequence replacement"
//                 );
//               } catch (e4: any) {
//                 // Final attempt: extract just the needed parts manually
//                 lastError = e4;
//                 console.log(
//                   "⚠️ [API] All standard parsing failed, attempting manual extraction"
//                 );
//                 parseAttempt = 5;

//                 // Try to extract files object manually
//                 const filesMatch = jsonToParse.match(
//                   /"files"\s*:\s*(\{[\s\S]*?\})\s*[,}]/
//                 );
//                 if (filesMatch) {
//                   try {
//                     // Extract the files object and parse it standalone
//                     let filesStr = filesMatch[1];
//                     // Unescape the content properly
//                     filesStr = filesStr
//                       .replace(/\\"/g, '"')
//                       .replace(/\\\\/g, "\\");
//                     const files = JSON.parse(filesStr);
//                     parsedResponse = { files };
//                     console.log(
//                       "✅ [API] JSON parsed successfully with manual extraction"
//                     );
//                   } catch (e5: any) {
//                     throw new Error(
//                       `All 5 parse attempts failed. Last error: ${e4.message}`
//                     );
//                   }
//                 } else {
//                   throw new Error(
//                     `Could not extract files. Last error: ${e4.message}`
//                   );
//                 }
//               }
//             }
//           }
//         } else {
//           throw new Error("Could not extract valid JSON from response");
//         }
//       }
//     } catch (parseError) {
//       console.error("❌ [API] Failed to parse Gemini response:", parseError);
//       console.error(
//         "❌ [API] Response text preview:",
//         responseText.substring(0, 1000)
//       );
//       return NextResponse.json(
//         {
//           message: "Failed to parse AI response",
//           error:
//             parseError instanceof Error
//               ? parseError.message
//               : "Unknown parse error",
//           raw: responseText.substring(0, 2000), // Return first 2000 chars for debugging
//         },
//         { status: 500 }
//       );
//     }

//     // Validate response structure
//     if (!parsedResponse.files || typeof parsedResponse.files !== "object") {
//       // If no files but has chat or questions, it's a clarifying response - still valid
//       if (
//         (parsedResponse.chat || parsedResponse.questions) &&
//         typeof parsedResponse === "object"
//       ) {
//         console.log("💬 [API] Chat/Questions-only response");
//         if (parsedResponse.chat) {
//           console.log("💬 [API] Chat message:", parsedResponse.chat);
//         }

//         // Validate and ensure questions have unique IDs
//         let questions = parsedResponse.questions || [];
//         if (Array.isArray(questions) && questions.length > 0) {
//           console.log("❓ [API] Questions:", questions.length, "question(s)");

//           // Ensure each question has a unique ID
//           const seenIds = new Set<string>();
//           questions = questions.map((q, idx) => {
//             // If question doesn't have an ID or ID is invalid, assign one
//             if (!q.id || typeof q.id !== "string") {
//               q.id = `q${idx + 1}`;
//               console.log("⚠️  [API] Generated missing question ID:", q.id);
//             }

//             // Check for duplicates
//             if (seenIds.has(q.id)) {
//               const newId = `q${Date.now()}_${idx}`;
//               console.log(
//                 "⚠️  [API] Duplicate question ID found, reassigning:",
//                 q.id,
//                 "→",
//                 newId
//               );
//               q.id = newId;
//             }
//             seenIds.add(q.id);
//             return q;
//           });
//         }

//         return NextResponse.json({
//           ...(parsedResponse.chat && { chat: parsedResponse.chat }),
//           ...(questions.length > 0 && { questions }),
//         });
//       }
//       console.log("❌ [API] Invalid response structure:", parsedResponse);
//       return NextResponse.json(
//         {
//           message: "Invalid response format from AI",
//           received: parsedResponse,
//         },
//         { status: 500 }
//       );
//     }

//     console.log(
//       "✅ [API] Response valid, files count:",
//       Object.keys(parsedResponse.files).length
//     );
//     console.log("📦 [API] Files:", Object.keys(parsedResponse.files));

//     // Validate and ensure questions have unique IDs
//     let questions = parsedResponse.questions || [];
//     if (Array.isArray(questions) && questions.length > 0) {
//       const seenIds = new Set<string>();
//       questions = questions.map((q, idx) => {
//         // If question doesn't have an ID or ID is invalid, assign one
//         if (!q.id || typeof q.id !== "string") {
//           q.id = `q${idx + 1}`;
//           console.log("⚠️  [API] Generated missing question ID:", q.id);
//         }

//         // Check for duplicates
//         if (seenIds.has(q.id)) {
//           const newId = `q${Date.now()}_${idx}`;
//           console.log(
//             "⚠️  [API] Duplicate question ID found, reassigning:",
//             q.id,
//             "→",
//             newId
//           );
//           q.id = newId;
//         }
//         seenIds.add(q.id);
//         return q;
//       });
//     }

//     // Include mergeStrategy, chat, and questions if present
//     const response = {
//       files: parsedResponse.files,
//       ...(parsedResponse.mergeStrategy && {
//         mergeStrategy: parsedResponse.mergeStrategy,
//       }),
//       ...(parsedResponse.chat && { chat: parsedResponse.chat }),
//       ...(questions.length > 0 && { questions }),
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("❌ [API] Error in AI generate endpoint:", error);

//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error occurred";

//     console.error("❌ [API] Error message:", errorMessage);

//     return NextResponse.json(
//       {
//         message: "Error generating code",
//         error: errorMessage,
//       },
//       { status: 500 }
//     );
//   }
// }


// --------------------------------------------------------------


import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    console.log("🔵 [API] AI Generate endpoint called");
    console.log("📝 [API] Prompt received:", prompt.substring(0, 100) + "...");

    if (!prompt || !prompt.trim()) {
      console.log("❌ [API] Empty prompt");
      return NextResponse.json(
        { message: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log("❌ [API] GEMINI_API_KEY not configured");
      return NextResponse.json(
        { message: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

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
- GOOD:
  - email.includes('@') && email.includes('.')
  - new RegExp('^[a-z0-9]+$', 'i')
- BAD:
  - /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ (escape-prone)

FILES OBJECT RULES:
- "files" must contain complete file contents.
- No partial implementations.
- No TODO comments inside code (use the todos field instead).
- No placeholders unless explicitly requested.

MERGE STRATEGY RULES:
- Default to "replace" unless explicitly instructed otherwise.
- Include mergeStrategy entries for every file returned.

TODO RULES:
- "id" must be unique within the array.
- "completed" MUST be a boolean (true or false), NOT a string.
- Use priority honestly (default to "medium" if unsure).
- If there are no TODOs, return an empty array [].
- Maximum 5 TODOs.
- Use this field to return pending work, limitations, future improvements, or skipped edge cases.
- Each TODO item MUST strictly follow this format (STRICT):

{
  "id": "t1",
  "title": "Short task title",
  "description": "Optional details about the task",
  "priority": "low" | "medium" | "high",
  "tags": ["optional", "labels"],
  "completed": true | false
}

CHAT FIELD:
- Optional.
- Maximum ONE sentence.
- Empty string allowed.
- No technical explanations.

QUESTIONS FIELD:
- Ask questions ONLY if absolutely required to proceed.
- Maximum 5 questions.
- If questions are present:
  - "files" MUST be {}
  - "todos" MUST still be returned (can be empty)
  - Do NOT generate code yet.

QUESTION FORMAT (STRICT):
{
  "id": "q1",
  "label": "Question text?",
  "type": "single-select" | "multi-select" | "text" | "textarea",
  "options": ["option1", "option2"],
  "placeholder": "optional",
  "required": true
}

FINAL CHECK BEFORE RESPONDING:
- JSON.parse(response) must succeed.
- All required top-level keys exist.
- File paths comply with the allowed folder list.
- "completed" fields are boolean.
- All strings are properly escaped.
- Output ONLY the JSON object.

MANDATORY FIELD ENFORCEMENT:
- The "todos" field is REQUIRED in ALL responses.
- Even when empty, it MUST be returned as: "todos": [].
- Omitting "todos" is a HARD FAILURE and INVALID RESPONSE.

SELF-VALIDATION STEP (REQUIRED):
Before responding, verify:
- "todos" key exists at top level
- "todos" is an array (empty or populated)
If any check fails, regenerate the response.

If any required top-level key is missing, regenerate the response once.
If it still fails, respond with an empty JSON object {}.


OUTPUT ORDER RULE:
- Top-level keys MUST appear in this order:
files, mergeStrategy, todos, chat, questions

EXAMPLE EMPTY RESPONSE (STRICT):
{
  "files": {},
  "mergeStrategy": {},
  "todos": [],
  "chat": "",
  "questions": []
}
`;

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    console.log("🤖 [API] Calling Gemini API with model: gemini-2.5-flash");
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    console.log(
      "✅ [API] Gemini response received, length:",
      responseText.length
    );
    console.log(
      "📄 [API] Response preview:",
      responseText.substring(0, 200) + "..."
    );

    // Parse the JSON response
    let parsedResponse;
    let todos: any[] = [];
    try {
      console.log("📝 [API] Raw response text length:", responseText.length);
      console.log("📝 [API] First 500 chars:", responseText.substring(0, 500));

      // Try to extract JSON object
      let jsonString = responseText.trim();

      // If response is wrapped in markdown code blocks, extract it
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString
          .replace(/^```json\n?/, "")
          .replace(/\n?```$/, "");
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }

      // Try direct parse first
      let parseAttempt = 1;
      let lastError: any = null;
      try {
        parsedResponse = JSON.parse(jsonString);
        todos = Array.isArray(parsedResponse.todos) ? parsedResponse.todos : [];
        console.log("🧩 [API] Todos extracted:", todos.length, todos);
        console.log("✅ [API] JSON parsed successfully on first attempt");
      } catch (e1: any) {
        // If direct parse fails, try regex extraction
        lastError = e1;
        console.log("⚠️ [API] Direct parse failed, trying regex extraction");
        parseAttempt = 2;
        const jsonMatch = jsonString.match(/\{[\s\S]*\}$/);
        if (jsonMatch) {
          let jsonToParse = jsonMatch[0];
          try {
            parsedResponse = JSON.parse(jsonToParse);
            console.log(
              "✅ [API] JSON parsed successfully with regex extraction"
            );
          } catch (e2: any) {
            // If regex extraction fails, try fixing common escape issues
            lastError = e2;
            console.log("⚠️ [API] Regex extraction failed, trying escape fix");
            parseAttempt = 3;

            // Fix improperly escaped backslashes in string content
            // The issue is often: \\\. should be \\. (reduce triple backslashes to double)
            let fixedJson = jsonToParse.replace(/\\\\\./g, "\\.");

            try {
              parsedResponse = JSON.parse(fixedJson);
              console.log("✅ [API] JSON parsed successfully with escape fix");
            } catch (e3: any) {
              // Last resort: try replacing problematic escape sequences
              lastError = e3;
              console.log(
                "⚠️ [API] Escape fix failed, trying sequence replacement"
              );
              parseAttempt = 4;

              // Replace common problematic patterns
              // \\\\ -> \\ (quad backslash to double)
              // \\n outside of strings is likely meant to be \\\\n
              let fixedJson2 = jsonToParse
                .replace(/([^\\])\\\\\\\\/g, "$1\\\\") // \\\\ -> \\
                .replace(/\\\\\\"/g, '\\"'); // \\\" -> \"

              try {
                parsedResponse = JSON.parse(fixedJson2);
                console.log(
                  "✅ [API] JSON parsed successfully with sequence replacement"
                );
              } catch (e4: any) {
                // Final attempt: extract just the needed parts manually
                lastError = e4;
                console.log(
                  "⚠️ [API] All standard parsing failed, attempting manual extraction"
                );
                parseAttempt = 5;

                // Try to extract files object manually
                const filesMatch = jsonToParse.match(
                  /"files"\s*:\s*(\{[\s\S]*?\})\s*[,}]/
                );
                if (filesMatch) {
                  try {
                    // Extract the files object and parse it standalone
                    let filesStr = filesMatch[1];
                    // Unescape the content properly
                    filesStr = filesStr
                      .replace(/\\"/g, '"')
                      .replace(/\\\\/g, "\\");
                    const files = JSON.parse(filesStr);
                    parsedResponse = { files };
                    console.log(
                      "✅ [API] JSON parsed successfully with manual extraction"
                    );
                  } catch (e5: any) {
                    throw new Error(
                      `All 5 parse attempts failed. Last error: ${e4.message}`
                    );
                  }
                } else {
                  throw new Error(
                    `Could not extract files. Last error: ${e4.message}`
                  );
                }
              }
            }
          }
        } else {
          throw new Error("Could not extract valid JSON from response");
        }
      }
    } catch (parseError) {
      console.error("❌ [API] Failed to parse Gemini response:", parseError);
      console.error(
        "❌ [API] Response text preview:",
        responseText.substring(0, 1000)
      );
      return NextResponse.json(
        {
          message: "Failed to parse AI response",
          error:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parse error",
          raw: responseText.substring(0, 2000), // Return first 2000 chars for debugging
        },
        { status: 500 }
      );
    }

    todos = Array.isArray(parsedResponse?.todos) ? parsedResponse.todos : [];
    console.log("🧩 [API] Final todos after parsing:", todos.length, todos);

    // Validate response structure
    if (!parsedResponse.files || typeof parsedResponse.files !== "object") {
      // If no files but has chat or questions, it's a clarifying response - still valid
      if (
        (parsedResponse.chat || parsedResponse.questions) &&
        typeof parsedResponse === "object"
      ) {
        console.log("💬 [API] Chat/Questions-only response");
        if (parsedResponse.chat) {
          console.log("💬 [API] Chat message:", parsedResponse.chat);
        }

        // Validate and ensure questions have unique IDs
        let questions = parsedResponse.questions || [];
        if (Array.isArray(questions) && questions.length > 0) {
          console.log("❓ [API] Questions:", questions.length, "question(s)");

          // Ensure each question has a unique ID
          const seenIds = new Set<string>();
          questions = questions.map((q, idx) => {
            // If question doesn't have an ID or ID is invalid, assign one
            if (!q.id || typeof q.id !== "string") {
              q.id = `q${idx + 1}`;
              console.log("⚠️  [API] Generated missing question ID:", q.id);
            }

            // Check for duplicates
            if (seenIds.has(q.id)) {
              const newId = `q${Date.now()}_${idx}`;
              console.log(
                "⚠️  [API] Duplicate question ID found, reassigning:",
                q.id,
                "→",
                newId
              );
              q.id = newId;
            }
            seenIds.add(q.id);
            return q;
          });
        }

        // return NextResponse.json({
        //   ...(parsedResponse.chat && { chat: parsedResponse.chat }),
        //   ...(questions.length > 0 && { questions }),
        // });

        return NextResponse.json({
          files: {},
          mergeStrategy: {},
          todos,
          ...(parsedResponse.chat && { chat: parsedResponse.chat }),
          questions,
        });
      }
      console.log("❌ [API] Invalid response structure:", parsedResponse);
      return NextResponse.json(
        {
          message: "Invalid response format from AI",
          received: parsedResponse,
        },
        { status: 500 }
      );
    }

    console.log(
      "✅ [API] Response valid, files count:",
      Object.keys(parsedResponse.files).length
    );
    console.log("📦 [API] Files:", Object.keys(parsedResponse.files));

    // Validate and ensure questions have unique IDs
    let questions = parsedResponse.questions || [];
    if (Array.isArray(questions) && questions.length > 0) {
      const seenIds = new Set<string>();
      questions = questions.map((q, idx) => {
        // If question doesn't have an ID or ID is invalid, assign one
        if (!q.id || typeof q.id !== "string") {
          q.id = `q${idx + 1}`;
          console.log("⚠️  [API] Generated missing question ID:", q.id);
        }

        // Check for duplicates
        if (seenIds.has(q.id)) {
          const newId = `q${Date.now()}_${idx}`;
          console.log(
            "⚠️  [API] Duplicate question ID found, reassigning:",
            q.id,
            "→",
            newId
          );
          q.id = newId;
        }
        seenIds.add(q.id);
        return q;
      });
    }

    // Include mergeStrategy, chat, and questions if present
    // const response = {
    //   files: parsedResponse.files,
    //   ...(parsedResponse.mergeStrategy && {
    //     mergeStrategy: parsedResponse.mergeStrategy,
    //   }),
    //   ...(parsedResponse.chat && { chat: parsedResponse.chat }),
    //   ...(questions.length > 0 && { questions }),
    // };

    const response = {
      files: parsedResponse.files,
      mergeStrategy: parsedResponse.mergeStrategy || {},
      todos,
      chat: parsedResponse.chat || "",
      questions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ [API] Error in AI generate endpoint:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("❌ [API] Error message:", errorMessage);

    return NextResponse.json(
      {
        message: "Error generating code",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
