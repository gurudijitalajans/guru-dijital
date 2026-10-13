"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { $createParagraphNode, $getSelection, $insertNodes, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND, type EditorState, type LexicalEditor, type TextFormatType } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { HorizontalRuleNode, INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, $isQuoteNode, HeadingNode, QuoteNode, type HeadingTagType } from "@lexical/rich-text";
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode, REMOVE_LIST_COMMAND } from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import { Bold, Code, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Underline, Undo2 } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { MediaPicker } from "../../media/MediaPicker";
import { useForm, rowId } from "../state";
import { $isLink, $setLink, PAutoLinkNode, PLinkNode, RelationshipNode, UploadNode } from "./nodes";
import { cn } from "@/lib/utils";

/**
 * Blog yazısının metin editörü (Lexical). Payload'un varsayılan özellikleri:
 * başlıklar, kalın/italik/altı çizili/üstü çizili/kod, bağlantı, madde ve
 * numaralı liste, alıntı, ayırıcı çizgi, görsel. Kayıt biçimi Payload'unkiyle
 * aynı (sitedeki RichText değişmeden çizer).
 */
const theme = {
  paragraph: "my-2 leading-relaxed",
  heading: { h1: "mt-6 mb-2 text-[26px] font-semibold", h2: "mt-6 mb-2 text-[22px] font-semibold", h3: "mt-5 mb-2 text-[18px] font-semibold", h4: "mt-4 mb-1 text-[16px] font-semibold", h5: "mt-4 mb-1 text-[15px] font-semibold", h6: "mt-4 mb-1 text-[14px] font-semibold" },
  quote: "my-3 border-l-4 border-line pl-4 text-muted italic",
  list: { ul: "my-2 list-disc pl-6", ol: "my-2 list-decimal pl-6", listitem: "my-1", nested: { listitem: "list-none" }, checklist: "my-2 pl-1", listitemChecked: "line-through", listitemUnchecked: "" },
  link: "text-accent underline underline-offset-2",
  text: { bold: "font-bold", italic: "italic", underline: "underline", strikethrough: "line-through", underlineStrikethrough: "underline line-through", code: "rounded bg-sunken px-1 font-mono text-[13px]", subscript: "align-sub text-[0.8em]", superscript: "align-super text-[0.8em]" },
  hr: "my-4 border-t border-line",
};

const NODES = [HeadingNode, QuoteNode, ListNode, ListItemNode, PLinkNode, PAutoLinkNode, UploadNode, RelationshipNode, HorizontalRuleNode];

