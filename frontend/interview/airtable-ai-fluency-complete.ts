/**
 * Airtable AI Fluency Interview
 *
 * End-to-end flow:
 *
 * 1. Read configuration from environment variables.
 * 2. Fetch the authoritative Airtable table schema.
 * 3. Accept a natural-language user request.
 * 4. Ask Claude to generate a structured Airtable formula plan.
 * 5. Validate Claude's response deterministically.
 * 6. Check whether the requested Airtable mutation is supported.
 * 7. Return either:
 *    - a clarification request,
 *    - a validated preview,
 *    - a manual-action fallback,
 *    - or a successfully created field.
 *
 * AI Fluency framework:
 *
 * Delegation:
 * Claude handles language interpretation and formula generation.
 *
 * Description:
 * Claude receives the real Airtable schema, explicit rules, and a strict
 * JSON response contract.
 *
 * Discernment:
 * Application code validates Claude's JSON, fields, formula references,
 * field types, and API capabilities.
 *
 * Diligence:
 * The system protects credentials, requires explicit execution, verifies
 * Airtable responses, and never reports a mutation that did not happen.
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

type AirtableBaseSchemaResponse = {
  tables?: AirtableTable[];
  error?: {
    type?: string;
    message?: string;
  };
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

type ClaudeMessageResponse = {
  content?: Array<{
    type: string;
    text?: string;
  }>;
  error?: {
    type?: string;
    message?: string;
  };
};

type CreateFieldResponse = {
  id?: string;
  name?: string;
  type?: string;
  error?: {
    type?: string;
    message?: string;
  };
};

type AppConfig = {
  anthropicApiKey: string;
  anthropicModel: string;
  airtableApiKey: string;
  airtableBaseId: string;
  airtableTableIdOrName: string;
  executeSchemaMutation: boolean;
};

type ProcessResult =
  | {
      status: "clarification_required";
      question: string;
      dataChanged: false;
    }
  | {
      status: "preview_ready";
      plan: FormulaPlan;
      dataChanged: false;
    }
  | {
      status: "manual_action_required";
      fieldName: string;
      formula: string;
      reason: string;
      instructions: string;
      dataChanged: false;
    }
  | {
      status: "field_created";
      fieldId: string;
      fieldName: string;
      formula: string;
      dataChanged: true;
    };

/**
 * Main orchestration function.
 *
 * This is the function the CLI, API route, React form, or interview harness
 * would call after receiving the user's natural-language prompt.
 */
export async function processFormulaRequest(
  userPrompt: string,
): Promise<ProcessResult> {
  const config = loadConfig();

  /**
   * Diligence:
   * Validate user input before making any network request.
   */
  const normalizedPrompt = userPrompt.trim();

  if (!normalizedPrompt) {
    throw new Error("User prompt cannot be empty");
  }

  /**
   * Delegation boundary:
   * The application retrieves the real schema.
   * Claude is not asked to guess which fields or tables exist.
   */
  const table = await fetchAirtableTableSchema(config);

  /**
   * Description:
   * Claude receives the real schema and the user's request.
   */
  const plan = await generateFormulaPlanWithClaude({
    userRequest: normalizedPrompt,
    fields: table.fields,
    config,
  });

  /**
   * Discernment:
   * Claude output is parsed and validated before any mutation.
   */
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
    throw new Error(
      "Validated formula plan is missing a formula",
    );
  }

  /**
   * Diligence:
   * Default to preview-only behavior.
   *
   * The interview implementation should avoid changing the base unless the
   * caller explicitly enables schema mutation.
   */
  if (!config.executeSchemaMutation) {
    return {
      status: "preview_ready",
      plan,
      dataChanged: false,
    };
  }

  /**
   * Discernment:
   * A correct formula does not guarantee the API supports creating
   * the requested field type.
   */
  const capabilities = getAirtableCapabilities();

  if (!capabilities.canCreateFormulaField) {
    return {
      status: "manual_action_required",
      fieldName: plan.fieldName,
      formula: plan.formula,
      reason:
        "The configured Airtable API path does not support creating formula fields.",
      instructions:
        `Create a Formula field named "${plan.fieldName}" and paste this formula: ${plan.formula}`,
      dataChanged: false,
    };
  }

  /**
   * Diligence:
   * Only execute after schema validation, capability checks, and explicit
   * enablement through EXECUTE_SCHEMA_MUTATION=true.
   */
  const createdField = await createFormulaField({
    config,
    table,
    plan,
  });

  return {
    status: "field_created",
    fieldId: createdField.id,
    fieldName: createdField.name,
    formula: plan.formula,
    dataChanged: true,
  };
}

/**
 * Delegation:
 *
 * Claude handles:
 * - understanding user intent,
 * - mapping intent to known Airtable fields,
 * - generating a candidate Airtable formula,
 * - deciding whether clarification is required.
 *
 * Claude does not:
 * - fetch Airtable schema,
 * - validate its own output,
 * - determine authorization,
 * - decide API capabilities,
 * - mutate Airtable.
 */
