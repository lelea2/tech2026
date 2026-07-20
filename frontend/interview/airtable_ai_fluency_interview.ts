/**
 * Airtable AI Fluency Interview — TypeScript Code Sheet
 *
 * Goal:
 *   Convert a user's natural-language request, such as
 *   "add two on salary", into a safe Airtable formula plan.
 *
 * AI Fluency framework demonstrated:
 *   1. Delegation  — Claude interprets intent and proposes a formula.
 *   2. Description — We provide Claude with the real Airtable schema,
 *                    constraints, examples, and a strict JSON contract.
 *   3. Discernment — Our code validates Claude's output instead of trusting it.
 *   4. Diligence   — We protect credentials, preview mutations, handle unsupported
 *                    API operations honestly, and verify the final result.
 *
 * Install:
 *   npm install @anthropic-ai/sdk zod dotenv
 *
 * Environment variables:
 *   ANTHROPIC_API_KEY=...
 *   ANTHROPIC_MODEL=claude-sonnet-4-5
 *   AIRTABLE_TOKEN=...
 *   AIRTABLE_BASE_ID=app...
 *   AIRTABLE_TABLE_ID=tbl...
 *
 * Important interview note:
 *   Do not assume every Airtable environment can create a formula field through
 *   the public API. Treat field creation as a capability to verify. If it is not
 *   available, return the validated formula for manual creation or use an
 *   explicitly approved materialization fallback.
 */

import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// -----------------------------------------------------------------------------
// 1. Configuration
// -----------------------------------------------------------------------------

const config = {
  anthropicApiKey: requiredEnv("ANTHROPIC_API_KEY"),
  anthropicModel:
    process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
  airtableToken: requiredEnv("AIRTABLE_TOKEN"),
  airtableBaseId: requiredEnv("AIRTABLE_BASE_ID"),
  airtableTableId: requiredEnv("AIRTABLE_TABLE_ID"),
};

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// -----------------------------------------------------------------------------
// 2. Types and validation schemas
// -----------------------------------------------------------------------------

const AirtableFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

type AirtableField = z.infer<typeof AirtableFieldSchema>;

/**
 * Claude returns a PLAN, not an executable Airtable request.
 *
 * This boundary is important:
 * - AI handles semantic interpretation.
 * - Code handles validation, authorization, and execution.
 */
const FormulaPlanSchema = z.object({
  intent: z.literal("create_computed_field"),
  fieldName: z.string().trim().min(1),
  formula: z.string().trim().min(1).nullable(),
  referencedFields: z.array(z.string()),
  needsClarification: z.boolean(),
  clarificationQuestion: z.string().nullable(),
  explanation: z.string(),
});

type FormulaPlan = z.infer<typeof FormulaPlanSchema>;

type Capability = {
  canCreateFormulaField: boolean;
};

type PreparedChange =
  | {
      status: "clarification_required";
      question: string;
    }
  | {
      status: "manual_action_required";
      fieldName: string;
      formula: string;
      reason: string;
      dataChanged: false;
    }
  | {
      status: "ready_for_approval";
      plan: FormulaPlan;
      dataChanged: false;
    };

// -----------------------------------------------------------------------------
// 3. Airtable HTTP helper
// -----------------------------------------------------------------------------

async function airtableRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`https://api.airtable.com/v0${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.airtableToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Airtable request failed (${response.status}): ${responseText}`,
    );
  }

  return responseText ? (JSON.parse(responseText) as T) : (undefined as T);
}

// -----------------------------------------------------------------------------
// 4. Fetch the authoritative Airtable schema
// -----------------------------------------------------------------------------

/**
 * DELEGATION:
 * We fetch the schema with deterministic code. We do NOT ask Claude to guess
 * which fields exist or what their types are.
 */
async function getTableFields(): Promise<AirtableField[]> {
  const response = await airtableRequest<{
    tables: Array<{
      id: string;
      name: string;
      fields: unknown[];
    }>;
  }>(`/meta/bases/${config.airtableBaseId}/tables`);

  const table = response.tables.find(
    (candidate) => candidate.id === config.airtableTableId,
  );

  if (!table) {
    throw new Error(`Table not found: ${config.airtableTableId}`);
  }

  return z.array(AirtableFieldSchema).parse(table.fields);
}

// -----------------------------------------------------------------------------
// 5. Ask Claude to generate a structured formula plan
// -----------------------------------------------------------------------------

/**
 * DESCRIPTION:
 * A strong prompt includes:
 * - the real table schema;
 * - the user's exact request;
 * - examples that distinguish similar language;
 * - constraints against inventing fields;
 * - a strict machine-readable output contract;
 * - instructions to ask for clarification when needed.
 */
