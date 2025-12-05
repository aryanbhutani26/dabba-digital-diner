// Currency formatting utility
// Change this to switch between currencies

export const CURRENCY_SYMBOL = '£'; // GBP (British Pound)
export const CURRENCY_CODE = 'GBP';

export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  return `${CURRENCY_SYMBOL}${numAmount.toFixed(2)}`;
};

export const formatCurrencyWhole = (amount: number | string): string => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  return `${CURRENCY_SYMBOL}${Math.round(numAmount)}`;
};
