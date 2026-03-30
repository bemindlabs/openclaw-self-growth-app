import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  children: string;
  className?: string;
}

export default function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
        li: ({ children }) => <li className="mb-0.5">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <pre className="bg-secondary rounded-md p-3 overflow-x-auto mb-2">
              <code className="text-xs">{children}</code>
            </pre>
          ) : (
            <code className="bg-secondary px-1 py-0.5 rounded text-xs">{children}</code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/30 pl-3 italic text-muted-foreground mb-2">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-border my-3" />,
        a: ({ href, children }) => (
          <a href={href} className="text-primary underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
    </div>
  );
}
