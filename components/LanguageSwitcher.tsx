'use client';

import { useTranslation } from 'react-i18next';
import * as Select from '@radix-ui/react-select';
import { Check, Globe, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'es', name: 'Español' }
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select.Root value={i18n.language} onValueChange={handleLanguageChange}>
      <Select.Trigger
        className="flex h-10 w-20 items-center gap-2 rounded-full border border-input bg-background px-3 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={t('selectLanguage')}
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium uppercase">{i18n.language}</span>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={5}
          className="z-[9999] min-w-[180px] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <Select.ScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-white">
            <ChevronUp className="h-4 w-4" />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-1">
            {languages.map((language) => (
              <Select.Item
                key={language.code}
                value={language.code}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                )}
              >
                <Select.ItemText>{language.name}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-white">
            <ChevronDown className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
} 