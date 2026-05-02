import {
  Bold,
  CodeXml,
  Eraser,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

type CommandButton = {
  command: string;
  icon: LucideIcon;
  title: string;
  value?: string;
};

const inlineCommands: CommandButton[] = [
  { command: "bold", icon: Bold, title: "Bold" },
  { command: "italic", icon: Italic, title: "Italic" },
  { command: "underline", icon: Underline, title: "Underline" },
  { command: "strikeThrough", icon: Strikethrough, title: "Strikethrough" },
];

const blockCommands: CommandButton[] = [
  { command: "insertUnorderedList", icon: List, title: "Bulleted list" },
  { command: "insertOrderedList", icon: ListOrdered, title: "Numbered list" },
  { command: "formatBlock", icon: Quote, title: "Quote", value: "blockquote" },
];

const historyCommands: CommandButton[] = [
  { command: "undo", icon: Undo2, title: "Undo" },
  { command: "redo", icon: Redo2, title: "Redo" },
  { command: "removeFormat", icon: Eraser, title: "Clear formatting" },
];

function normalizeEmptyHtml(html: string) {
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return text ? html : "";
}

export function RichTextEditor({ id, value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastSyncedHtmlRef = useRef(value);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value);

  useEffect(() => {
    const hasExternalUpdate = value !== lastSyncedHtmlRef.current;
    const editor = editorRef.current;

    if (
      !isSourceMode &&
      editor &&
      editor.innerHTML !== value &&
      (hasExternalUpdate || editor.innerHTML === "")
    ) {
      editor.innerHTML = value;
    }

    lastSyncedHtmlRef.current = value;
    setSourceValue(value);
  }, [isSourceMode, value]);

  function emitHtml() {
    if (!editorRef.current) {
      return;
    }

    const html = normalizeEmptyHtml(editorRef.current.innerHTML);
    lastSyncedHtmlRef.current = html;
    onChange(html);
  }

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitHtml();
  }

  function setBlockFormat(event: ChangeEvent<HTMLSelectElement>) {
    runCommand("formatBlock", event.target.value);
    event.target.value = "p";
  }

  function addLink() {
    const url = window.prompt("Link URL");

    if (!url?.trim()) {
      return;
    }

    runCommand("createLink", url.trim());
  }

  function handleSourceChange(nextValue: string) {
    setSourceValue(nextValue);
    lastSyncedHtmlRef.current = nextValue;
    onChange(nextValue);
  }

  return (
    <div className="rich-editor">
      <div className="editor-toolbar" aria-label="Text formatting">
        <select
          aria-label="Block style"
          defaultValue="p"
          onChange={setBlockFormat}
          disabled={isSourceMode}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="pre">Code block</option>
        </select>

        <div className="toolbar-group" role="group" aria-label="Inline style">
          {inlineCommands.map((button) => (
            <ToolbarButton
              key={button.command}
              button={button}
              disabled={isSourceMode}
              onClick={() => runCommand(button.command, button.value)}
            />
          ))}
        </div>

        <div className="toolbar-group" role="group" aria-label="Blocks">
          {blockCommands.map((button) => (
            <ToolbarButton
              key={button.title}
              button={button}
              disabled={isSourceMode}
              onClick={() => runCommand(button.command, button.value)}
            />
          ))}
        </div>

        <div className="toolbar-group" role="group" aria-label="Links">
          <button
            className="icon-button"
            type="button"
            title="Add link"
            aria-label="Add link"
            disabled={isSourceMode}
            onMouseDown={(event) => event.preventDefault()}
            onClick={addLink}
          >
            <Link aria-hidden="true" size={17} strokeWidth={2.3} />
          </button>
          <button
            className="icon-button"
            type="button"
            title="Remove link"
            aria-label="Remove link"
            disabled={isSourceMode}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand("unlink")}
          >
            <RemoveFormatting aria-hidden="true" size={17} strokeWidth={2.3} />
          </button>
        </div>

        <div className="toolbar-group" role="group" aria-label="History">
          {historyCommands.map((button) => (
            <ToolbarButton
              key={button.command}
              button={button}
              disabled={isSourceMode}
              onClick={() => runCommand(button.command, button.value)}
            />
          ))}
        </div>

        <button
          className={`icon-button ${isSourceMode ? "active-source" : ""}`}
          type="button"
          title="Edit HTML"
          aria-label="Edit HTML"
          onClick={() => setIsSourceMode((current) => !current)}
        >
          <CodeXml aria-hidden="true" size={17} strokeWidth={2.3} />
        </button>
      </div>

      {isSourceMode ? (
        <textarea
          id={id}
          className="editor-source"
          value={sourceValue}
          rows={12}
          spellCheck={false}
          onChange={(event) => handleSourceChange(event.target.value)}
        />
      ) : (
        <div
          id={id}
          ref={editorRef}
          className="editor-surface"
          contentEditable
          suppressContentEditableWarning
          dir="auto"
          role="textbox"
          aria-multiline="true"
          data-placeholder="<p>appointment</p>"
          spellCheck
          onInput={emitHtml}
          onBlur={emitHtml}
        />
      )}
    </div>
  );
}

type ToolbarButtonProps = {
  button: CommandButton;
  disabled: boolean;
  onClick: () => void;
};

function ToolbarButton({ button, disabled, onClick }: ToolbarButtonProps) {
  const Icon = button.icon;

  return (
    <button
      className="icon-button"
      type="button"
      title={button.title}
      aria-label={button.title}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={2.3} />
    </button>
  );
}
