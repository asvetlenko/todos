'use strict';

import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './components/App';
import reducer from './reducers';

render(
  <Provider store={createStore(reducer)}>
    <App />
  </Provider>,
  document.getElementById('root')
);

//import './lesson30';