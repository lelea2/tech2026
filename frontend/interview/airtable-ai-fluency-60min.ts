/**
 * Airtable AI Fluency — 60-Minute Interview Solution
 *
 * Suggested interview pacing:
 *
 * 0–5 min:
 * - Clarify the input, expected formula output, and Airtable API constraints.
 *
 * 5–15 min:
 * - Fetch the real Airtable table schema.
 *
 * 15–30 min:
 * - Ask Claude to translate the user request into a structured formula plan.
 *
 * 30–45 min:
 * - Validate Claude's output against the schema.
 *
 * 45–55 min:
 * - Return a preview or safe fallback for unsupported schema mutation.
 *
 * 55–60 min:
 * - Discuss production hardening, permissions, retries, approval, and tests.
 *
 * AI Fluency:
 *
 * Delegation:
 * Claude interprets natural language and proposes a formula.
 *
 * Description:
 * Claude receives the real schema, explicit constraints, and a JSON contract.
 *
 * Discernment:
 * Code validates Claude's response and checks all referenced fields.
 *
 * Diligence:
 * The program never claims Airtable changed unless an API mutation succeeds.
 */

type AirtableField = {
  id: string;
  name: string;
  type: string;
};

type AirtableTable = {
  id: string;
  name: string;
  fields: AirtableField[];
};

type FormulaPlan = {
  fieldName: string;
  formula: string | null;
  referencedFields: string[];
  needsClarification: boolean;
  clarificationQuestion: string | null;
  explanation: string;
};

type Result =
  | {
      status: "clarification_required";
      question: string;
      dataChanged: false;
    }
  | {
      status: "preview_ready";
      fieldName: string;
      formula: string;
      explanation: string;
      dataChanged: false;
    }
  | {
      status: "manual_action_required";
      fieldName: string;
      formula: string;
      reason: string;
      dataChanged: false;
    };

type Config = {
  anthropicApiKey: string;
  anthropicModel: string;
  airtableApiKey: string;
  airtableBaseId: string;
  airtableTable: string;
};

/**
 * Main interview entry point.
 *
 * A CLI, API route, or React form can call this function with the user's text.
 */
export async function handleFormulaRequest(
  userRequest: string,
): Promise<Result> {
  const config = loadConfig();
  const request = userRequest.trim();

  if (!request) {
    throw new Error("User request cannot be empty");
  }

  // Delegation boundary:
  // Code retrieves the real schema; Claude must not guess fields.
  const table = await fetchTableSchema(config);

  // Description:
  // Give Claude the real schema and a strict output contract.
  const plan = await generateFormulaPlanWithClaude(
    request,
    table.fields,
    config,
  );

  // Discernment:
  // Treat model output as untrusted data.
  validateFormulaPlan(plan, table.fields);

  if (plan.needsClarification) {
    return {
      status: "clarification_required",
      question:
        plan.clarificationQuestion ??
        "Please clarify the requested calculation.",
      dataChanged: false,
    };
  }

  if (!plan.formula) {
    throw new Error("Resolved plan is missing a formula");
  }

  /**
   * Diligence:
   *
   * For a 60-minute interview, stop at a validated preview unless the supplied
   * Airtable environment explicitly supports formula-field creation.
   *
   * A valid formula does not prove the public API can create that field type.
   */
  const canCreateFormulaField = false;

  if (!canCreateFormulaField) {
    return {
      status: "manual_action_required",
      fieldName: plan.fieldName,
      formula: plan.formula,
      reason:
        "The available Airtable API does not support creating this formula field.",
      dataChanged: false,
    };
  }

  return {
    status: "preview_ready",
    fieldName: plan.fieldName,
    formula: plan.formula,
    explanation: plan.explanation,
    dataChanged: false,
  };
}

/**
 * Calls Claude to translate natural language into an Airtable formula plan.
 *
 * Claude only proposes a plan. It does not mutate Airtable.
 */