async function generateFormulaPlanWithClaude(input: {
  userRequest: string;
  fields: AirtableField[];
  config: AppConfig;
}): Promise<FormulaPlan> {
  /**
   * Description:
   * Send only the minimum required schema metadata.
   * Do not send Airtable records, secrets, or unrelated user data.
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
You must not claim that Airtable was changed.
You must not invent fields that are absent from the provided schema.

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
2. Wrap Airtable field references in braces, such as {Salary}.
3. Do not wrap numeric constants in braces.
4. Do not invent field names.
5. If the request is ambiguous:
   - set needsClarification to true,
   - set formula to null,
   - return a specific clarificationQuestion.
6. If the request is clear:
   - set needsClarification to false,
   - set clarificationQuestion to null.
7. referencedFields must list every field used in formula.
8. fieldName should be short and descriptive.
9. explanation should explain the calculation in one sentence.
10. Return JSON only.
11. Do not include Markdown fences.
`.trim();

  const userMessage = `
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
        "x-api-key": input.config.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: input.config.anthropicModel,
        max_tokens: 800,
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
    throw new Error("Claude returned an empty response");
  }

  /**
   * Discernment:
   * Claude output remains untrusted until it is parsed and validated.
   */
  let rawPlan: unknown;

  try {
    rawPlan = JSON.parse(stripMarkdownFence(text));
  } catch {
    throw new Error(
      `Claude did not return valid JSON: ${text}`,
    );
  }

  return parseFormulaPlan(rawPlan);
}

/**
 * Fetch the authoritative Airtable base schema.
 *
 * This function finds the requested table by either its table ID or name.
 */
async function fetchAirtableTableSchema(
  config: AppConfig,
): Promise<AirtableTable> {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${encodeURIComponent(
      config.airtableBaseId,
    )}/tables`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.airtableApiKey}`,
      },
    },
  );

  const payload =
    (await response.json()) as AirtableBaseSchemaResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        `Airtable schema request failed with status ${response.status}`,
    );
  }

  const table = payload.tables?.find(
    (candidate) =>
      candidate.id === config.airtableTableIdOrName ||
      candidate.name === config.airtableTableIdOrName,
  );

  if (!table) {
    throw new Error(
      `Could not find Airtable table "${config.airtableTableIdOrName}"`,
    );
  }

  if (!Array.isArray(table.fields) || table.fields.length === 0) {
    throw new Error(
      `Airtable table "${table.name}" has no readable fields`,
    );
  }

  return table;
}

/**
 * Parse Claude's raw JSON object into the FormulaPlan contract.
 */
