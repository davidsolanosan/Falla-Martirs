import React, { useState, useRef, useEffect } from 'react';
import './TextEditor.css';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TextEditor({ value, onChange, placeholder }: TextEditorProps) {
  const [content, setContent] = useState(value || '');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('16');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && content !== value) {
      editorRef.current.innerHTML = value || '';
      setContent(value || '');
    }
  }, [value]);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    handleContentChange();
  };

  const handleBlur = () => {
    handleContentChange();
  };

  const Toolbar = () => (
    <div className="border border-slate-200 rounded-lg p-2 mb-2 flex flex-wrap gap-2 bg-slate-50">
      {/* Font Size */}
      <select 
        value={fontSize}
        onChange={(e) => {
          setFontSize(e.target.value);
          applyFormat('fontSize', e.target.value);
        }}
        className="px-2 py-1 border border-slate-300 rounded text-sm"
      >
        <option value="2">12px</option>
        <option value="3">16px</option>
        <option value="4">18px</option>
        <option value="5">24px</option>
        <option value="6">32px</option>
        <option value="7">48px</option>
      </select>

      {/* Text Color */}
      <input 
        type="color" 
        value={textColor}
        onChange={(e) => {
          setTextColor(e.target.value);
          applyFormat('foreColor', e.target.value);
        }}
        className="w-8 h-8 border border-slate-300 rounded cursor-pointer"
        title="Color de texto"
      />

      {/* Background Color */}
      <input 
        type="color" 
        value={backgroundColor}
        onChange={(e) => {
          setBackgroundColor(e.target.value);
          applyFormat('hiliteColor', e.target.value);
        }}
        className="w-8 h-8 border border-slate-300 rounded cursor-pointer"
        title="Color de fondo"
      />

      {/* Format Buttons */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => {
            setIsBold(!isBold);
            applyFormat('bold');
          }}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isBold 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title="Negrita"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsItalic(!isItalic);
            applyFormat('italic');
          }}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isItalic 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title="Cursiva"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsUnderline(!isUnderline);
            applyFormat('underline');
          }}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isUnderline 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title="Subrayado"
        >
          <u>U</u>
        </button>

        <button
          type="button"
          onClick={() => applyFormat('justifyLeft')}
          className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-300 transition-colors"
          title="Alinear a la izquierda"
        >
          ◀
        </button>

        <button
          type="button"
          onClick={() => applyFormat('justifyCenter')}
          className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-300 transition-colors"
          title="Centrar"
        >
          ■
        </button>

        <button
          type="button"
          onClick={() => applyFormat('justifyRight')}
          className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-300 transition-colors"
          title="Alinear a la derecha"
        >
          ▶
        </button>

        <button
          type="button"
          onClick={() => applyFormat('insertUnorderedList')}
          className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-300 transition-colors"
          title="Lista no ordenada"
        >
          •
        </button>

        <button
          type="button"
          onClick={() => applyFormat('insertOrderedList')}
          className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-300 transition-colors"
          title="Lista ordenada"
        >
          1.
        </button>

        <button
          type="button"
          onClick={() => applyFormat('removeFormat')}
          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
          title="Limpiar formato"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <div className="text-editor">
      <Toolbar />
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent bg-white"
        style={{ 
          fontSize: `${fontSize}px`,
          color: textColor,
          backgroundColor: backgroundColor
        }}
        onInput={handleInput}
        onBlur={handleBlur}
        data-placeholder={placeholder || "Escribe aquí el contenido de la noticia..."}
      />
    </div>
  );
}
