"use client";
import React from "react";
import CopyButton from "./CopyButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-3 mb-2" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-2 mb-1" {...props} />,
        table: ({node, ...props}) => (
          <div className="relative group my-4">
            <div className="absolute right-0 top-0 z-10 opacity-80 group-hover:opacity-100">
              <CopyButton
  text={
    Array.isArray(props.children)
      ? props.children
          .map((row: any) =>
            Array.isArray(row?.props?.children)
              ? row.props.children.map((cell: any) => cell?.props?.children).join('\t')
              : ''
          )
          .join('\n')
      : typeof props.children === 'string'
        ? props.children
        : ''
  }
  label="Copiar tabla"
/>
            </div>
            <table className="min-w-full border border-gray-300 my-4" contentEditable suppressContentEditableWarning {...props} />
          </div>
        ),
        th: ({node, ...props}) => <th className="bg-gray-100 border px-2 py-1 text-xs font-semibold" {...props} />,
        td: ({node, ...props}) => <td className="border px-2 py-1 text-xs" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-inside ml-4" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal list-inside ml-4" {...props} />,
        li: ({node, ...props}) => <li className="mb-1" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-600 my-2" {...props} />,
        code: ({node, ...props}) => <code className="bg-gray-100 rounded px-1 py-0.5 text-xs font-mono" {...props} />,
        pre: ({node, ...props}) => <pre className="bg-gray-900 text-gray-100 rounded p-2 overflow-x-auto my-2 text-xs" {...props} />,
        a: ({node, ...props}) => <a className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
        em: ({node, ...props}) => <em className="italic" {...props} />,
        p: ({node, ...props}) => <p className="mb-2" {...props} />,
      }}
    />
  );
}
