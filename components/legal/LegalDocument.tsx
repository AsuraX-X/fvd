import { readFile } from "node:fs/promises";
import path from "node:path";
import { Fragment, type ReactNode } from "react";

// Renders one of the plain-text legal drafts at the repo root (e.g.
// PRIVACY_POLICY.txt) so the lawyer-reviewed .txt stays the single source.
//
// Format: blocks separated by blank lines. "1. HEADING" blocks become section
// headings; lines starting with "- " or "a) " become list items (indented lines
// continue the previous item); everything else is a paragraph.

type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "lines"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] };

const HEADING = /^\d+\.\s+[A-Z0-9][A-Z0-9 ,'&()/-]+$/;
const BULLET = /^-\s+/;
const LETTERED = /^[a-z]\)\s+/;

function parse(source: string) {
  const blocks = source.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/);
  const [title, ...rest] = blocks;
  const parsed: Block[] = [];

  for (const block of rest) {
    const lines = block.split("\n");

    if (lines.length === 1 && HEADING.test(lines[0].trim())) {
      parsed.push({ type: "heading", text: lines[0].trim() });
      continue;
    }

    // Short, unwrapped lines (e.g. a contact address) keep their line breaks.
    if (lines.every((line) => line.trim().length < 40 && !/^\s/.test(line))) {
      if (lines.length > 1) {
        parsed.push({ type: "lines", lines: lines.map((l) => l.trim()) });
        continue;
      }
    }

    let paragraph: string[] = [];
    let list: Extract<Block, { type: "list" }> | null = null;

    const flushParagraph = () => {
      if (paragraph.length) {
        parsed.push({ type: "paragraph", text: paragraph.join(" ") });
        paragraph = [];
      }
    };
    const flushList = () => {
      if (list) parsed.push(list);
      list = null;
    };

    for (const raw of lines) {
      const line = raw.trim();
      const marker = BULLET.test(line)
        ? BULLET
        : LETTERED.test(line)
          ? LETTERED
          : null;

      if (marker) {
        flushParagraph();
        const ordered = marker === LETTERED;
        if (!list || list.ordered !== ordered) {
          flushList();
          list = { type: "list", ordered, items: [] };
        }
        list.items.push(line.replace(marker, ""));
      } else if (list && /^\s/.test(raw)) {
        list.items[list.items.length - 1] += ` ${line}`;
      } else {
        flushList();
        paragraph.push(line);
      }
    }
    flushParagraph();
    flushList();
  }

  return { title: title.trim(), blocks: parsed };
}

// Highlight unfilled [PLACEHOLDERS] so the draft status is obvious on screen.
function withPlaceholders(text: string): ReactNode {
  return text.split(/(\[[^\]]+\])/).map((part, index) =>
    part.startsWith("[") && part.endsWith("]") ? (
      <mark
        key={index}
        className="bg-secondary-lighter/30 text-inherit rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

type LegalDocumentProps = {
  file: string;
  eyebrow: string;
  heading: string;
};

const LegalDocument = async ({ file, eyebrow, heading }: LegalDocumentProps) => {
  const source = await readFile(path.join(process.cwd(), file), "utf8");
  const { blocks } = parse(source);

  return (
    <main className="px-8 py-50">
      <div className="mx-auto max-w-3xl">
        <p className="small-header">{eyebrow}</p>
        <h1 className="text-5xl italic md:text-6xl mb-12">{heading}</h1>

        <article className="space-y-5 text-sm leading-7 text-body">
          {blocks.map((block, index) => {
            switch (block.type) {
              case "heading":
                return (
                  <h2
                    key={index}
                    className="pt-8 font-body text-xs font-bold tracking-wide uppercase text-secondary"
                  >
                    {block.text}
                  </h2>
                );
              case "lines":
                return (
                  <p key={index}>
                    {block.lines.map((line, i) => (
                      <Fragment key={i}>
                        {i > 0 && <br />}
                        {withPlaceholders(line)}
                      </Fragment>
                    ))}
                  </p>
                );
              case "list": {
                const List = block.ordered ? "ol" : "ul";
                return (
                  <List
                    key={index}
                    className={`space-y-2 pl-5 ${block.ordered ? "list-[lower-alpha]" : "list-disc"}`}
                  >
                    {block.items.map((item, i) => (
                      <li key={i}>{withPlaceholders(item)}</li>
                    ))}
                  </List>
                );
              }
              default:
                return <p key={index}>{withPlaceholders(block.text)}</p>;
            }
          })}
        </article>
      </div>
    </main>
  );
};

export default LegalDocument;
