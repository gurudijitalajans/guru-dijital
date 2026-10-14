import { RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type Node = { type?: string; tag?: string; text?: string; children?: Node[] };

const textOf = (n: Node): string => (n.text ?? "") + (n.children ?? []).map(textOf).join("");

/** Başlık metninden Türkçe karakterleri sadeleştirilmiş bağlantı kimliği */
export const headingId = (t: string) =>
  t
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** Yazıdaki H2 başlıkları: içindekiler listesi ("Kaynaklar" dahil) */
export function postHeadings(content: unknown): { id: string; text: string }[] {
  const root = (content as { root?: Node } | null)?.root;
  return (root?.children ?? []).filter((n) => n.type === "heading" && n.tag === "h2").map((n) => ({ id: headingId(textOf(n)), text: textOf(n) }));
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    const Tag = (["h2", "h3", "h4", "h5", "h6"].includes(node.tag) ? node.tag : "h2") as "h2";
    return (
      <Tag id={headingId(textOf(node as unknown as Node))} className="scroll-mt-28">
        {children}
      </Tag>
    );
  },
});

/** Blog yazısının gövdesi: başlıklar içindekiler listesinden bağlanabilir */
export function PostBody({ data, className }: { data: unknown; className?: string }) {
  return <RichText data={data as SerializedEditorState} converters={converters} className={className} />;
}
