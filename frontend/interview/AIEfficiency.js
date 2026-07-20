// // User request
// //     ↓
// // 1. Delegate: What should AI decide, and what should code decide?
// //     ↓
// // 2. Describe: Give AI sufficient schema, constraints, and output format
// //     ↓
// // 3. Discern: Validate the response technically and semantically
// //     ↓
// // 4. Diligence: Execute safely, explain limitations, and own the result

/****** IMPORTANT ******/
// I use Claude to interpret the user’s intent and propose a structured formula plan. 
// Deterministic code validates the referenced fields, operation type, schema compatibility, and API capabilities before anything is applied.

// Delegation
// I delegate language interpretation and formula synthesis to the model because those tasks benefit from semantic reasoning. 
// I do not delegate authorization, capability detection, schema validation, or execution safety. Those remain deterministic application responsibilities.
// Claude should receive real schema instead of invent it 
// const fields = await getFieldsFromAirtable();
// const salaryExists = fields.some((field) => field.name === "Salary");

// Description -- provide model with context, constraints, example and response contract needed to be successful
// You translate user requests into Airtable formula plans.

// Available fields:
// - Salary: currency
// - Name: singleLineText
// - Department: singleSelect
// - Active: checkbox

// User request:
// "Create a field that shows twice each employee's salary."

// Rules:
// 1. Use only fields from the supplied schema.
// 2. Do not invent field names.
// 3. Return a formula, but do not execute any operation.
// 4. If the request is ambiguous, return needsClarification=true.
// 5. Return only valid JSON matching the requested schema.
// 6. Airtable field references must use braces, such as {Salary}.

// Return:
// {
//   "intent": "create_computed_field",
//   "fieldName": string,
//   "formula": string | null,
//   "referencedFields": string[],
//   "needsClarification": boolean,
//   "clarificationQuestion": string | null,
//   "explanation": string
// }

// Discernment
// Evaluate model output along four dimensions: 
// structural validity, schema grounding, semantic correctness, and tool feasibility. Passing one does not imply passing the others.

type AirtableField = {
  id: string;
  name: string;
  type: string;
};

type FormulaPlan = {
  intent: "create_computed_field";
  fieldName: string;
  formula: string | null;
  referencedFields: string[];
  needsClarification: boolean;
  clarificationQuestion: string | null;
  explanation: string;
};

type ExecutionResult =
  | {
      status: "clarification_required";
      question: string;
    }
  | {
      status: "manual_action_required";
      fieldName: string;
      formula: string;
      reason: string;
    }
  | {
      status: "ready_for_approval";
      plan: FormulaPlan;
    };

async function planFormulaChange(
  userRequest: string,
  fields: AirtableField[],
): Promise<ExecutionResult> {
  // Description: provide grounded schema and structured instructions.
  const rawPlan = await generateFormulaPlanWithClaude({
    userRequest,
    fields,
  });

  // Discernment: never trust unvalidated model output.
  const plan = FormulaPlanSchema.parse(rawPlan);

  if (plan.needsClarification) {
    return {
      status: "clarification_required",
      question:
        plan.clarificationQuestion ??
        "Could you clarify the requested calculation?",
    };
  }

  if (!plan.formula) {
    throw new Error("Claude returned no formula");
  }

  const fieldsByName = new Map(fields.map((field) => [field.name, field]));

  for (const referencedField of plan.referencedFields) {
    if (!fieldsByName.has(referencedField)) {
      throw new Error(`Unknown field: ${referencedField}`);
    }
  }

  validateFormulaTypes(plan, fieldsByName);

  // Delegation boundary: code, not Claude, determines tool support.
  const canCreateFormulaField = false;

  if (!canCreateFormulaField) {
    return {
      status: "manual_action_required",
      fieldName: plan.fieldName,
      formula: plan.formula,
      reason:
        "The available API does not support creating this formula field.",
    };
  }

  // Diligence: require approval before a schema mutation.
  return {
    status: "ready_for_approval",
    plan,
  };
}

type AirtableField = {
  id: string;
  name: string;
  type: string;
};

type FormulaPlan = {
  intent: "create_computed_field";
  fieldName: string;
  formula: string | null;
  referencedFields: string[];
  needsClarification: boolean;
  clarificationQuestion: string | null;
  explanation: string;
};

