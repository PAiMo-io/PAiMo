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
  const fs = await import('fs/promises')
  const path = await import('path')

  const safeLang = getSafeLang(lang);

  const templateModule = await import(`./email/${templateName}.ts`);
  const template = templateModule.template;
  const compiledHtml = handlebars.compile(template);

  const i18nPath = path.resolve(
    process.cwd(),
    'app/i18n',
    `${safeLang}/email.json`
  );
  const i18nJson = JSON.parse(await fs.readFile(i18nPath, 'utf-8'));
  const i18nVars = i18nJson[templateName] || {};
  const html = compiledHtml({...i18nVars, ...variables});

  const subjectJson = JSON.parse(await fs.readFile(i18nPath, 'utf-8'));
  const subjectTemplate = subjectJson[templateName].subject || '';
  const compiledSubject = handlebars.compile(subjectTemplate);
  const subject = compiledSubject(variables);

  return { subject, html };
}
