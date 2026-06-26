import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Interview question:
 * Build a file explorer component that lazily loads folder contents.
 *
 * What we want to tackle:
 * - Render a tree of files and folders.
 * - Load children only when a folder is opened, instead of loading the entire
 *   file system upfront.
 * - Track loading, loaded, and error states per folder.
 * - Support retry when a folder request fails.
 * - Support deep links such as /files/src/components/Button.jsx.
 * - Avoid stale async responses overwriting newer state.
 *
 * Implementation plan:
 * 1. Store nodes in a normalized map keyed by path.
 *    This makes lookup, updates, and dedupe easier than deeply nested state.
 * 2. Store expanded folder paths in a Set.
 *    This keeps UI expansion separate from loaded data.
 * 3. When a folder expands, call fetchChildren(path).
 *    While loading, mark only that folder as loading.
 * 4. When children return, add them to nodesByPath and attach their paths to
 *    the parent folder's children array.
 * 5. Use requestIdByPathRef to ignore stale responses.
 *    This protects against race conditions when a user retries or navigates
 *    quickly while a previous request is still in flight.
 * 6. For deep links, open each ancestor folder in order so the target path can
 *    become visible in the tree.
 */
const mockFileSystem = {
  "/": [
    { name: "src", type: "folder", path: "/src" },
    { name: "public", type: "folder", path: "/public" },
    { name: "package.json", type: "file", path: "/package.json" }
  ],
  "/src": [
    { name: "components", type: "folder", path: "/src/components" },
    { name: "App.jsx", type: "file", path: "/src/App.jsx" },
    { name: "main.jsx", type: "file", path: "/src/main.jsx" }
  ],
  "/src/components": [
    { name: "Button.jsx", type: "file", path: "/src/components/Button.jsx" },
    { name: "Modal.jsx", type: "file", path: "/src/components/Modal.jsx" },
    { name: "ErrorExample", type: "folder", path: "/src/components/ErrorExample" }
  ],
  "/public": [
    { name: "index.html", type: "file", path: "/public/index.html" }
  ]
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchChildren(path) {
  await sleep(500);

  // Simulate failed folder.
  if (path === "/src/components/ErrorExample") {
    throw new Error("Failed to load folder");
  }

  if (!(path in mockFileSystem)) {
    throw new Error("Folder not found");
  }

  return mockFileSystem[path];
}

const rootNode = {
  name: "root",
  type: "folder",
  path: "/"
};

function normalizePath(path) {
  // Normalize paths so "/src/", "src", and "//src" all resolve to "/src".
  // This makes route handling, lookups, and dedupe consistent.
  if (!path || path === "/") return "/";

  let normalized = path.trim();

  if (!normalized.startsWith("/")) {
    normalized = "/" + normalized;
  }

  normalized = normalized.replace(/\/+/g, "/");

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

function pathToRoute(path) {
  // Convert internal file-system paths to browser routes.
  if (path === "/") return "/files";
  return `/files${path}`;
}

function routeToPath(routePath) {
  // Convert browser routes back into internal file-system paths.
  if (!routePath.startsWith("/files")) return "/";

  const path = routePath.replace(/^\/files/, "");

  return normalizePath(path || "/");
}

function getAncestorPaths(path) {
  // For a deep link like /src/components/Button.jsx, ancestors are:
  // /src and /src/components. We need to load these folders in order.
  const normalized = normalizePath(path);

  if (normalized === "/") return [];

  const parts = normalized.split("/").filter(Boolean);
  const ancestors = [];

  let current = "";

  for (let i = 0; i < parts.length - 1; i++) {
    current += "/" + parts[i];
    ancestors.push(current);
  }

  return ancestors;
}

function sortItems(items) {
  // Common file explorer behavior: folders first, then files alphabetically.
  return [...items].sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });
}

