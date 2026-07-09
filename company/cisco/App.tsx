import type { RemotePanelProps } from './RemoteModuleHost';
import { RemoteModuleHost } from './RemoteModuleHost';

function BillingPanel({ tenantId, onNavigate }: RemotePanelProps) {
  return (
    <article>
      <h2>Billing overview</h2>
      <p>Tenant: {tenantId}</p>
      <button type="button" onClick={() => onNavigate('/invoices')}>
        View invoices
      </button>
    </article>
  );
}

async function loadBillingRemote() {
  const number = Math.floor(Math.random() * 3);
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 700);
  });
  if (number % 2) {
    throw new Error('throw new error');
  }
  return { default: BillingPanel };
}

export function App() {
  return (
    <main>
      <RemoteModuleHost
        name="Billing"
        tenantId="tenant-cisco-01"
        loadRemote={loadBillingRemote}
        onNavigate={(path) => console.info('navigate', path)}
      />
    </main>
  );
}
