import { useId, useState } from 'react';

const items =[
  {
    value: 'html',
    label: 'HTML',
    panel:
      'The HyperText Markup Language or HTML is the standard markup language for documents designed to be displayed in a web browser.',
  },
  {
    value: 'css',
    label: 'CSS',
    panel:
      'Cascading Style Sheets is a style sheet language used for describing the presentation of a document written in a markup language such as HTML or XML.',
  },
  {
    value: 'javascript',
    label: 'JavaScript',
    panel:
      'JavaScript, often abbreviated as JS, is a programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS.',
  },
];

function getTabListItemId(tabsId, value) {
  return tabsId + '-tab-' + value;
}

function getTabPanelId(tabsId, value) {
  return tabsId + '-tabpanel-' + value;
}

export default function Tabs() {
  const tabsId = useId();
  const [value, setValue] = useState(items[0].value);

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-700" role="tablist">
        {items.map(({ label, value: itemValue }) => {
          const isActiveValue = itemValue === value;

          return (
            <button
              id={getTabListItemId(tabsId, itemValue)}
              key={itemValue}
              type="button"
              className={[
                'px-4 py-2 text-sm font-medium rounded-t transition-colors',
                isActiveValue
                  ? 'bg-slate-700 text-white border-b-2 border-orange-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
              ].join(' ')}
              onClick={() => setValue(itemValue)}
              role="tab"
              aria-controls={getTabPanelId(tabsId, itemValue)}
              aria-selected={isActiveValue}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="pt-4">
        {items.map(({ panel, value: itemValue }) => (
          <div
            key={itemValue}
            id={getTabPanelId(tabsId, itemValue)}
            aria-labelledby={getTabListItemId(tabsId, itemValue)}
            role="tabpanel"
            hidden={itemValue !== value}
            className="text-slate-300 text-sm leading-relaxed"
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
