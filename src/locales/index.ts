import zh from './zh.json';

const messages = { zh } as const;

type Locale = keyof typeof messages;

let currentLocale: Locale = 'zh';

export function t(path: string): string {
  const keys = path.split('.');
  let value: any = messages[currentLocale];
  for (const key of keys) {
    value = value?.[key];
    if (value == null) return '';
  }
  return value;
}