async function generateFormulaPlanWithClaude(
  userRequest: string,
  fields: AirtableField[],
  config: Config,
): Promise<FormulaPlan> {
  const schema = fields
    .map((field) => `- ${field.name}: ${field.type}`)
    .join("\n");

  const systemPrompt = `
You translate natural-language requests into Airtable formula plans.

Return only JSON with this exact shape:

{
  "fieldName": string,
  "formula": string | null,
  "referencedFields": string[],
  "needsClarification": boolean,
  "clarificationQuestion": string | null,
  "explanation": string
}

Rules:

1. Use only fields from the supplied Airtable schema.
2. Airtable field references must use braces, for example {Salary}.
3. Do not invent field names.
4. If the request is ambiguous:
   - set needsClarification to true,
   - set formula to null,
   - return a specific clarificationQuestion.
5. If the request is clear:
   - set needsClarification to false,
   - set clarificationQuestion to null.
6. referencedFields must contain every field used in formula.
7. Do not claim Airtable was changed.
8. Return JSON only, without Markdown.
`.trim();

  const userMessage = `
Airtable schema:

${schema}

User request:

${userRequest}
`.trim();

  const response = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.anthropicModel,
        max_tokens: 600,
        temperature: 0,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    },
  );

  const payload = (await response.json()) as {
    content?: Array<{
      type: string;
      text?: string;
    }>;
    error?: {
      message?: string;
    };
  };

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
    throw new Error("Claude returned an empty response");
  }

  let rawPlan: unknown;

  try {
    rawPlan = JSON.parse(text);
  } catch {
    throw new Error(
      `Claude returned invalid JSON: ${text}`,
    );
  }

  return parseFormulaPlan(rawPlan);
}

/**
 * Fetches the real Airtable base schema and finds the requested table.
 */