function parseFormulaPlan(
  value: unknown,
): FormulaPlan {
  if (!isRecord(value)) {
    throw new Error(
      "Claude response must be a JSON object",
    );
  }

  if (value.intent !== "create_computed_field") {
    throw new Error("Unsupported Claude intent");
  }

  if (
    typeof value.fieldName !== "string" ||
    value.fieldName.trim() === ""
  ) {
    throw new Error(
      "Claude returned an invalid fieldName",
    );
  }

  if (
    value.formula !== null &&
    typeof value.formula !== "string"
  ) {
    throw new Error(
      "Claude returned an invalid formula",
    );
  }

  if (
    !Array.isArray(value.referencedFields) ||
    !value.referencedFields.every(
      (field) => typeof field === "string",
    )
  ) {
    throw new Error(
      "Claude returned invalid referencedFields",
    );
  }

  if (
    typeof value.needsClarification !== "boolean"
  ) {
    throw new Error(
      "Claude returned an invalid needsClarification value",
    );
  }

  if (
    value.clarificationQuestion !== null &&
    typeof value.clarificationQuestion !== "string"
  ) {
    throw new Error(
      "Claude returned an invalid clarificationQuestion",
    );
  }

  if (typeof value.explanation !== "string") {
    throw new Error(
      "Claude returned an invalid explanation",
    );
  }

  if (
    value.needsClarification &&
    value.formula !== null
  ) {
    throw new Error(
      "An ambiguous request must not include an executable formula",
    );
  }

  if (
    !value.needsClarification &&
    !value.formula
  ) {
    throw new Error(
      "A resolved request must include a formula",
    );
  }

  return {
    intent: "create_computed_field",
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
    ].filter(Boolean),
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
 * Discernment:
 *
 * Validate the formula against the real Airtable schema.
 *
 * Checks:
 * - all declared fields exist,
 * - all declared fields appear in the formula,
 * - all formula field references exist,
 * - the model did not hide an undeclared field in the formula,
 * - referenced fields are compatible with the requested arithmetic.
 */
function validateFormulaPlan(
  plan: FormulaPlan,
  fields: AirtableField[],
): void {
  if (plan.needsClarification) {
    if (!plan.clarificationQuestion) {
      throw new Error(
        "Clarification is required but no question was provided",
      );
    }

    return;
  }

  if (!plan.formula) {
    throw new Error(
      "Formula is required for a resolved plan",
    );
  }

  const fieldsByName = new Map(
    fields.map((field) => [field.name, field]),
  );

  for (const fieldName of plan.referencedFields) {
    if (!fieldsByName.has(fieldName)) {
      throw new Error(
        `Claude referenced an unknown Airtable field: ${fieldName}`,
      );
    }

    const expectedReference = `{${fieldName}}`;

    if (!plan.formula.includes(expectedReference)) {
      throw new Error(
        `Formula does not contain declared field ${expectedReference}`,
      );
    }
  }

  const formulaReferences = extractFieldReferences(
    plan.formula,
  );

  for (const fieldName of formulaReferences) {
    if (!fieldsByName.has(fieldName)) {
      throw new Error(
        `Formula contains unknown Airtable field: ${fieldName}`,
      );
    }

    if (
      !plan.referencedFields.includes(fieldName)
    ) {
      throw new Error(
        `Formula contains undeclared field: ${fieldName}`,
      );
    }
  }

  /**
   * Basic type validation.
   *
   * This is intentionally conservative. A production solution could use
   * a real Airtable formula parser instead of checking the formula text.
   */
  const appearsArithmetic =
    /[+\-*/]/.test(plan.formula);

  if (appearsArithmetic) {
    for (const fieldName of formulaReferences) {
      const field = fieldsByName.get(fieldName);

      if (
        field &&
        !isNumericAirtableFieldType(field.type)
      ) {
        throw new Error(
          `Formula performs arithmetic on non-numeric field "${fieldName}" of type "${field.type}"`,
        );
      }
    }
  }
}

/**
 * Airtable capability boundary.
 *
 * Keep this explicit rather than allowing Claude to assume an endpoint exists.
 */
function getAirtableCapabilities(): {
  canCreateFormulaField: boolean;
} {
  return {
    canCreateFormulaField: false,
  };
}

/**
 * Formula field creation is isolated behind one function.
 *
 * If the interview environment provides a supported endpoint or custom tool,
 * update only this function and the capability flag.
 */
async function createFormulaField(input: {
  config: AppConfig;
  table: AirtableTable;
  plan: FormulaPlan;
}): Promise<{
  id: string;
  name: string;
}> {
  if (!input.plan.formula) {
    throw new Error(
      "Cannot create a formula field without a formula",
    );
  }

  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${encodeURIComponent(
      input.config.airtableBaseId,
    )}/tables/${encodeURIComponent(
      input.table.id,
    )}/fields`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${input.config.airtableApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: input.plan.fieldName,
        type: "formula",
        options: {
          formula: input.plan.formula,
        },
      }),
    },
  );

  const payload =
    (await response.json()) as CreateFieldResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        `Airtable field creation failed with status ${response.status}`,
    );
  }

  if (!payload.id || !payload.name) {
    throw new Error(
      "Airtable returned an incomplete field response",
    );
  }

  return {
    id: payload.id,
    name: payload.name,
  };
}

/**
 * Read required configuration from environment variables.
 */
function loadConfig(): AppConfig {
  const anthropicApiKey =
    process.env.ANTHROPIC_API_KEY;

  const airtableApiKey =
    process.env.AIRTABLE_API_KEY;

  const airtableBaseId =
    process.env.AIRTABLE_BASE_ID;

  const airtableTableIdOrName =
    process.env.AIRTABLE_TABLE;

  if (!anthropicApiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY environment variable",
    );
  }

  if (!airtableApiKey) {
    throw new Error(
      "Missing AIRTABLE_API_KEY environment variable",
    );
  }

  if (!airtableBaseId) {
    throw new Error(
      "Missing AIRTABLE_BASE_ID environment variable",
    );
  }

  if (!airtableTableIdOrName) {
    throw new Error(
      "Missing AIRTABLE_TABLE environment variable",
    );
  }

  return {
    anthropicApiKey,
    anthropicModel:
      process.env.ANTHROPIC_MODEL ??
      "claude-sonnet-4-5",
    airtableApiKey,
    airtableBaseId,
    airtableTableIdOrName,
    executeSchemaMutation:
      process.env.EXECUTE_SCHEMA_MUTATION === "true",
  };
}

function extractFieldReferences(
  formula: string,
): string[] {
  const references = formula.matchAll(
    /\{([^{}]+)\}/g,
  );

  return [
    ...new Set(
      Array.from(
        references,
        (match) => match[1].trim(),
      ),
    ),
  ];
}

function isNumericAirtableFieldType(
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

function stripMarkdownFence(value: string): string {
  const match = value.match(
    /^```(?:json)?\s*([\s\S]*?)\s*```$/i,
  );

  return match?.[1] ?? value;
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
 * CLI entry point.
 *
 * Run:
 *
 *   npx tsx airtable-ai-fluency.ts "add two on salary"
 *
 * The same processFormulaRequest function can also be called from an API route
 * or frontend form handler.
 */
async function main(): Promise<void> {
  const userPrompt = process.argv.slice(2).join(" ").trim();

  if (!userPrompt) {
    console.error(
      'Usage: npx tsx airtable-ai-fluency.ts "add two on salary"',
    );

    process.exitCode = 1;
    return;
  }

  try {
    const result =
      await processFormulaRequest(userPrompt);

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
  typeof process !== "undefined" &&
  process.argv[1]?.includes(
    "airtable-ai-fluency",
  )
) {
  void main();
}
