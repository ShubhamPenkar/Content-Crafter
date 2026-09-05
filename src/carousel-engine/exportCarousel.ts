import { CarouselProject } from './types';

/**
 * Downloads a CarouselProject as a structured JSON file
 */
export function exportCarouselAsJson(project: CarouselProject, fileName?: string): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const cleanName = (fileName || project.title || 'jodoco-carousel')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanName}-carousel.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies a markdown summary of carousel slides to clipboard
 */
export function formatCarouselMarkdown(project: CarouselProject): string {
  const lines: string[] = [];
  lines.push(`# ${project.title}`);
  lines.push(`**Topic**: ${project.topic}`);
  lines.push(`**Hook Angle**: ${project.hookAngle || 'N/A'}`);
  lines.push(`**Total Slides**: ${project.slides.length}`);
  lines.push('');

  project.slides.forEach((slide) => {
    lines.push(`---`);
    lines.push(`### Slide ${slide.slideNumber} [${slide.template.toUpperCase()}]`);
    if (slide.categoryBadge) lines.push(`*Badge: ${slide.categoryBadge}*`);
    lines.push(`**Headline**: ${slide.headline}`);
    if (slide.subHeadline) lines.push(`*${slide.subHeadline}*`);
    if (slide.body) lines.push(`\n${slide.body}`);
    if (slide.supportingBullets && slide.supportingBullets.length > 0) {
      lines.push('');
      slide.supportingBullets.forEach((b) => lines.push(`- ${b}`));
    }
    if (slide.takeaway) lines.push(`\n> **Key Takeaway**: ${slide.takeaway}`);
    if (slide.ctaText) lines.push(`\n**CTA**: [${slide.ctaText}] (${slide.ctaSubtext || ''})`);
    lines.push('');
  });

  return lines.join('\n');
}
