export const DEFAULT_APP_PASSWORD = 'Tank@047';

export function checkPassword(input, expected = DEFAULT_APP_PASSWORD) {
  return input === expected;
}
