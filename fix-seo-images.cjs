const fs = require('fs');

let content = fs.readFileSync('api/seo.ts', 'utf8');

content = content.replace(
  `  } else if (cleanPath === '/postutme' || cleanPath === '/post-utme' || cleanPath === '/result-slip' || cleanPath === '/result') {
    title = "2026/2027 Post-UTME Screening Hub & Release Dates | CampusAI";
    description = "Official tracking for 2026 Post-UTME registration dates, screening schedules, and merit cut-off marks for Nigerian federal and state universities.";`,
  `  } else if (cleanPath === '/postutme' || cleanPath === '/post-utme' || cleanPath === '/result-slip' || cleanPath === '/result') {
    title = "2026/2027 Post-UTME Screening Hub & Release Dates | CampusAI";
    description = "Official tracking for 2026 Post-UTME registration dates, screening schedules, and merit cut-off marks for Nigerian federal and state universities.";
    imageUrl = \`\${siteDomain}/api/og-image?title=\${encodeURIComponent("Check Admissions")}&category=\${encodeURIComponent("CampusAI Tools")}\`;`
);

content = content.replace(
  `  } else if (cleanPath === '/status') {
    title = "System Status & Service Uptime | CampusAI Nigeria";
    description = "Real-time status and uptime for CampusAI Nigeria admission strategist nodes, database sync, and calculator services.";`,
  `  } else if (cleanPath === '/status') {
    title = "System Status & Service Uptime | CampusAI Nigeria";
    description = "Real-time status and uptime for CampusAI Nigeria admission strategist nodes, database sync, and calculator services.";
    imageUrl = \`\${siteDomain}/api/og-image?title=\${encodeURIComponent("System Status")}&category=\${encodeURIComponent("CampusAI Platform")}\`;`
);

content = content.replace(
  `  } else if (cleanPath === '/dashboard') {
    title = "Student Admission Dashboard & Tracker 2026 | CampusAI";
    description = "Monitor your JAMB scores, university merit chances, and academic progress in real-time with personalized AI insights on CampusAI.";`,
  `  } else if (cleanPath === '/dashboard') {
    title = "Student Admission Dashboard & Tracker 2026 | CampusAI";
    description = "Monitor your JAMB scores, university merit chances, and academic progress in real-time with personalized AI insights on CampusAI.";
    imageUrl = \`\${siteDomain}/api/og-image?title=\${encodeURIComponent("Student Dashboard")}&category=\${encodeURIComponent("Admission Tracker")}\`;`
);

content = content.replace(
  `  } else if (cleanPath === '/news') {
    title = "2026/2027 JAMB & Admission News Hub | CampusAI";
    description = "Stay informed with real-time JAMB updates, university Post-UTME registration dates, cutoff marks, and admission news across Nigerian institutions.";`,
  `  } else if (cleanPath === '/news') {
    title = "2026/2027 JAMB & Admission News Hub | CampusAI";
    description = "Stay informed with real-time JAMB updates, university Post-UTME registration dates, cutoff marks, and admission news across Nigerian institutions.";
    imageUrl = \`\${siteDomain}/api/og-image?title=\${encodeURIComponent("University News")}&category=\${encodeURIComponent("Admission Updates")}\`;`
);

content = content.replace(
  `  } else if (cleanPath === '/calculator') {
    title = "Official 2026 JAMB & University Aggregate Calculator | CampusAI";
    description = "Calculate your 2026 university aggregate score automatically. Supports UNILAG, LASU, UI, OAU, UNIBEN, and 50+ other Nigerian institutions.";`,
  `  } else if (cleanPath === '/calculator') {
    title = "Official 2026 JAMB & University Aggregate Calculator | CampusAI";
    description = "Calculate your 2026 university aggregate score automatically. Supports UNILAG, LASU, UI, OAU, UNIBEN, and 50+ other Nigerian institutions.";
    imageUrl = \`\${siteDomain}/api/og-image?title=\${encodeURIComponent("Aggregate Score Calculator")}&category=\${encodeURIComponent("CampusAI Tools")}\`;`
);

content = content.replace(
  `    if (schoolSlug) {
      title = \`\${schoolSlug} 2026 Aggregate Calculator | CampusAI\`;
      description = \`Calculate your 2026 \${schoolSlug} aggregate score and check your admission chances instantly. Use the official formula, cutoff marks, and catchment area rules for \${schoolSlug}.\`;`,
  `    if (schoolSlug) {
      title = \`\${schoolSlug} 2026 Aggregate Calculator | CampusAI\`;
      description = \`Calculate your 2026 \${schoolSlug} aggregate score and check your admission chances instantly. Use the official formula, cutoff marks, and catchment area rules for \${schoolSlug}.\`;
      imageUrl = \`\${siteDomain}/api/og-image?title=\${encodeURIComponent(\`\${schoolSlug} Agg. Calculator\`)}&category=\${encodeURIComponent(\`\${schoolSlug}\`)}\`;`
);

if (content.indexOf('/syllabus') === -1) {
  content = content.replace(
    `  } else if (cleanPath === '/postutme' || cleanPath === '/post-utme' || cleanPath === '/result-slip' || cleanPath === '/result') {`,
    `  } else if (cleanPath === '/syllabus' || cleanPath.startsWith('/syllabus/')) {
    title = "Official 2026 JAMB Syllabus & Subject Outlines | CampusAI";
    description = "Access the complete, updated 2026 JAMB syllabus for all subjects. Get detailed topics, recommended texts, and admission insights from CampusAI.";
    imageUrl = \`\${siteDomain}/api/og-image?title=\${encodeURIComponent("Syllabus Finder")}&category=\${encodeURIComponent("CampusAI Tools")}\`;
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "JAMB Syllabus Finder 2026",
      "url": canonical,
      "description": description,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All"
    };
  } else if (cleanPath === '/postutme' || cleanPath === '/post-utme' || cleanPath === '/result-slip' || cleanPath === '/result') {`
  );
}

fs.writeFileSync('api/seo.ts', content);
console.log('Done!');
