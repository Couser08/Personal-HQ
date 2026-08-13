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
  matchedRuleIds: string[];
  trace: { type: 'skip' | 'match' | 'halt' | 'final'; text: string }[];
}

export const evaluateConditions = (
  variables: Variable[],
  rules: Rule[],
  defaultOutcome: string,
  stopsOnMatch: boolean = true
): EvaluationResult => {
  const trace: { type: 'skip' | 'match' | 'halt' | 'final'; text: string }[] = [];
  let finalOutcome = defaultOutcome;
  let matchedId: string | null = null;
  const matchedRuleIds: string[] = [];
  const matchedOutcomes: string[] = [];

  for (let idx = 0; idx < rules.length; idx++) {
    const rule = rules[idx];
    const variable = variables.find((v) => v.name === rule.variableName);

    if (!variable) {
      trace.push({
        type: 'skip',
        text: `Rule ${idx + 1} ("${rule.variableName}") skipped: Variable undefined.`
      });
      continue;
    }

    const testValStr = variable.testValue;
    let isMatch = false;

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
      trace.push({
        type: 'skip',
        text: `Rule ${idx + 1} evaluation error: ${(err as Error).message}`
      });
    }

    if (isMatch) {
      trace.push({
        type: 'match',
        text: `Rule ${idx + 1} MATCHED: "${rule.variableName}" (${testValStr}) ${rule.operator.replace(
          '_',
          ' '
        )} "${rule.value}" ➔ Outcome: "${rule.outcome}"`
      });

      if (!matchedId) {
        matchedId = rule.id;
      }
      matchedRuleIds.push(rule.id);
      matchedOutcomes.push(rule.outcome);

      if (stopsOnMatch) {
        finalOutcome = rule.outcome;
        trace.push({
          type: 'halt',
          text: `[First Match Wins] Execution halted at Rule ${idx + 1}. Remaining rules skipped.`
        });
        break;
      }
    } else {
      trace.push({
        type: 'skip',
        text: `Rule ${idx + 1} SKIPPED: "${rule.variableName}" (${testValStr}) ${rule.operator.replace(
          '_',
          ' '
        )} "${rule.value}" (No match)`
      });
    }
  }

  if (matchedRuleIds.length === 0) {
    finalOutcome = defaultOutcome;
    trace.push({
      type: 'final',
      text: `No rules matched. Applied Default Outcome: "${defaultOutcome}".`
    });
  } else if (!stopsOnMatch) {
    finalOutcome = matchedOutcomes.join(' + ');
    trace.push({
      type: 'final',
      text: `[Evaluate All Mode] Combined outcomes: "${finalOutcome}".`
    });
  } else {
    trace.push({
      type: 'final',
      text: `Final Winning Outcome: "${finalOutcome}".`
    });
  }

  return {
    outcome: finalOutcome,
    matchedRuleId: matchedId,
    matchedRuleIds,
    trace
  };
};
