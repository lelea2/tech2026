import styles from './styles.module.css';
export default function App() {
  return (
    <div className="layout">
      <header className="header">Header</header>

      <main className="columns">
        <nav className="left">Navigation</nav>
        <section className="content">Main Content</section>
        <aside className="right">Ads</aside>
      </main>

      <footer className="footer">Footer</footer>
    </div>
  );
}