type GenerateFormulaPlanInput = {
  userRequest: string;
  fields: AirtableField[];
};

type ClaudeMessageResponse = {
  content?: Array<{
    type: string;
    text?: string;
  }>;
  error?: {
    message?: string;
  };
};

/**
 * Uses Claude only for:
 * 1. Understanding the user's natural-language request.
 * 2. Mapping the request to existing Airtable fields.
 * 3. Generating a candidate Airtable formula.
 *
 * Claude does not:
 * - Modify Airtable.
 * - Decide whether the Airtable API supports the mutation.
 * - Validate its own output.
 * - Receive the Airtable or Claude API keys inside the prompt.
 */
async function generateFormulaPlanWithClaude(
  input: GenerateFormulaPlanInput,
): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model =
    process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

  if (!apiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY environment variable",
    );
  }

  if (!input.userRequest.trim()) {
    throw new Error("The user request cannot be empty");
  }

  if (input.fields.length === 0) {
    throw new Error(
      "The Airtable schema must contain at least one field",
    );
  }

  /*
   * Description:
   * Give Claude the authoritative Airtable schema instead of
   * allowing the model to guess which fields exist.
   *
   * Only include field metadata needed for formula generation.
   * Do not send record values, secrets, API keys, or unrelated data.
   */
  const schemaDescription = input.fields
    .map(
      (field) =>
        `- ${JSON.stringify(field.name)}: ${field.type}`,
    )
    .join("\n");

  const systemPrompt = `
You convert natural-language requests into safe Airtable formula plans.

You are a planning component only.
You must not claim that you changed Airtable.
You must not invent fields that are not present in the provided schema.

Return exactly one JSON object with this structure:

{
  "intent": "create_computed_field",
  "fieldName": string,
  "formula": string | null,
  "referencedFields": string[],
  "needsClarification": boolean,
  "clarificationQuestion": string | null,
  "explanation": string
}

Rules:

1. Use only fields from the supplied Airtable schema.
2. Wrap Airtable field references in braces.
   Example: {Salary}
3. Do not wrap numeric constants in braces.
4. "Add two to salary" means {Salary} + 2.
5. "Double salary" means {Salary} * 2.
6. "Increase salary by 20 percent" means {Salary} * 1.2.
7. Do not invent a field when no suitable field exists.
8. When the request is ambiguous, set:
   - needsClarification to true
   - formula to null
   - clarificationQuestion to a specific question
9. When clarification is not needed:
   - needsClarification must be false
   - clarificationQuestion must be null
10. referencedFields must contain every field used in formula.
11. Return JSON only.
12. Do not include Markdown fences.
`.trim();

  const userPrompt = `
Airtable schema:

${schemaDescription}

User request:

${input.userRequest}
`.trim();

  const response = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 800,

        /*
         * Formula generation should be consistent.
         * A low temperature reduces unnecessary variation.
         */
        temperature: 0,

        system: systemPrompt,

        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    },
  );

  const payload =
    (await response.json()) as ClaudeMessageResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        `Claude request failed with status ${response.status}`,
    );
  }

  const text = payload.content
    ?.filter(
      (
        block,
      ): block is {
        type: string;
        text: string;
      } =>
        block.type === "text" &&
        typeof block.text === "string",
    )
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) {
    throw new Error(
      "Claude returned an empty response",
    );
  }

  /*
   * Discernment:
   * Parsing JSON is only the first validation layer.
   * The caller must still validate:
   *
   * - Object structure.
   * - Referenced fields.
   * - Airtable field types.
   * - Formula semantics.
   * - Airtable API capabilities.
   */
  try {
    return JSON.parse(stripMarkdownFence(text));
  } catch {
    throw new Error(
      `Claude did not return valid JSON: ${text}`,
    );
  }
}

/**
 * Defensive helper in case the model returns a fenced JSON block,
 * even though the prompt explicitly asks it not to.
 */
function stripMarkdownFence(value: string): string {
  const match = value.match(
    /^```(?:json)?\s*([\s\S]*?)\s*```$/i,
  );

  return match?.[1] ?? value;
}