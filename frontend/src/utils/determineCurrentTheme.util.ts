export function determineCurrentTheme(localStorageKey: string): 'dark' | 'light' {
  return localStorage.getItem(localStorageKey) === 'true' ? 'dark' : 'light';
}
