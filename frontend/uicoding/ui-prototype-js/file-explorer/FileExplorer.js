import {useState} from 'react';
import {fileData} from './data';

function sortItems(items) {
  return [...items].sort((a, b) => {
    const aIsDir = Array.isArray(a.children);
    const bIsDir = Array.isArray(b.children);
    if (aIsDir && !bIsDir) {
      return -1;
    }
    if (!aIsDir && bIsDir) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
}

function FileTreeItem({ item, depth = 0 }) {
  const isDirectory = item.children ? Array.isArray(item.children) : false;
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isDirectory) {
    return (
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-slate-800 rounded"
        style={{ paddingLeft: depth * 16 + "px" }}
      >
        <span className="text-lg">📄</span>
        <span className="text-sm">{item.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-slate-800 rounded cursor-pointer select-none"
        style={{ paddingLeft: depth * 16 + "px", cursor: "pointer", userSelect: "none" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-lg">{isExpanded ? "📂" : "📁"}</span>
        <span className="text-sm">{item.name}</span>
      </div>
      {isExpanded && (
        <div>
          {sortItems(item.children).map((child) => (
            <FileTreeItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer() {
  const items = sortItems(fileData);

  return (
    <div>
      {items.map((item) => (
        <FileTreeItem key={item.id} item={item} />
      ))}
    </div>
  )
}
