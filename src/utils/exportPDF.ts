import { jsPDF } from 'jspdf';
import { MealPlanDay } from '../types';

export function exportMealPlanPDF(days: MealPlanDay[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  let y = margin;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(228, 77, 38);
  doc.text('Plan pitaniya', margin, y);
  y += 10;

  doc.setDrawColor(228, 77, 38);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const DAY_COLORS: [number, number, number][] = [
    [99, 102, 241],
    [236, 72, 153],
    [16, 185, 129],
    [245, 158, 11],
    [239, 68, 68],
    [14, 165, 233],
    [168, 85, 247],
  ];

  days.forEach((day, idx) => {
    if (day.recipes.length === 0) return;

    if (y > 260) {
      doc.addPage();
      y = margin;
    }

    // Day header
    const [r, g, b] = DAY_COLORS[idx % DAY_COLORS.length];
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, y - 5, usableWidth, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(day.label, margin + 4, y + 2);
    y += 12;

    // Recipes
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    day.recipes.forEach((recipe, rIdx) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }

      const timeLabel = recipe.readyInMinutes ? ` — ${recipe.readyInMinutes} min` : '';
      const line = `${rIdx + 1}. ${recipe.title}${timeLabel}`;
      const lines = doc.splitTextToSize(line, usableWidth - 8);
      doc.text(lines, margin + 4, y);
      y += lines.length * 6;
    });

    y += 6;
  });

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text('Recipe Finder', margin, doc.internal.pageSize.getHeight() - 10);

  doc.save('meal-plan.pdf');
}