export default function App() {
  // Normalized node store:
  // {
  //   "/src": { name, type, path, children, status, error }
  // }
  //
  // This avoids deeply nested immutable updates when one folder loads.
  const [nodesByPath, setNodesByPath] = useState({
    "/": {
      ...rootNode,
      children: [],
      status: "idle",
      error: null
    }
  });

  // expandedPaths controls presentation only. A folder can be expanded before
  // its children finish loading.
  const [expandedPaths, setExpandedPaths] = useState(() => new Set(["/"]));

  // selectedPath is initialized from the URL so refresh/deep-link works.
  const [selectedPath, setSelectedPath] = useState(() =>
    routeToPath(window.location.pathname)
  );

  // notFoundPath lets us show a clear state when the route points to a missing
  // file or folder after ancestors have loaded.
  const [notFoundPath, setNotFoundPath] = useState(null);

  // Tracks the latest request per folder. Because async responses can finish
  // out of order, this ref prevents stale responses from overwriting newer data.
  const requestIdByPathRef = useRef({});

  const loadChildren = async (path, options = {}) => {
    const normalizedPath = normalizePath(path);
    const force = options.force === true;

    const existingNode = nodesByPath[normalizedPath];

    // Only folders can be lazily loaded.
    if (!existingNode || existingNode.type !== "folder") return;

    if (
      !force &&
      (existingNode.status === "loading" || existingNode.status === "loaded")
    ) {
      // Avoid duplicate requests when the folder is already loading or loaded.
      return;
    }

    const requestId = Date.now() + Math.random();
    requestIdByPathRef.current[normalizedPath] = requestId;

    // Mark just this folder as loading. The rest of the tree remains usable.
    setNodesByPath((prev) => ({
      ...prev,
      [normalizedPath]: {
        ...prev[normalizedPath],
        status: "loading",
        error: null
      }
    }));

    try {
      const children = await fetchChildren(normalizedPath);
      const sortedChildren = sortItems(children);

      setNodesByPath((prev) => {
        // If another request started after this one, ignore this response.
        if (requestIdByPathRef.current[normalizedPath] !== requestId) {
          return prev;
        }

        const next = { ...prev };

        for (const child of sortedChildren) {
          // Add each child as its own normalized node. Folders start idle so
          // they can be loaded later when expanded.
          next[child.path] = {
            ...child,
            children: child.type === "folder" ? [] : undefined,
            status: child.type === "folder" ? "idle" : "loaded",
            error: null
          };
        }

        // Parent stores child paths, not child objects. This keeps the state
        // normalized and cheap to update.
        next[normalizedPath] = {
          ...next[normalizedPath],
          children: sortedChildren.map((child) => child.path),
          status: "loaded",
          error: null
        };

        return next;
      });
    } catch (error) {
      setNodesByPath((prev) => {
        // Same stale-response protection for failed requests.
        if (requestIdByPathRef.current[normalizedPath] !== requestId) {
          return prev;
        }

        return {
          ...prev,
          [normalizedPath]: {
            ...prev[normalizedPath],
            status: "error",
            error: error.message
          }
        };
      });
    }
  };

  const expandPath = async (path) => {
    const normalizedPath = normalizePath(path);

    // Expand immediately so the user sees loading/error/empty state under it.
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      next.add(normalizedPath);
      return next;
    });

    // Load children after expanding. If already loaded, loadChildren exits.
    await loadChildren(normalizedPath);
  };

  const collapsePath = (path) => {
    const normalizedPath = normalizePath(path);

    setExpandedPaths((prev) => {
      const next = new Set(prev);
      next.delete(normalizedPath);
      return next;
    });
  };

  const toggleFolder = async (path) => {
    const normalizedPath = normalizePath(path);

    if (expandedPaths.has(normalizedPath)) {
      collapsePath(normalizedPath);
    } else {
      await expandPath(normalizedPath);
    }
  };

  const selectNode = async (node) => {
    // Selecting updates both UI state and the browser URL.
    setSelectedPath(node.path);
    setNotFoundPath(null);

    window.history.pushState({}, "", pathToRoute(node.path));

    if (node.type === "folder") {
      // Folder click behaves like common explorers: select and toggle.
      await toggleFolder(node.path);
    }
  };

  const retryLoad = async (path) => {
    // Force bypasses the loaded/loading guard so failed folders can retry.
    await loadChildren(path, { force: true });
  };

  useEffect(() => {
    const handlePopState = () => {
      // Browser back/forward should restore selection and open ancestors.
      const nextPath = routeToPath(window.location.pathname);
      setSelectedPath(nextPath);
      setNotFoundPath(null);
      openDeepLink(nextPath);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    // On first render, load enough of the tree to reveal the URL target.
    const initialPath = routeToPath(window.location.pathname);
    openDeepLink(initialPath);
  }, []);

  const openDeepLink = async (targetPath) => {
    const normalizedTarget = normalizePath(targetPath);
    const ancestors = getAncestorPaths(normalizedTarget);

    // Expand root and all ancestors before/while loading them.
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      next.add("/");
      for (const ancestor of ancestors) {
        next.add(ancestor);
      }
      return next;
    });

    try {
      // Load root first so top-level folders exist.
      await loadChildren("/");

      // Then load each ancestor in sequence so the target path can be resolved.
      for (const ancestor of ancestors) {
        await loadChildren(ancestor);
      }

      setNodesByPath((latestNodes) => {
        // After required folders load, decide whether the target exists.
        if (normalizedTarget === "/" || latestNodes[normalizedTarget]) {
          setNotFoundPath(null);
        } else {
          setNotFoundPath(normalizedTarget);
        }

        return latestNodes;
      });
    } catch {
      setNotFoundPath(normalizedTarget);
    }
  };

  const selectedNode = nodesByPath[selectedPath];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="header">
          <h2>File Explorer</h2>
          <button
            onClick={() => {
              window.history.pushState({}, "", "/files/src/components/Button.jsx");
              const nextPath = "/src/components/Button.jsx";
              setSelectedPath(nextPath);
              openDeepLink(nextPath);
            }}
          >
            Open Deep Link
          </button>
        </div>

        <FileTreeNode
          path="/"
          depth={0}
          nodesByPath={nodesByPath}
          expandedPaths={expandedPaths}
          selectedPath={selectedPath}
          onSelect={selectNode}
          onToggle={toggleFolder}
          onRetry={retryLoad}
        />
      </aside>

      <main className="content">
        <h1>Selected Item</h1>

        {notFoundPath ? (
          <div className="errorBox">
            File or folder not found: <strong>{notFoundPath}</strong>
          </div>
        ) : selectedNode ? (
          <div className="card">
            <p>
              <strong>Name:</strong> {selectedNode.name}
            </p>
            <p>
              <strong>Type:</strong> {selectedNode.type}
            </p>
            <p>
              <strong>Path:</strong> {selectedNode.path}
            </p>
            <p>
              <strong>Route:</strong> {pathToRoute(selectedNode.path)}
            </p>
          </div>
        ) : (
          <div className="empty">Select a file or folder</div>
        )}
      </main>
    </div>
  );
}