async function generateFormulaPlan(
  userRequest: string,
  fields: AirtableField[],
): Promise<FormulaPlan> {
  const schemaContext = fields
    .map((field) => `- ${field.name}: ${field.type}`)
    .join("\n");

  const message = await anthropic.messages.create({
    model: config.anthropicModel,
    max_tokens: 1_000,
    temperature: 0,
    system: `
You translate natural-language requests into proposed Airtable formula plans.

You are a planner only. You must not claim that a change was executed.
Use only fields from the provided schema. Never invent a field.
Return only JSON. Do not wrap it in Markdown.

Interpretation examples:
- "add two to salary" => {Salary} + 2
- "double salary" => {Salary} * 2
- "increase salary by 20 percent" => {Salary} * 1.2
- "show only the 20 percent increase" => {Salary} * 0.2

When the request could refer to multiple fields or meanings, set
needsClarification=true and provide one concise clarification question.

Return this exact shape:
{
  "intent": "create_computed_field",
  "fieldName": string,
  "formula": string | null,
  "referencedFields": string[],
  "needsClarification": boolean,
  "clarificationQuestion": string | null,
  "explanation": string
}
`.trim(),
    messages: [
      {
        role: "user",
        content: `
Available Airtable fields:
${schemaContext}

User request:
${JSON.stringify(userRequest)}
`.trim(),
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Claude did not return valid JSON: ${text}`);
  }

  return FormulaPlanSchema.parse(parsed);
}

// -----------------------------------------------------------------------------
// 6. Validate Claude's proposal
// -----------------------------------------------------------------------------

/**
 * DISCERNMENT:
 * Valid JSON is not enough. A plausible formula can still be wrong.
 * We validate:
 * 1. Every referenced field exists.
 * 2. Formula field references match the proposed references.
 * 3. Arithmetic operations use compatible field types.
 * 4. The output does not contain obviously unsafe or malformed content.
 */
function validateFormulaPlan(
  plan: FormulaPlan,
  fields: AirtableField[],
): void {
  if (plan.needsClarification) return;
  if (!plan.formula) throw new Error("Formula is required");

  const fieldsByName = new Map(fields.map((field) => [field.name, field]));

  for (const referencedField of plan.referencedFields) {
    if (!fieldsByName.has(referencedField)) {
      throw new Error(
        `Claude referenced a field that does not exist: ${referencedField}`,
      );
    }
  }

  // Extract all Airtable references such as {Salary} from the formula.
  const formulaReferences = [
    ...plan.formula.matchAll(/\{([^{}]+)\}/g),
  ].map((match) => match[1]);

  for (const reference of formulaReferences) {
    if (!fieldsByName.has(reference)) {
      throw new Error(`Formula contains unknown field: ${reference}`);
    }
  }

  const declared = new Set(plan.referencedFields);
  for (const reference of formulaReferences) {
    if (!declared.has(reference)) {
      throw new Error(
        `Formula references ${reference}, but Claude omitted it from referencedFields`,
      );
    }
  }

  // This is intentionally a conservative interview-level check, not a full
  // Airtable formula parser.
  if (/[;\n\r]/.test(plan.formula)) {
    throw new Error("Formula contains unexpected separators or newlines");
  }

  const usesArithmetic = /[+\-*/]/.test(plan.formula);
  if (usesArithmetic) {
    const numericTypes = new Set([
      "number",
      "currency",
      "percent",
      "rating",
      "duration",
      "count",
      "autoNumber",
    ]);

    for (const reference of formulaReferences) {
      const field = fieldsByName.get(reference)!;
      if (!numericTypes.has(field.type)) {
        throw new Error(
          `Arithmetic formula uses non-numeric field ${reference} (${field.type})`,
        );
      }
    }
  }
}

// -----------------------------------------------------------------------------
// 7. Detect or configure API capability
// -----------------------------------------------------------------------------

/**
 * DILIGENCE:
 * Do not let Claude decide whether an API supports an operation.
 * Capability comes from official documentation, supplied interview tooling,
 * or a controlled feature flag.
 *
 * For the public-API-safe interview version, default to false. If the interviewer
 * provides a custom endpoint or confirms formula-field creation is supported,
 * change this capability intentionally.
 */
function getCapabilities(): Capability {
  return {
    canCreateFormulaField:
      process.env.AIRTABLE_CAN_CREATE_FORMULA_FIELD === "true",
  };
}

// -----------------------------------------------------------------------------
// 8. Prepare the change without mutating Airtable
// -----------------------------------------------------------------------------

async function prepareFormulaChange(
  userRequest: string,
): Promise<PreparedChange> {
  const fields = await getTableFields();
  const plan = await generateFormulaPlan(userRequest, fields);

  if (plan.needsClarification) {
    return {
      status: "clarification_required",
      question:
        plan.clarificationQuestion ??
        "Could you clarify the intended calculation?",
    };
  }

  validateFormulaPlan(plan, fields);

  const capabilities = getCapabilities();

  if (!capabilities.canCreateFormulaField) {
    return {
      status: "manual_action_required",
      fieldName: plan.fieldName,
      formula: plan.formula!,
      reason:
        "Formula-field creation has not been enabled for the supplied Airtable API environment.",
      dataChanged: false,
    };
  }

  // Schema changes should be previewed before execution.
  return {
    status: "ready_for_approval",
    plan,
    dataChanged: false,
  };
}

// -----------------------------------------------------------------------------
// 9. Optional execution path — only after capability verification and approval
// -----------------------------------------------------------------------------

/**
 * This function is intentionally isolated. It should only be called when:
 * - the interviewer confirms the endpoint supports creating formula fields;
 * - the user has reviewed the proposed field name and formula;
 * - the token has the required scope;
 * - retries/idempotency have been considered.
 *
 * The request shape may depend on the exact Airtable or custom interview API.
 * Do not invent an endpoint during the interview. Adapt this function only from
 * the documentation or tooling provided in the exercise.
 */
async function createFormulaFieldAfterApproval(
  plan: FormulaPlan,
): Promise<unknown> {
  if (!getCapabilities().canCreateFormulaField) {
    throw new Error("Formula-field creation capability is disabled");
  }

  // Example boundary only. Verify the exact endpoint and payload first.
  return airtableRequest(
    `/meta/bases/${config.airtableBaseId}/tables/${config.airtableTableId}/fields`,
    {
      method: "POST",
      body: JSON.stringify({
        name: plan.fieldName,
        type: "formula",
        options: {
          formula: plan.formula,
        },
      }),
    },
  );
}

// -----------------------------------------------------------------------------
// 10. Alternative fallback: materialize values into a normal number field
// -----------------------------------------------------------------------------

/**
 * This is NOT equivalent to a formula field:
 * - A formula field recalculates automatically.
 * - Materialized values can become stale when source values change.
 *
 * Use this only if the interviewer explicitly approves the tradeoff.
 * For a generic formula, evaluating it safely requires a real parser/evaluator.
 * Never use JavaScript eval() on Claude output.
 */
async function materializeSimpleSalaryAddition(
  sourceField: string,
  destinationField: string,
  addend: number,
): Promise<void> {
  const encodedTable = encodeURIComponent(config.airtableTableId);

  const page = await airtableRequest<{
    records: Array<{
      id: string;
      fields: Record<string, unknown>;
    }>;
  }>(`/${config.airtableBaseId}/${encodedTable}?pageSize=100`);

  const updates = page.records.map((record) => {
    const value = record.fields[sourceField];

    if (typeof value !== "number") {
      throw new Error(
        `Record ${record.id} has a non-numeric ${sourceField} value`,
      );
    }

    return {
      id: record.id,
      fields: {
        [destinationField]: value + addend,
      },
    };
  });

  // Airtable record writes should be batched according to the documented limit.
  for (let index = 0; index < updates.length; index += 10) {
    const batch = updates.slice(index, index + 10);

    await airtableRequest(
      `/${config.airtableBaseId}/${encodedTable}`,
      {
        method: "PATCH",
        body: JSON.stringify({ records: batch }),
      },
    );
  }
}

// -----------------------------------------------------------------------------
// 11. Demo CLI
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  const userRequest = process.argv.slice(2).join(" ").trim();

  if (!userRequest) {
    console.error(
      'Usage: npx tsx airtable_ai_fluency_interview.ts "add two to salary"',
    );
    process.exitCode = 1;
    return;
  }

  const result = await prepareFormulaChange(userRequest);

  // The result is a preview. No mutation occurs in prepareFormulaChange().
  console.log(JSON.stringify(result, null, 2));

  if (result.status === "ready_for_approval") {
    console.log("\nReview the plan before executing any schema change.");

    // In an interview, explain that this would be triggered by an explicit
    // approval action rather than automatically.
    // const createdField = await createFormulaFieldAfterApproval(result.plan);
    // console.log(createdField);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed safely: ${message}`);
  process.exitCode = 1;
});
