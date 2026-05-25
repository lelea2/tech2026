import React, {useMemo, useState} from 'react';
import styles from './styles.module.css';

function escapeForScript(code) {
  return code.replace(/<\/script/gi, '<\\/script');
}

function buildSrcDoc(code) {
  const safeCode = escapeForScript(code);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      :root {
        color-scheme: light;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: radial-gradient(circle at 15% 20%, #fff9db 0%, #f3f7ff 45%, #eafaf3 100%);
        font-family: "IBM Plex Sans", "Avenir Next", "Segoe UI", sans-serif;
        color: #12213a;
      }

      #root {
        min-height: 100vh;
        padding: 18px;
      }

      .__error {
        background: #fff2f0;
        border: 1px solid #ef8b82;
        color: #8f1d14;
        border-radius: 12px;
        padding: 12px;
        font-size: 14px;
        white-space: pre-wrap;
      }
    </style>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel">
      const mount = document.getElementById('root');

      try {
        ${safeCode}

        if (typeof App !== 'function') {
          throw new Error('Your code must define a React component named App.');
        }

        ReactDOM.createRoot(mount).render(React.createElement(App));
      } catch (error) {
        const node = document.createElement('div');
        node.className = '__error';
        node.textContent = error && error.stack ? error.stack : String(error);
        mount.replaceChildren(node);
      }
    </script>
  </body>
</html>`;
}

export default function TabPlayground({
  title = 'Tabs Playground',
  initialCode,
  minHeight = 360,
}) {
  const defaultCode = `function App() {
  const [active, setActive] = React.useState('Preview');
  const tabs = ['Preview', 'Details', 'Logs'];

  return (
    <section style={{
      maxWidth: 560,
      margin: '0 auto',
      border: '1px solid #cad9ef',
      borderRadius: 16,
      overflow: 'hidden',
      background: '#ffffffcc',
      backdropFilter: 'blur(2px)'
    }}>
      <header style={{
        display: 'flex',
        gap: 8,
        padding: 10,
        background: 'linear-gradient(90deg, #f9f6d8, #f3ecff)'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            style={{
              border: 0,
              borderRadius: 10,
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 700,
              letterSpacing: '.2px',
              color: active === tab ? '#ffffff' : '#223145',
              background: active === tab ? '#1d4ed8' : '#ffffff'
            }}
          >
            {tab}
          </button>
        ))}
      </header>
      <main style={{padding: 16, lineHeight: 1.5}}>
        {active === 'Preview' && <p>Live preview of the tab component.</p>}
        {active === 'Details' && <p>Details panel for component metadata.</p>}
        {active === 'Logs' && <p>Logs panel for interaction history.</p>}
      </main>
    </section>
  );
}`;

  const [code, setCode] = useState(initialCode || defaultCode);

  const srcDoc = useMemo(() => buildSrcDoc(code), [code]);

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <h3>{title}</h3>
        <button
          type="button"
          className={styles.resetButton}
          onClick={() => setCode(initialCode || defaultCode)}
        >
          Reset
        </button>
      </header>

      <div className={styles.grid}>
        <div className={styles.leftPane}>
          <div className={styles.paneLabel}>Code Logic</div>
          <textarea
            className={styles.editor}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            aria-label="Tab component code editor"
          />
        </div>

        <div className={styles.rightPane}>
          <div className={styles.paneLabel}>Browser Preview</div>
          <iframe
            title="Tab playground preview"
            className={styles.previewFrame}
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            style={{minHeight}}
          />
        </div>
      </div>
    </section>
  );
}
