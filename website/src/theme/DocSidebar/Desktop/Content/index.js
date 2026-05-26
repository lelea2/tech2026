import React from 'react';
import OriginalContent from '@theme-original/DocSidebar/Desktop/Content';
import SidebarSearch from '@site/src/components/SidebarSearch';
import styles from './styles.module.css';

export default function DocSidebarDesktopContentWrapper(props) {
  return (
    <div className={styles.contentWithSearch}>
      <SidebarSearch sidebar={props.sidebar} />
      <OriginalContent {...props} />
    </div>
  );
}