function FileTreeNode({
  path,
  depth,
  nodesByPath,
  expandedPaths,
  selectedPath,
  onSelect,
  onToggle,
  onRetry
}) {
  const node = nodesByPath[path];

  if (!node) return null;

  const isFolder = node.type === "folder";
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;

  return (
    <div>
      {/* Row click selects the node. Folder toggle stops propagation so the
          button only expands/collapses without double-select side effects. */}
      <div
        className={`treeRow ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {isFolder ? (
          <button
            className="toggle"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(node.path);
            }}
            aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="togglePlaceholder" />
        )}

        <span className="icon">{isFolder ? "📁" : "📄"}</span>
        <span>{node.name}</span>
      </div>

      {isFolder && isExpanded && (
        <div>
          {/* Per-folder async states keep the UI local to the affected branch. */}
          {node.status === "loading" && (
            <div
              className="treeMeta"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              Loading...
            </div>
          )}

          {node.status === "error" && (
            <div
              className="treeMeta errorText"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              Failed to load.{" "}
              <button onClick={() => onRetry(node.path)}>Retry</button>
            </div>
          )}

          {node.status === "loaded" && node.children.length === 0 && (
            <div
              className="treeMeta"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              Empty folder
            </div>
          )}

          {node.status === "loaded" &&
            node.children.map((childPath) => (
              <FileTreeNode
                key={childPath}
                path={childPath}
                depth={depth + 1}
                nodesByPath={nodesByPath}
                expandedPaths={expandedPaths}
                selectedPath={selectedPath}
                onSelect={onSelect}
                onToggle={onToggle}
                onRetry={onRetry}
              />
            ))}
        </div>
      )}
    </div>
  );
}t
