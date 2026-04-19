"""
touch-vs-click.pptx — 4 slides (no separate patterns slide); examples live inside 1–3.
Requires: pip install python-pptx
"""
from __future__ import annotations

from pathlib import Path

from pptx import Presentation
from pptx.util import Inches, Pt


def add_slide_title_body(prs: Presentation, title: str, lines: list[str], *, size: int = 22) -> None:
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    slide.shapes.title.text = title
    body = slide.placeholders[1].text_frame
    body.clear()
    for i, line in enumerate(lines):
        p = body.paragraphs[0] if i == 0 else body.add_paragraph()
        p.text = line
        p.level = 0
        p.font.name = "Calibri"
        p.font.size = Pt(size)


def add_slide3_windows_vs_touch(prs: Presentation) -> None:
    slide = prs.slides.add_slide(prs.slide_layouts[5])
    slide.shapes.title.text = "3 — Windows vs touchscreen (same click())"

    sub = slide.shapes.add_textbox(Inches(0.55), Inches(1.02), Inches(12.2), Inches(0.42))
    stf = sub.text_frame
    stf.word_wrap = True
    stf.text = (
        "click ≠ mousedown. Finger → click is common, not guaranteed. "
        "e.g. [1 tap] on phone: one press → touch* + pointer* + mouse* + click in the log."
    )
    for p in stf.paragraphs:
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.italic = True

    rows = [
        ["", "Windows", "Touch"],
        ["Stream", "pointer* + mousedown…", "touchstart… + pointer*"],
        ["touch*", "No", "Yes"],
        ["mouse*", "Yes (real)", "Often synth"],
        ["click", "Usually", "Often"],
        ["Same", 'addEventListener("click")', 'addEventListener("click")'],
    ]
    left, top = Inches(0.55), Inches(1.48)
    width, height = Inches(12.2), Inches(4.45)
    tbl = slide.shapes.add_table(len(rows), len(rows[0]), left, top, width, height).table
    tbl.columns[0].width = Inches(1.5)
    tbl.columns[1].width = Inches(5.2)
    tbl.columns[2].width = Inches(5.2)

    for r, row in enumerate(rows):
        for c, text in enumerate(row):
            cell = tbl.cell(r, c)
            cell.text = str(text)
            for p in cell.text_frame.paragraphs:
                p.font.name = "Calibri"
                p.font.size = Pt(13 if r == 0 else 12)
                p.font.bold = bool(r == 0)

    foot = slide.shapes.add_textbox(Inches(0.55), Inches(6.0), Inches(12.2), Inches(0.32))
    tf = foot.text_frame
    tf.text = "e.g. [2 drag] — pointer* moves thumb; touch* lines on glass only."
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.name = "Calibri"
        p.font.italic = True


def add_slide4_takeaway(prs: Presentation) -> None:
    add_slide_title_body(
        prs,
        "4 — Takeaways",
        [
            "touch* ≠ click — tap may still end in click (not a law).",
            "Same click listener on phone + desktop — prelude differs.",
            "Debug: mouse-only? touch-only? touch-action / preventDefault? — test real glass.",
        ],
        size=24,
    )


def main() -> None:
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    add_slide_title_body(
        prs,
        "1 — click",
        [
            'element.addEventListener("click", fn) — one activation event type.',
            "Often after mousedown + mouseup; tap on glass can still fire click (+ compat mouse*).",
            "e.g. primary <button>, <a href>, modal OK / Cancel — usually click.",
            "demo/index.html — click line shows pointerType (metadata).",
        ],
        size=21,
    )

    add_slide_title_body(
        prs,
        "2 — touch",
        [
            'addEventListener("touchstart" | "touchmove" | "touchend" | "touchcancel", fn).',
            "touchstart → many touchmove → touchend / cancel — finger path.",
            "e.g. map pan, slider thumb, swipe / pull — read touchmove or pointermove.",
            "No touchstart from a real mouse; demo: touch* lines only on glass.",
        ],
        size=21,
    )

    add_slide3_windows_vs_touch(prs)
    add_slide4_takeaway(prs)

    out = Path(__file__).resolve().parent / "touch-vs-click.pptx"
    try:
        prs.save(str(out))
        print(f"Wrote {out} (4 slides: click+ex, touch+ex, compare+ex, takeaways)")
    except PermissionError:
        alt = Path(__file__).resolve().parent / "touch-vs-click-rebuilt.pptx"
        prs.save(str(alt))
        print(f"Could not overwrite {out} (file open?). Wrote {alt}")


if __name__ == "__main__":
    main()