async function fetchTableSchema(
  config: Config,
): Promise<AirtableTable> {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${encodeURIComponent(
      config.airtableBaseId,
    )}/tables`,
    {
      headers: {
        Authorization: `Bearer ${config.airtableApiKey}`,
      },
    },
  );

  const payload = (await response.json()) as {
    tables?: AirtableTable[];
    error?: {
      message?: string;
    };
  };

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        `Airtable schema request failed with status ${response.status}`,
    );
  }

  const table = payload.tables?.find(
    (candidate) =>
      candidate.id === config.airtableTable ||
      candidate.name === config.airtableTable,
  );

  if (!table) {
    throw new Error(
      `Airtable table "${config.airtableTable}" was not found`,
    );
  }

  return table;
}

/**
 * Structural validation for Claude's JSON response.
 */
function parseFormulaPlan(
  value: unknown,
): FormulaPlan {
  if (!isRecord(value)) {
    throw new Error("Claude response must be an object");
  }

  if (
    typeof value.fieldName !== "string" ||
    !value.fieldName.trim()
  ) {
    throw new Error("Invalid fieldName");
  }

  if (
    value.formula !== null &&
    typeof value.formula !== "string"
  ) {
    throw new Error("Invalid formula");
  }

  if (
    !Array.isArray(value.referencedFields) ||
    !value.referencedFields.every(
      (field) => typeof field === "string",
    )
  ) {
    throw new Error("Invalid referencedFields");
  }

  if (
    typeof value.needsClarification !== "boolean"
  ) {
    throw new Error("Invalid needsClarification");
  }

  if (
    value.clarificationQuestion !== null &&
    typeof value.clarificationQuestion !== "string"
  ) {
    throw new Error("Invalid clarificationQuestion");
  }

  if (typeof value.explanation !== "string") {
    throw new Error("Invalid explanation");
  }

  if (
    value.needsClarification &&
    value.formula !== null
  ) {
    throw new Error(
      "Ambiguous requests must not return a formula",
    );
  }

  if (
    !value.needsClarification &&
    !value.formula
  ) {
    throw new Error(
      "Resolved requests must return a formula",
    );
  }

  return {
    fieldName: value.fieldName.trim(),
    formula:
      typeof value.formula === "string"
        ? value.formula.trim()
        : null,
    referencedFields: [
      ...new Set(
        value.referencedFields.map((field) =>
          field.trim(),
        ),
      ),
    ],
    needsClarification:
      value.needsClarification,
    clarificationQuestion:
      typeof value.clarificationQuestion ===
      "string"
        ? value.clarificationQuestion.trim()
        : null,
    explanation: value.explanation.trim(),
  };
}

/**
 * Semantic validation against the actual Airtable schema.
 */
function validateFormulaPlan(
  plan: FormulaPlan,
  fields: AirtableField[],
): void {
  if (plan.needsClarification) {
    if (!plan.clarificationQuestion) {
      throw new Error(
        "Clarification is required but no question was returned",
      );
    }

    return;
  }

  if (!plan.formula) {
    throw new Error("Formula is required");
  }

  const knownFields = new Map(
    fields.map((field) => [field.name, field]),
  );

  const fieldsInFormula = extractFieldReferences(
    plan.formula,
  );

  for (const fieldName of plan.referencedFields) {
    if (!knownFields.has(fieldName)) {
      throw new Error(
        `Claude referenced unknown field "${fieldName}"`,
      );
    }

    if (!fieldsInFormula.includes(fieldName)) {
      throw new Error(
        `Declared field "${fieldName}" is missing from the formula`,
      );
    }
  }

  for (const fieldName of fieldsInFormula) {
    if (!knownFields.has(fieldName)) {
      throw new Error(
        `Formula contains unknown field "${fieldName}"`,
      );
    }

    if (
      !plan.referencedFields.includes(fieldName)
    ) {
      throw new Error(
        `Formula contains undeclared field "${fieldName}"`,
      );
    }
  }

  /**
   * Simple interview-level type check.
   *
   * In production, use a proper Airtable formula parser or richer validation.
   */
  if (/[+\-*/]/.test(plan.formula)) {
    for (const fieldName of fieldsInFormula) {
      const field = knownFields.get(fieldName);

      if (
        field &&
        !isNumericFieldType(field.type)
      ) {
        throw new Error(
          `Cannot perform arithmetic on "${fieldName}" because its type is "${field.type}"`,
        );
      }
    }
  }
}

function extractFieldReferences(
  formula: string,
): string[] {
  return [
    ...new Set(
      Array.from(
        formula.matchAll(/\{([^{}]+)\}/g),
        (match) => match[1].trim(),
      ),
    ),
  ];
}

function isNumericFieldType(
  type: string,
): boolean {
  return new Set([
    "number",
    "currency",
    "percent",
    "rating",
    "duration",
    "count",
    "autoNumber",
    "formula",
    "rollup",
  ]).has(type);
}

function loadConfig(): Config {
  const anthropicApiKey =
    process.env.ANTHROPIC_API_KEY;
  const airtableApiKey =
    process.env.AIRTABLE_API_KEY;
  const airtableBaseId =
    process.env.AIRTABLE_BASE_ID;
  const airtableTable =
    process.env.AIRTABLE_TABLE;

  if (!anthropicApiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  if (!airtableApiKey) {
    throw new Error("Missing AIRTABLE_API_KEY");
  }

  if (!airtableBaseId) {
    throw new Error("Missing AIRTABLE_BASE_ID");
  }

  if (!airtableTable) {
    throw new Error("Missing AIRTABLE_TABLE");
  }

  return {
    anthropicApiKey,
    anthropicModel:
      process.env.ANTHROPIC_MODEL ??
      "claude-sonnet-4-5",
    airtableApiKey,
    airtableBaseId,
    airtableTable,
  };
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * CLI runner.
 *
 * Run:
 * npx tsx airtable-ai-fluency-60min.ts "add two on salary"
 */
async function main(): Promise<void> {
  const request = process.argv.slice(2).join(" ");

  if (!request.trim()) {
    console.error(
      'Usage: npx tsx airtable-ai-fluency-60min.ts "add two on salary"',
    );
    process.exitCode = 1;
    return;
  }

  try {
    const result =
      await handleFormulaRequest(request);

    console.log(
      JSON.stringify(result, null, 2),
    );
  } catch (error) {
    console.error({
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
      dataChanged: false,
    });

    process.exitCode = 1;
  }
}

if (
  process.argv[1]?.includes(
    "airtable-ai-fluency-60min",
  )
) {
  void main();
}
