/**
 * Interview question: Expense Policy Engine
 *
 * Build an in-memory engine that evaluates company expense reports against
 * configurable policy rules.
 *
 * The system supports two kinds of rules:
 *
 * 1. ExpenseRule
 *    Evaluates one expense at a time.
 *    Example: "Flag any meal expense greater than $100."
 *
 * 2. GroupRule
 *    Groups expenses by a field, filters expenses inside each group, then
 *    evaluates an aggregate value.
 *    Example: "Flag any employee whose total travel expenses exceed $1,000."
 *
 * Requirement summary:
 * - Conditions compare an expense field with a configured value.
 * - A single expense violates an ExpenseRule only when all rule conditions match.
 * - A group violates a GroupRule when the aggregated total matches the rule's
 *   aggregate condition.
 * - Missing fields do not match normal conditions.
 * - Numeric comparison operators coerce both sides to numbers.
 *
 * Implementation plan:
 * - Represent each condition as a reusable Condition class.
 * - Represent per-expense policies as ExpenseRule.
 * - Represent aggregate policies as GroupRule.
 * - Evaluate all expense rules first.
 * - Evaluate all group rules second.
 * - Return structured violation objects that explain what failed and why.
 *
 * Complexity:
 * - Expense rules: O(E * R * C), where E is expenses, R is expense rules, and
 *   C is conditions per rule.
 * - Group rules: O(G * E * F), plus aggregation work, where G is group rules
 *   and F is filter conditions.
 * - Space: O(E) per group rule in the worst case for grouping.
 */
const Operator = {
  EQUALS: "==",
  NOT_EQUALS: "!=",
  GREATER_THAN: ">",
  LESS_THAN: "<",
  GREATER_THAN_OR_EQUAL: ">=",
  LESS_THAN_OR_EQUAL: "<=",
  IN: "in",
};

class Condition {
  constructor(field, operator, value) {
    this.field = field;
    this.operator = operator;
    this.value = value;
  }

  matches(expense) {
    const rawExpenseValue = expense[this.field];

    // A missing field should not accidentally satisfy a rule.
    if (rawExpenseValue === undefined || rawExpenseValue === null) {
      return false;
    }

    let expenseValue = rawExpenseValue;
    let compareValue = this.value;

    const numericOperators = new Set([
      Operator.GREATER_THAN,
      Operator.LESS_THAN,
      Operator.GREATER_THAN_OR_EQUAL,
      Operator.LESS_THAN_OR_EQUAL,
    ]);

    if (numericOperators.has(this.operator)) {
      // Numeric comparisons should work even when CSV/API data arrives as
      // strings, for example "125.50" > 100.
      expenseValue = Number(expenseValue);
      compareValue = Number(compareValue);

      // If either side cannot be interpreted as a number, the condition fails.
      if (Number.isNaN(expenseValue) || Number.isNaN(compareValue)) {
        return false;
      }
    }

    switch (this.operator) {
      case Operator.EQUALS:
        return expenseValue === compareValue;
      case Operator.NOT_EQUALS:
        return expenseValue !== compareValue;
      case Operator.GREATER_THAN:
        return expenseValue > compareValue;
      case Operator.LESS_THAN:
        return expenseValue < compareValue;
      case Operator.GREATER_THAN_OR_EQUAL:
        return expenseValue >= compareValue;
      case Operator.LESS_THAN_OR_EQUAL:
        return expenseValue <= compareValue;
      case Operator.IN:
        // `in` checks membership in a configured allow/block list.
        return Array.isArray(compareValue) && compareValue.includes(expenseValue);
      default:
        throw new Error(`Unsupported operator: ${this.operator}`);
    }
  }
}

class ExpenseRule {
  constructor({ ruleId, description, conditions }) {
    this.ruleId = ruleId;
    this.description = description;
    this.conditions = conditions;
  }

  isViolatedBy(expense) {
    // Conditions are ANDed together. If the interview asks for OR logic, this
    // could become a rule tree with AND/OR nodes.
    return this.conditions.every((condition) => condition.matches(expense));
  }
}

class GroupRule {
  constructor({
    ruleId,
    description,
    groupBy,
    aggregateField,
    aggregateOperator,
    threshold,
    filterConditions = [],
  }) {
    this.ruleId = ruleId;
    this.description = description;
    this.groupBy = groupBy;
    this.aggregateField = aggregateField;
    this.aggregateOperator = aggregateOperator;
    this.threshold = threshold;
    this.filterConditions = filterConditions;
  }

  expensePassesFilter(expense) {
    // Filters decide which expenses participate in the aggregate.
    return this.filterConditions.every((condition) => condition.matches(expense));
  }

  isAggregateViolated(total) {
    // Reuse Condition so aggregate comparisons behave exactly like ordinary
    // numeric comparisons.
    return new Condition(
      "aggregate_value",
      this.aggregateOperator,
      this.threshold
    ).matches({
      aggregate_value: total,
    });
  }
}

function evaluateExpenseRules(rules, expenses) {
  const violations = [];

  for (const expense of expenses) {
    const expenseId = expense.expense_id ?? "unknown";

    for (const rule of rules) {
      if (rule.isViolatedBy(expense)) {
        // Return enough context for an API/UI to show the violation.
        violations.push({
          type: "EXPENSE",
          expenseId,
          ruleId: rule.ruleId,
          reason: rule.description,
        });
      }
    }
  }

  return violations;
}

