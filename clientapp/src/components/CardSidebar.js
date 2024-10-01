import React from 'react';

const CardSidebar = () => {
  return (
    <aside className="card-sidebar">
      <ul>
        <li>
          <article data-glow>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M14.447 3.026a.75.75 0 0 1 .527.921l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.527ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
              <h2>Div Tamer</h2>
              <span>Style co.</span>
            </div>
            <hr />
            <span>Total Comp.</span>
            <span>$1,000,000 - $1,240,000</span>
          </article>
        </li>
        {/* Добавьте остальные карточки */}
      </ul>
    </aside>
  );
};

export default CardSidebar;
