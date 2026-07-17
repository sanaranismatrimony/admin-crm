export function cleanText(raw: string): string {
  let text = raw;

  text = text.replace(/\r\n/g, '\n');

  text = text.replace(/\ufeff/g, '');

  text = text.normalize('NFC');

  text = text.replace(/[\u2018\u2019]/g, "'");
  text = text.replace(/[\u201C\u201D]/g, '"');
  text = text.replace(/[\u2013\u2014]/g, '-');
  text = text.replace(/[\u2022\u2023]/g, '-');
  text = text.replace(/\u00a0/g, ' ');
  text = text.replace(/\u200b/g, '');

  text = text.replace(/[^\S\n]+/g, ' ');

  text = text.replace(/\n{3,}/g, '\n\n');

  text = text.replace(/^[ \t]+|[ \t]+$/gm, '');

  text = text.replace(/^[\s\-–—•*_]+|[\s\-–—•*_]+$/gm, '');

  text = text.split('\n').filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (/^\d{1,2}\s*\/\s*\d{1,2}$/.test(trimmed)) return false;
    if (/^(page|pg)\.?\s*\d+/i.test(trimmed)) return false;
    if (/^\-+\s*\d+\s*\-+$/.test(trimmed)) return false;
    return true;
  }).join('\n');

  text = text.replace(/([a-z,;:])\n([a-z])/g, '$1 $2');

  text = text.replace(/[ \t]+\n/g, '\n');

  text = text.trim();

  return text;
}