function evaluateGroupRules(groupRules, expenses) {
  const violations = [];

  for (const rule of groupRules) {
    const groups = new Map();

    // First group expenses by the configured field, such as employee_id.
    for (const expense of expenses) {
      const groupId = expense[rule.groupBy];

      if (groupId === undefined || groupId === null) {
        continue;
      }

      if (!groups.has(groupId)) {
        groups.set(groupId, []);
      }

      groups.get(groupId).push(expense);
    }

    // Then filter and aggregate within each group.
    for (const [groupId, groupExpenses] of groups.entries()) {
      const filteredExpenses = groupExpenses.filter((expense) =>
        rule.expensePassesFilter(expense)
      );

      let total = 0;
      const expenseIds = [];

      for (const expense of filteredExpenses) {
        const amount = Number(expense[rule.aggregateField]);

        // Ignore non-numeric aggregate values rather than failing the entire
        // group. A stricter implementation could return validation errors.
        if (Number.isNaN(amount)) {
          continue;
        }

        total += amount;
        expenseIds.push(expense.expense_id);
      }

      if (rule.isAggregateViolated(total)) {
        violations.push({
          type: "GROUP",
          groupId,
          ruleId: rule.ruleId,
          reason: rule.description,
          actualValue: Number(total.toFixed(2)),
          threshold: rule.threshold,
          expenseIds,
        });
      }
    }
  }

  return violations;
}

function evaluateAllRules({ expenseRules, groupRules, expenses }) {
  return {
    expenseViolations: evaluateExpenseRules(expenseRules, expenses),
    groupViolations: evaluateGroupRules(groupRules, expenses),
  };
}

/**
 * Manual test scenarios:
 *
 * Scenario 1: single-expense violation
 *
 * const expenseRules = [
 *   new ExpenseRule({
 *     ruleId: "meal-over-100",
 *     description: "Meal expense cannot exceed $100",
 *     conditions: [
 *       new Condition("category", Operator.EQUALS, "meal"),
 *       new Condition("amount", Operator.GREATER_THAN, 100),
 *     ],
 *   }),
 * ];
 *
 * const groupRules = [];
 *
 * const expenses = [
 *   { expense_id: "e1", employee_id: "u1", category: "meal", amount: 120 },
 *   { expense_id: "e2", employee_id: "u1", category: "meal", amount: 80 },
 * ];
 *
 * evaluateAllRules({ expenseRules, groupRules, expenses });
 *
 * Expected output:
 * {
 *   expenseViolations: [
 *     {
 *       type: "EXPENSE",
 *       expenseId: "e1",
 *       ruleId: "meal-over-100",
 *       reason: "Meal expense cannot exceed $100",
 *     },
 *   ],
 *   groupViolations: [],
 * }
 *
 * Scenario 2: grouped aggregate violation
 *
 * const expenseRules = [];
 *
 * const groupRules = [
 *   new GroupRule({
 *     ruleId: "travel-over-500",
 *     description: "Employee travel total cannot exceed $500",
 *     groupBy: "employee_id",
 *     aggregateField: "amount",
 *     aggregateOperator: Operator.GREATER_THAN,
 *     threshold: 500,
 *     filterConditions: [
 *       new Condition("category", Operator.EQUALS, "travel"),
 *     ],
 *   }),
 * ];
 *
 * const expenses = [
 *   { expense_id: "e1", employee_id: "u1", category: "travel", amount: 300 },
 *   { expense_id: "e2", employee_id: "u1", category: "travel", amount: 250 },
 *   { expense_id: "e3", employee_id: "u1", category: "meal", amount: 200 },
 *   { expense_id: "e4", employee_id: "u2", category: "travel", amount: 400 },
 * ];
 *
 * evaluateAllRules({ expenseRules, groupRules, expenses });
 *
 * Expected output:
 * {
 *   expenseViolations: [],
 *   groupViolations: [
 *     {
 *       type: "GROUP",
 *       groupId: "u1",
 *       ruleId: "travel-over-500",
 *       reason: "Employee travel total cannot exceed $500",
 *       actualValue: 550,
 *       threshold: 500,
 *       expenseIds: ["e1", "e2"],
 *     },
 *   ],
 * }
 *
 * Scenario 3: `in` operator and string numeric amount
 *
 * const expenseRules = [
 *   new ExpenseRule({
 *     ruleId: "blocked-category",
 *     description: "Blocked category submitted",
 *     conditions: [
 *       new Condition("category", Operator.IN, ["alcohol", "gambling"]),
 *     ],
 *   }),
 *   new ExpenseRule({
 *     ruleId: "large-expense",
 *     description: "Expense amount is too large",
 *     conditions: [
 *       new Condition("amount", Operator.GREATER_THAN_OR_EQUAL, 1000),
 *     ],
 *   }),
 * ];
 *
 * const expenses = [
 *   { expense_id: "e1", category: "alcohol", amount: "80" },
 *   { expense_id: "e2", category: "software", amount: "1000" },
 * ];
 *
 * evaluateExpenseRules(expenseRules, expenses);
 *
 * Expected output:
 * [
 *   {
 *     type: "EXPENSE",
 *     expenseId: "e1",
 *     ruleId: "blocked-category",
 *     reason: "Blocked category submitted",
 *   },
 *   {
 *     type: "EXPENSE",
 *     expenseId: "e2",
 *     ruleId: "large-expense",
 *     reason: "Expense amount is too large",
 *   },
 * ]
 */