export function RichTextField({ value, onChange, readOnly, id, invalid }: { value: unknown; onChange: (v: unknown) => void; readOnly: boolean; id: string; invalid?: boolean }) {
  const [failed, setFailed] = useState(false);
  /* İlk değer bir kez okunur; sonrası editörün kendi durumu */
  const initial = useMemo(() => (value && typeof value === "object" && "root" in (value as object) ? JSON.stringify(value) : undefined), []); // eslint-disable-line react-hooks/exhaustive-deps
  const config = useMemo(
    () => ({
      namespace: id,
      theme,
      nodes: NODES,
      editable: !readOnly,
      editorState: initial,
      onError: (e: Error) => {
        console.error(e);
        setFailed(true);
      },
    }),
    [id, initial, readOnly],
  );
  if (failed) return <p className="m-0 rounded-[9px] border border-bad px-3 py-2 text-[14px] text-bad">Metin okunamadı. Sayfayı yenileyin; sorun sürerse bize yazın.</p>;
  return (
    <LexicalComposer initialConfig={config}>
      <div className={cn("min-w-0 overflow-hidden rounded-[12px] border bg-surface", invalid ? "border-bad" : "border-line")}>
        {!readOnly ? <Toolbar /> : null}
        <div className="relative">
          <RichTextPlugin
            contentEditable={<ContentEditable id={id} aria-label="Yazı metni" className="min-h-[320px] px-4 py-3 text-[15px] text-ink outline-none" />}
            placeholder={<div className="pointer-events-none absolute top-3 left-4 text-[15px] text-muted">Yazmaya başlayın…</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <HorizontalRulePlugin />
      <OnChangePlugin ignoreSelectionChange onChange={(s: EditorState) => onChange(s.toJSON())} />
    </LexicalComposer>
  );
}

type Block = "paragraph" | "h2" | "h3" | "h4" | "quote" | "ul" | "ol" | "other";

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const { clientUpload } = useForm();
  const [fmt, setFmt] = useState<Record<string, boolean>>({});
  const [block, setBlock] = useState<Block>("paragraph");
  const [link, setLink] = useState<{ url: string; newTab: boolean } | null>(null);
  const [inLink, setInLink] = useState(false);
  const [undo, setUndo] = useState(false);
  const [redo, setRedo] = useState(false);
  const [picking, setPicking] = useState(false);

  const read = useCallback(() => {
    const sel = $getSelection();
    if (!$isRangeSelection(sel)) return;
    setFmt({ bold: sel.hasFormat("bold"), italic: sel.hasFormat("italic"), underline: sel.hasFormat("underline"), strikethrough: sel.hasFormat("strikethrough"), code: sel.hasFormat("code") });
    const anchor = sel.anchor.getNode();
    setInLink(Boolean($findMatchingParent(anchor, $isLink) ?? ($isLink(anchor) ? anchor : null)));
    const top = anchor.getKey() === "root" ? anchor : anchor.getTopLevelElementOrThrow();
    if ($isListNode(top)) {
      const list = $getNearestNodeOfType(anchor, ListNode);
      setBlock((list ?? top).getListType() === "number" ? "ol" : "ul");
    } else if ($isHeadingNode(top)) {
      const t = top.getTag();
      setBlock(t === "h2" || t === "h3" || t === "h4" ? t : "other");
    } else if ($isQuoteNode(top)) setBlock("quote");
    else setBlock("paragraph");
  }, []);

  useEffect(
    () =>
      mergeRegister(
        editor.registerUpdateListener(({ editorState }) => editorState.read(read)),
        editor.registerCommand(CAN_UNDO_COMMAND, (v: boolean) => (setUndo(v), false), COMMAND_PRIORITY_LOW),
        editor.registerCommand(CAN_REDO_COMMAND, (v: boolean) => (setRedo(v), false), COMMAND_PRIORITY_LOW),
      ),
    [editor, read],
  );

  const setBlockType = (b: Block) => {
    if (b === "ul" || b === "ol") {
      editor.dispatchCommand(block === b ? REMOVE_LIST_COMMAND : b === "ul" ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND, undefined);
      return;
    }
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      if (block === "ul" || block === "ol") editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      $setBlocksType(sel, () => (b === "paragraph" ? $createParagraphNode() : b === "quote" ? $createQuoteNode() : $createHeadingNode(b as HeadingTagType)));
    });
  };

  const openLink = () => {
    editor.getEditorState().read(() => {
      const sel = $getSelection();
      const node = $isRangeSelection(sel) ? sel.anchor.getNode() : null;
      const l = node ? ($isLink(node) ? node : $findMatchingParent(node, $isLink)) : null;
      setLink({ url: (l && $isLink(l) ? l.getFields().url : "") ?? "", newTab: Boolean(l && $isLink(l) && l.getFields().newTab) });
    });
  };
  const applyLink = (remove = false) => {
    const url = link?.url.trim() ?? "";
    editor.update(() => $setLink(remove || !url ? null : { linkType: "custom", url: /^(https?:|mailto:|tel:|\/|#)/.test(url) ? url : `https://${url}`, newTab: Boolean(link?.newTab) }));
    setLink(null);
  };

  const fmtBtn = (f: TextFormatType, Icon: typeof Bold, label: string) => (
    <ToolButton key={f} label={label} active={fmt[f]} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, f)}>
      <Icon />
    </ToolButton>
  );

  return (
    <>
      <div role="toolbar" aria-label="Metin biçimi" className="flex flex-wrap items-center gap-0.5 border-b border-line bg-sunken/60 p-1.5">
        <select aria-label="Paragraf türü" value={block === "ul" || block === "ol" || block === "other" ? "" : block} onChange={(e) => e.target.value && setBlockType(e.target.value as Block)} className="mr-1 min-h-9 rounded-[8px] border border-line bg-surface px-2 text-[13px] text-ink">
          {block === "ul" || block === "ol" || block === "other" ? <option value="">{block === "other" ? "Başlık" : "Liste"}</option> : null}
          <option value="paragraph">Paragraf</option>
          <option value="h2">Başlık 2</option>
          <option value="h3">Başlık 3</option>
          <option value="h4">Başlık 4</option>
          <option value="quote">Alıntı</option>
        </select>
        {fmtBtn("bold", Bold, "Kalın")}
        {fmtBtn("italic", Italic, "İtalik")}
        {fmtBtn("underline", Underline, "Altı çizili")}
        {fmtBtn("strikethrough", Strikethrough, "Üstü çizili")}
        {fmtBtn("code", Code, "Kod")}
        <Sep />
        <ToolButton label="Bağlantı" active={inLink} onClick={openLink}>
          <Link2 />
        </ToolButton>
        <ToolButton label="Madde listesi" active={block === "ul"} onClick={() => setBlockType("ul")}>
          <List />
        </ToolButton>
        <ToolButton label="Numaralı liste" active={block === "ol"} onClick={() => setBlockType("ol")}>
          <ListOrdered />
        </ToolButton>
        <ToolButton label="Alıntı" active={block === "quote"} onClick={() => setBlockType(block === "quote" ? "paragraph" : "quote")}>
          <Quote />
        </ToolButton>
        <ToolButton label="Ayırıcı çizgi" onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}>
          <Minus />
        </ToolButton>
        <ToolButton label="Görsel ekle" onClick={() => setPicking(true)}>
          <ImagePlus />
        </ToolButton>
        <Sep />
        <ToolButton label="Geri al" disabled={!undo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
          <Undo2 />
        </ToolButton>
        <ToolButton label="Yinele" disabled={!redo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
          <Redo2 />
        </ToolButton>
      </div>
      {link ? (
        /* Form değil: düzenleyicinin ana formunun içinde, Enter ana formu göndermesin */
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface p-2" role="group" aria-label="Bağlantı">
          <Input
            autoFocus
            value={link.url}
            onChange={(e) => setLink({ ...link, url: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLink(null);
            }}
            placeholder="https://ornek.com ya da /iletisim"
            aria-label="Bağlantı adresi"
            className="min-w-0 flex-1 basis-[220px]"
          />
          <label className="flex min-h-10 items-center gap-2 text-[13px] text-ink">
            <input type="checkbox" checked={link.newTab} onChange={(e) => setLink({ ...link, newTab: e.target.checked })} className="size-4 accent-[var(--accent)]" />
            Yeni sekmede aç
          </label>
          <Button type="button" size="sm" variant="primary" onClick={() => applyLink()}>
            Uygula
          </Button>
          {inLink ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => applyLink(true)}>
              Bağlantıyı kaldır
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="ghost" onClick={() => setLink(null)}>
            Vazgeç
          </Button>
        </div>
      ) : null}
      {picking ? (
        <MediaPicker
          clientUpload={clientUpload}
          onClose={() => setPicking(false)}
          onPick={(m) => {
            insertUpload(editor, m.id);
            setPicking(false);
          }}
        />
      ) : null}
    </>
  );
}

function insertUpload(editor: LexicalEditor, id: number) {
  editor.update(() => {
    $insertNodes([new UploadNode({ relationTo: "media", value: id, fields: null, id: rowId() })]);
  });
}

function mergeRegister(...fns: (() => void)[]) {
  return () => fns.forEach((f) => f());
}

function Sep() {
  return <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />;
}

function ToolButton({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("grid size-9 place-items-center rounded-[8px] text-ink hover:bg-surface disabled:opacity-40 [&_svg]:size-4", active && "bg-surface text-accent shadow-[inset_0_0_0_1px_var(--line)]")}
    >
      {children}
    </button>
  );
}
