"use client";
import React from "react";
import CopyButton from "./CopyButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export default function MarkdownRenderer({ content, theme = "light" }: { content: string; theme?: "light" | "dark" }) {
  const isDark = theme === "dark";
  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        h1: ({node, ...props}) => <h1 className={(isDark?"text-white":"")+" text-2xl font-bold mt-4 mb-2"} {...props} />,
        h2: ({node, ...props}) => <h2 className={(isDark?"text-white":"")+" text-xl font-semibold mt-3 mb-2"} {...props} />,
        h3: ({node, ...props}) => <h3 className={(isDark?"text-white":"")+" text-lg font-medium mt-2 mb-1"} {...props} />,
        table: ({node, ...props}) => (
          <div className="relative group my-4">
            <div className="absolute right-0 top-0 z-10 opacity-80 group-hover:opacity-100">
              <CopyButton
                text={
                  Array.isArray((props as any).children)
                    ? (props as any).children
                        .map((row: any) =>
                          Array.isArray(row?.props?.children)
                            ? row.props.children.map((cell: any) => cell?.props?.children).join('\t')
                            : ''
                        )
                        .join('\n')
                    : typeof (props as any).children === 'string'
                      ? (props as any).children
                      : ''
                }
                label="Copiar tabla"
              />
            </div>
            <table className={(isDark?"min-w-full border border-white/20 my-4 text-white":"min-w-full border border-gray-300 my-4")} contentEditable suppressContentEditableWarning {...props} />
          </div>
        ),
        th: ({node, ...props}) => <th className={(isDark?"bg-white/10 border-white/20 text-white":"bg-gray-100 border text-black")+" border px-2 py-1 text-xs font-semibold"} {...props} />,
        td: ({node, ...props}) => <td className={(isDark?"border-white/20 text-white/90":"border text-black")+" border px-2 py-1 text-xs"} {...props} />,
        ul: ({node, ...props}) => <ul className={(isDark?"text-white":"")+" list-disc list-inside ml-4"} {...props} />,
        ol: ({node, ...props}) => <ol className={(isDark?"text-white":"")+" list-decimal list-inside ml-4"} {...props} />,
        li: ({node, ...props}) => <li className={(isDark?"text-white":"")+" mb-1"} {...props} />,
        blockquote: ({node, ...props}) => <blockquote className={(isDark?"border-l-4 border-blue-300 pl-4 italic text-white/80 my-2":"border-l-4 border-blue-300 pl-4 italic text-gray-600 my-2")} {...props} />,
        code: ({node, ...props}) => <code className={(isDark?"bg-white/10 text-white":"bg-gray-100 text-black")+" rounded px-1 py-0.5 text-xs font-mono"} {...props} />,
        pre: ({node, ...props}) => <pre className={(isDark?"bg-black/60 text-white":"bg-gray-900 text-gray-100")+" rounded p-2 overflow-x-auto my-2 text-xs"} {...props} />,
        a: ({node, ...props}) => <a className={(isDark?"text-blue-300 hover:text-blue-200":"text-blue-600 hover:text-blue-800")+" underline"} target="_blank" rel="noopener noreferrer" {...props} />,
        strong: ({node, ...props}) => <strong className={(isDark?"text-white":"")+" font-bold"} {...props} />,
        em: ({node, ...props}) => <em className={(isDark?"text-white":"")+" italic"} {...props} />,
        p: ({node, ...props}) => <p className={(isDark?"text-white":"")+" mb-2"} {...props} />,
      }}
    />
  );
}
