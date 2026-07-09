import {useState} from 'react';
import './Accordion.css';

const ITEMS = [
  {title: 'What is included?', content: 'Wifi, kitchen, towels, and parking.'},
  {title: 'Cancellation policy', content: 'Free cancellation for 24 hours.'},
  {title: 'House rules', content: 'No parties and no smoking.'},
];

export default function Accordion({items = ITEMS}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="accordion">
      <h3>Accordion / Disclosure</h3>
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.title} className="item">
            <button onClick={() => setOpenIndex(open ? -1 : index)}>
              {item.title}
            </button>
            {open && <p>{item.content}</p>}
          </div>
        );
      })}
    </div>
  );
}
