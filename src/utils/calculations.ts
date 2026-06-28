export type InterestType = 'SI' | 'CI';
export type TimeUnit = 'years' | 'months';
export type CompoundFrequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly';

const COMPOUND_PERIODS: Record<CompoundFrequency, number> = {
  annually: 1,
  'semi-annually': 2,
  quarterly: 4,
  monthly: 12,
};

export const toYears = (time: number, unit: TimeUnit) => unit === 'months' ? time / 12 : time;

export const calculateInterest = ({
  type,
  principal,
  rate,
  time,
  timeUnit,
  compoundFrequency = 'annually',
}: {
  type: InterestType;
  principal: number;
  rate: number;
  time: number;
  timeUnit: TimeUnit;
  compoundFrequency?: CompoundFrequency;
}) => {
  if (principal <= 0 || rate <= 0 || time <= 0) {
    throw new Error('Values must be positive numbers.');
  }

  const years = toYears(time, timeUnit);
  if (type === 'SI') {
    const interest = (principal * rate * years) / 100;
    return { interest, totalAmount: principal + interest };
  }

  const periods = COMPOUND_PERIODS[compoundFrequency];
  const totalAmount = principal * Math.pow(1 + rate / (100 * periods), periods * years);
  return { interest: totalAmount - principal, totalAmount };
};
