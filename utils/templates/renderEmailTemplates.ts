const supportedLangs = ['en', 'zh', 'es', 'vi'] as const;
type Lang = (typeof supportedLangs)[number];

const getSafeLang = (lang?: string): Lang => {
  return supportedLangs.includes(lang as Lang) ? (lang as Lang) : 'en';
};

export async function renderLocalizedEmailTemplate(
  templateName: string, 
  lang: string | undefined,
  variables: Record<string, any>
): Promise<{
  subject: string;
  html: string;
}> {
  const handlebars = (await import('handlebars')).default;
  const safeLang = getSafeLang(lang);

  const templateModule = await import(`./email/${templateName}.ts`);
  const template = templateModule.template;
  const compiledHtml = handlebars.compile(template);

  const { email } = await import(`@/app/i18n/${safeLang}/email.ts`);
  const i18nVars = email[templateName] || {};
  const html = compiledHtml({...i18nVars, ...variables});

  const subjectTemplate = email[templateName].subject || '';
  const compiledSubject = handlebars.compile(subjectTemplate);
  const subject = compiledSubject(variables);

  return { subject, html };
}
