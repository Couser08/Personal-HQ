export interface Variable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  testValue: string;
}

export interface Rule {
  id: string;
  variableName: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: string;
  outcome: string;
}

export interface EvaluationResult {
  outcome: string;
  matchedRuleId: string | null;
  trace: string[];
}

export const evaluateConditions = (
  variables: Variable[],
  rules: Rule[],
  defaultOutcome: string
): EvaluationResult => {
  const trace: string[] = [];
  let finalOutcome = defaultOutcome;
  let matchedId: string | null = null;

  for (const rule of rules) {
    const variable = variables.find(v => v.name === rule.variableName);
    if (!variable) {
      trace.push(`Rule "${rule.variableName} ${rule.operator}": Variable not defined.`);
      continue;
    }

    const testValStr = variable.testValue;
    let isMatch = false;

    // Operator Logic
    try {
      if (rule.operator === 'equals') {
        isMatch = String(testValStr) === String(rule.value);
      } else if (rule.operator === 'not_equals') {
        isMatch = String(testValStr) !== String(rule.value);
      } else if (rule.operator === 'greater_than') {
        isMatch = Number(testValStr) > Number(rule.value);
      } else if (rule.operator === 'less_than') {
        isMatch = Number(testValStr) < Number(rule.value);
      } else if (rule.operator === 'contains') {
        isMatch = String(testValStr).includes(String(rule.value));
      } else if (rule.operator === 'regex') {
        const re = new RegExp(rule.value);
        isMatch = re.test(String(testValStr));
      }
    } catch (err) {
      trace.push(`Rule failed evaluation: ${(err as Error).message}`);
    }

    if (isMatch) {
      trace.push(
        `Rule verified MATCH: Variable "${rule.variableName}" (${testValStr}) ${rule.operator.replace(
          '_',
          ' '
        )} "${rule.value}" matches.`
      );
      finalOutcome = rule.outcome;
      matchedId = rule.id;
      break; // Match first rule
    } else {
      trace.push(
        `Rule skipped: Variable "${rule.variableName}" (${testValStr}) ${rule.operator.replace(
          '_',
          ' '
        )} "${rule.value}" did NOT match.`
      );
    }
  }

  if (!matchedId) {
    trace.push(`No rules matched. Applying Default Outcome: "${defaultOutcome}".`);
  }

  return { outcome: finalOutcome, matchedRuleId: matchedId, trace };
};
