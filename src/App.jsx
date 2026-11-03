import React, { useEffect } from 'react';
import { navigate, useRoute } from './router.js';
import { StoreProvider, useStore } from './store.jsx';
import { Notice } from './ui.jsx';
import Home from './pages/Home.jsx';
import Listings from './pages/Listings.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import Sell from './pages/Sell.jsx';

function Shell() {
  const route = useRoute();
  const { notice, dismissNotice, resetDemo } = useStore();
  const routeKey = `${route.path}?${route.query.toString()}`;

  // Every navigation starts at the top of the new page.
  useEffect(() => { window.scrollTo(0, 0); }, [routeKey]);

  function reset() {
    if (window.confirm('Restore the example listings? Changes you made in this browser will be replaced.')) resetDemo();
  }

  let page;
  if (route.name === 'listings') page = <Listings />;
  else if (route.name === 'item') page = <ItemDetail id={route.params.id} />;
  else if (route.name === 'sell') page = <Sell />;
  else if (route.name === 'edit') page = <Sell id={route.params.id} />;
  else if (route.name === 'home') page = <Home />;
  else page = (
    <div className="page">
      <div className="empty-state">
        <p>That page does not exist.</p>
        <button className="primary" onClick={() => navigate('/')}>Go home</button>
      </div>
    </div>
  );

  const isActive = (path) => (route.path === path ? 'on' : '');

  return (
    <div className="market-app">
      <header className="navigation">
        <button className="brand" onClick={() => navigate('/')}>
          <span className="brand-icon" aria-hidden="true">✳</span>
          CAMPUS<span className="brand-alt">exchange</span>
        </button>

        <nav aria-label="Main">
          <button className={isActive('/listings')} onClick={() => navigate('/listings')}>Browse items</button>
          <button onClick={() => navigate('/listings?category=textbooks')}>Textbooks</button>
          <button onClick={() => navigate('/listings?category=electronics')}>Electronics</button>
        </nav>

        <div className="nav-actions">
          <span className="usercircle" title="Signed in as You">Y</span>
        </div>
      </header>

      <div className="notice-slot">
        <Notice message={notice} onDismiss={dismissNotice} />
      </div>

      <main id="main">{page}</main>

      <footer>
        <div className="footer-top">
          <div>
            <strong>CAMPUS exchange</strong>
            <span>From students, for students.</span>
          </div>
          <div className="footer-links">
            <button onClick={() => navigate('/listings')}>Browse items</button>
            <button onClick={() => navigate('/sell')}>Sell an item</button>
            <button className="reset" onClick={reset}>Reset demo</button>
          </div>
        </div>
        <div className="utility">
          <span>Campus Exchange</span>
          <span>Trusted by students • All prices in EGP</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
