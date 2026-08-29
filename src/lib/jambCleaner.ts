/**
 * Cleans MS-Word generated HTML garbage often found in JAMB IBASS API responses.
 * Removes XML-like tags, MSO styles, and unnecessary attributes.
 */
export const cleanJambHtml = (html: string | null | undefined): string => {
  if (!html) return "";

  let cleaned = html;

  // 1. Remove XML-like tags and Word-specific junk
  // Removes <o:p>...</o:p> blocks and their content
  cleaned = cleaned.replace(/<o:p>.*?<\/o:p>/gi, "");
  // Removes other XML-like tags (e.g., <xml>, <w:br>, <st1:..>)
  cleaned = cleaned.replace(/<\/?(o:p|xml|st1|w:|meta|link).*?>/gi, "");
  
  // 2. Remove CSS/Style attributes specifically targetting MS Office styles
  cleaned = cleaned.replace(/mso-[^:;]+:[^:;]+;?/gi, "");
  // Remove generic style, class, and language attributes
  cleaned = cleaned.replace(/\s+(style|class|lang|dir)=['"][^'"]*['"]/gi, "");

  // 3. Cleanup spacing and formatting
  // Replace multiple spaces/newlines with a single space
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // 4. Optionally remove empty tags
  cleaned = cleaned.replace(/<(span|p|div|li|td|tr|table|ul|ol|font|b|i|u|strong|em|br|hr|h\d)>(?:\s|&nbsp;)*<\/\1>/gi, "");

  return cleaned;
};
