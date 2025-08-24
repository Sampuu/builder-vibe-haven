import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface SimpleTabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export default function SimpleTabs({
  items,
  defaultTab,
  className,
}: SimpleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  if (!items || items.length === 0) {
    return null;
  }

  const activeItem = items.find((item) => item.id === activeTab) || items[0];

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Headers */}
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              activeTab === item.id
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-muted-foreground/10",
              "flex-1",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {activeItem.content}
      </div>
    </div>
  );
}
