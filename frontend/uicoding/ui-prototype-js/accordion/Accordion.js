import {useState} from 'react';

const accordionData = [
  {
    id: "html",
    title: "HTML",
    content:
      "The HyperText Markup Language or HTML is the standard markup language for documents designed to be displayed in a web browser.",
  },
  {
    id: "css",
    title: "CSS",
    content:
      "Cascading Style Sheets is a style sheet language used for describing the presentation of a document written in a markup language such as HTML or XML.",
  },
  {
    id: "javascript",
    title: "JavaScript",
    content:
      "JavaScript, often abbreviated as JS, is a programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS.",
  },
];

export default function Accordion() {
  const [openItems, setOpenItems] = useState(new Set());

  function toggleItem(id) {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  }

  return (
    <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800">
      <h2 className="text-xl font-bold mb-4">Accordion</h2>
      {accordionData.map((item) => {
        const isExpanded = openItems.has(item.id);
        return (
          <div key={item.id} className="border-b border-slate-800">
            <button
              className="flex justify-between items-center py-4 text-left w-full"
              onClick={() => toggleItem(item.id)}
              aria-expanded={openItems.has(item.id)}
              aria-controls={`${item.id}-content`}
            >
              <div className="font-medium gap-x-12">{item.title}</div>
              <div  aria-hidden="true">{openItems.has(item.id) ? '-' : '+'}</div>
            </button>
            {openItems.has(item.id) && (
              <div className="pb-4 text-slate-400" role="region" hidden={!isExpanded} id={`${item.id}-content`} aria-labelledby={`${item.id}-button`}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
