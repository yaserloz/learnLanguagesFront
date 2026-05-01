import { ChangeEvent, useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

type CommandButton = {
  command: string;
  label: string;
  title: string;
  value?: string;
};

const inlineCommands: CommandButton[] = [
  { command: "bold", label: "B", title: "Bold" },
  { command: "italic", label: "I", title: "Italic" },
  { command: "underline", label: "U", title: "Underline" },
  { command: "strikeThrough", label: "S", title: "Strikethrough" },
];

const blockCommands: CommandButton[] = [
  { command: "insertUnorderedList", label: "UL", title: "Bulleted list" },
  { command: "insertOrderedList", label: "OL", title: "Numbered list" },
  { command: "formatBlock", label: "Quote", title: "Quote", value: "blockquote" },
];

const historyCommands: CommandButton[] = [
  { command: "undo", label: "Undo", title: "Undo" },
  { command: "redo", label: "Redo", title: "Redo" },
  { command: "removeFormat", label: "Clear", title: "Clear formatting" },
];

function normalizeEmptyHtml(html: string) {
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return text ? html : "";
}

export function RichTextEditor({ id, value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value);

  useEffect(() => {
    if (!isSourceMode && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }

    setSourceValue(value);
  }, [isSourceMode, value]);

  function emitHtml() {
    if (!editorRef.current) {
      return;
    }

    onChange(normalizeEmptyHtml(editorRef.current.innerHTML));
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
            <button
              key={button.command}
              type="button"
              title={button.title}
              aria-label={button.title}
              disabled={isSourceMode}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runCommand(button.command, button.value)}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div className="toolbar-group" role="group" aria-label="Blocks">
          {blockCommands.map((button) => (
            <button
              key={button.title}
              type="button"
              title={button.title}
              aria-label={button.title}
              disabled={isSourceMode}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runCommand(button.command, button.value)}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div className="toolbar-group" role="group" aria-label="Links">
          <button
            type="button"
            title="Add link"
            aria-label="Add link"
            disabled={isSourceMode}
            onMouseDown={(event) => event.preventDefault()}
            onClick={addLink}
          >
            Link
          </button>
          <button
            type="button"
            title="Remove link"
            aria-label="Remove link"
            disabled={isSourceMode}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand("unlink")}
          >
            Unlink
          </button>
        </div>

        <div className="toolbar-group" role="group" aria-label="History">
          {historyCommands.map((button) => (
            <button
              key={button.command}
              type="button"
              title={button.title}
              aria-label={button.title}
              disabled={isSourceMode}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runCommand(button.command, button.value)}
            >
              {button.label}
            </button>
          ))}
        </div>

        <button
          className={isSourceMode ? "active-source" : ""}
          type="button"
          title="Edit HTML"
          aria-label="Edit HTML"
          onClick={() => setIsSourceMode((current) => !current)}
        >
          HTML
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
          role="textbox"
          aria-multiline="true"
          data-placeholder="<p>appointment</p>"
          spellCheck
          onInput={emitHtml}
          onBlur={emitHtml}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}
    </div>
  );
}
