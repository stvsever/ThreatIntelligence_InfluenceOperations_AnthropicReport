"""Extract the influence operations figures from the Anthropic threat report.

The influence operations section spans pages 41 to 80 of
"Detecting and countering misuse of AI: September 2026". Every embedded
image in that range is one of the section's numbered figures (Figure 1 to 18).
Images are written in drawing order, so file numbers match figure numbers.

The original JPEG streams are copied byte for byte (no re-encoding).

Usage:
    python src/scripts/extract_figures.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from pypdf import PdfReader
from pypdf.generic import ContentStream

ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "report" / "Anthropic-Detecting-and-countering-091026.pdf"
OUT_DIR = ROOT / "dashboard" / "assets" / "figures"

FIRST_PAGE = 41
LAST_PAGE = 80


def images_in_draw_order(reader: PdfReader, page_index: int) -> list[bytes]:
    """Return the raw JPEG bytes of every image drawn on a page, in order."""
    page = reader.pages[page_index]
    resources = page.get("/Resources")
    if resources is None:
        return []
    xobjects = resources.get_object().get("/XObject")
    if xobjects is None:
        return []
    xobjects = xobjects.get_object()

    content = ContentStream(page.get_contents(), reader)
    found: list[bytes] = []
    for operands, operator in content.operations:
        if operator != b"Do":
            continue
        xobj = xobjects[operands[0]].get_object()
        if xobj.get("/Subtype") != "/Image":
            continue
        filters = xobj.get("/Filter")
        filters = filters if isinstance(filters, list) else [filters]
        if "/DCTDecode" not in filters:
            raise ValueError(f"Unexpected image encoding on page {page_index + 1}: {filters}")
        found.append(xobj.get_data())
    return found


def main() -> int:
    if not PDF_PATH.exists():
        print(f"Report not found: {PDF_PATH}", file=sys.stderr)
        return 1

    reader = PdfReader(str(PDF_PATH))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    figure = 0
    for page_number in range(FIRST_PAGE, LAST_PAGE + 1):
        for data in images_in_draw_order(reader, page_number - 1):
            figure += 1
            target = OUT_DIR / f"fig-{figure:02d}.jpg"
            target.write_bytes(data)
            print(f"Figure {figure:>2}  page {page_number}  {len(data) / 1024:7.1f} KB  {target.name}")

    print(f"\n{figure} figures written to {OUT_DIR.relative_to(ROOT.parent)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
