import JSZip from 'jszip';

export async function downloadFrontendZip() {
  const zip = new JSZip();

  // Import raw text content of project files using Vite's import.meta.glob
  const importMeta = import.meta as unknown as {
    glob: <T>(pattern: string[], options: Record<string, unknown>) => Record<string, T>;
  };
  const files = importMeta.glob<string>(
    ['/src/**/*', '/package.json', '/vite.config.ts', '/index.html', '/tsconfig.json', '/README.md'],
    { query: '?raw', import: 'default', eager: true }
  );

  let fileCount = 0;
  for (const path in files) {
    // strip leading slash for zip structure
    const relativePath = path.startsWith('/') ? path.slice(1) : path;
    const content = files[path];
    if (typeof content === 'string') {
      zip.file(relativePath, content);
      fileCount++;
    }
  }

  // Add a helpful README if not present
  if (!zip.file('README.md')) {
    zip.file(
      'README.md',
      `# AssemblyGuard AI - Industrial Vision Supervision Frontend

This project was generated using React 18, Vite, Tailwind CSS, and Lucide/Material icons.

## Quick Start Instructions

1. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start Development Server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Build Production Assets:**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Preview Production Build:**
   \`\`\`bash
   npm run preview
   \`\`\`

## Features Included
- Live Video Camera Feed & Video Upload Processing Window
- Real-Time AI Bounding Boxes, Laser Scanner & Telemetry Overlay
- Assembly Progress Checklist & Violation Logs
- Interactive Snapshot & AI Vision Defect Modal
- Quality Control Analytics & Downloadable Excel (.xlsx) Reports
- Shift Audit Trail History & Custom Operator Settings
`
    );
  }

  // Generate zip file and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AssemblyGuard_AI_Frontend_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileCount;
}
