import React from 'react';
import data from './data';
import Product from './components/Product';

function App() {
  return (
    <div className="grid-container">
      <header className="row">
        <div>
          <a className="brand" href="/">
            Amashoes
          </a>
        </div>
        <div>
          <a href="/cart">Cart</a>
          <a href="/signin">Sign in</a>
        </div>
      </header>

      <main>
        <div className="row center">
          {data.products.map((product) => (
            <div>
              <Product product={product} />
              <span>
                adnj
                <i className="fa fa-start"></i>
              </span>
            </div>
          ))}
        </div>
      </main>

      <footer className="row center">All right reserved</footer>
    </div>
  );
}

export default App;
