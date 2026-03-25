import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export type ResumePdfPageSize = "a4" | "letter";

interface ExportResumeToPdfOptions {
  resumeElement: HTMLDivElement;
  fileName: string;
  pageSize?: ResumePdfPageSize;
}

const PAGE_CONFIG = {
  a4: { widthMm: 210, heightMm: 297, renderWidthPx: 794 },
  letter: { widthMm: 215.9, heightMm: 279.4, renderWidthPx: 816 },
} as const;

const MARGIN_MM = 6;
const BREAKPOINT_SELECTORS = [
  "[data-pdf-section]",
  ".experience-item",
  ".education-item",
  ".project-item",
  "section > div",
  "section > ul > li",
  "section > ol > li",
  "tbody > tr",
  "ul > li",
  "ol > li",
  "p",
];

const CANVAS_OPTIONS = {
  scale: 2.5,
  useCORS: true,
  logging: false,
  backgroundColor: "#ffffff",
} as const;

const createSliceCanvas = (source: HTMLCanvasElement, startY: number, endY: number) => {
  const clampedStart = Math.max(0, Math.floor(startY));
  const clampedEnd = Math.min(source.height, Math.ceil(endY));
  const sliceHeight = Math.max(1, clampedEnd - clampedStart);

  const slice = document.createElement("canvas");
  slice.width = source.width;
  slice.height = sliceHeight;

  const ctx = slice.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context for PDF export");
  }

  ctx.drawImage(source, 0, clampedStart, source.width, sliceHeight, 0, 0, source.width, sliceHeight);
  return slice;
};

const collectBreakpoints = (root: HTMLElement, scaleY: number, canvasHeight: number) => {
  const rootRect = root.getBoundingClientRect();
  const points = new Set<number>([0, canvasHeight]);

  const elements = Array.from(
    root.querySelectorAll<HTMLElement>(BREAKPOINT_SELECTORS.join(","))
  );

  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    if (rect.height < 4) continue;

    const bottom = Math.round((rect.bottom - rootRect.top) * scaleY);
    if (bottom > 0 && bottom < canvasHeight) {
      points.add(bottom);
    }
  }

  return Array.from(points).sort((a, b) => a - b);
};

const buildSlices = (canvasHeight: number, pageHeightPx: number, breakpoints: number[]) => {
  const slices: Array<{ start: number; end: number }> = [];
  const minSliceHeight = Math.max(48, Math.floor(pageHeightPx * 0.2));

  let start = 0;
  while (start < canvasHeight - 1) {
    const hardEnd = Math.min(canvasHeight, start + pageHeightPx);

    if (hardEnd >= canvasHeight - 1) {
      slices.push({ start, end: canvasHeight });
      break;
    }

    const candidates = breakpoints.filter((point) => point > start + minSliceHeight && point <= hardEnd);
    let end = candidates.length > 0 ? candidates[candidates.length - 1] : hardEnd;

    const remaining = canvasHeight - end;
    if (remaining > 0 && remaining < minSliceHeight) {
      end = canvasHeight;
    }

    if (end <= start + 2) {
      end = hardEnd;
    }

    slices.push({ start, end });
    start = end;
  }

  return slices;
};

const createExportClone = (resumeElement: HTMLDivElement, renderWidthPx: number) => {
  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-10000px";
  mount.style.top = "0";
  mount.style.width = `${renderWidthPx}px`;
  mount.style.background = "#ffffff";
  mount.style.pointerEvents = "none";
  mount.style.opacity = "0";
  mount.style.zIndex = "-1";

  const clone = resumeElement.cloneNode(true) as HTMLDivElement;
  clone.style.width = "100%";
  clone.style.minHeight = "auto";
  clone.style.height = "auto";

  mount.appendChild(clone);
  document.body.appendChild(mount);

  return { mount, clone };
};

export const exportResumeToPdf = async ({
  resumeElement,
  fileName,
  pageSize = "a4",
}: ExportResumeToPdfOptions) => {
  const config = PAGE_CONFIG[pageSize];
  const pageWidthMm = config.widthMm;
  const pageHeightMm = config.heightMm;
  const contentWidthMm = pageWidthMm - MARGIN_MM * 2;
  const contentHeightMm = pageHeightMm - MARGIN_MM * 2;

  const { mount, clone } = createExportClone(resumeElement, config.renderWidthPx);

  try {
    const canvas = await html2canvas(clone, {
      ...CANVAS_OPTIONS,
      windowWidth: clone.scrollWidth,
    });

    const cloneHeight = clone.getBoundingClientRect().height || 1;
    const scaleY = canvas.height / cloneHeight;
    const mmPerPx = contentWidthMm / canvas.width;
    const pageHeightPx = contentHeightMm / mmPerPx;

    const breakpoints = collectBreakpoints(clone, scaleY, canvas.height);
    const slices = buildSlices(canvas.height, pageHeightPx, breakpoints);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: pageSize,
    });

    slices.forEach(({ start, end }, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      const sliceCanvas = createSliceCanvas(canvas, start, end);
      const sliceHeightMm = sliceCanvas.height * mmPerPx;

      pdf.addImage(
        sliceCanvas.toDataURL("image/png"),
        "PNG",
        MARGIN_MM,
        MARGIN_MM,
        contentWidthMm,
        sliceHeightMm,
        undefined,
        "FAST"
      );
    });

    pdf.save(`${fileName || "resume"}.pdf`);
  } finally {
    mount.remove();
  }
};
