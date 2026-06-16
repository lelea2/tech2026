import React, {useState} from 'react';
import OriginalTOC from '@theme-original/TOC';
import styles from './styles.module.css';

export default function CollapsibleTOC(props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasItems = Array.isArray(props.toc) && props.toc.length > 0;

  if (!hasItems) {
    return <OriginalTOC {...props} />;
  }

  return (
    <div className={styles.tocWrapper}>
      <button
        type="button"
        className={styles.toggleButton}
        aria-expanded={!isCollapsed}
        aria-controls="right-navigation-toc"
        onClick={() => setIsCollapsed((current) => !current)}>
        <span>On this page</span>
        <span aria-hidden="true">{isCollapsed ? 'Show' : 'Hide'}</span>
      </button>

      {!isCollapsed && (
        <div id="right-navigation-toc" className={styles.tocContent}>
          <OriginalTOC {...props} />
        </div>
      )}
    </div>
  );
}
