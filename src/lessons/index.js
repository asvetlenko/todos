'use strict';

//lesson 9;
import {createStore} from 'redux'
import React from 'react';
import { render } from 'react-dom'

import expect, { createSpy, spyOn, isSpy } from 'expect'
import deepFreeze from 'deep-freeze'

const defaultState = 0;

const counter = (state = defaultState, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
};

const Counter = ({value, onIncrement, onDecrement}) => (
  <div>
    <h1>{value}</h1>
    <button onClick={onIncrement}>+</button>
    <button onClick={onDecrement}>-</button>
  </div>
);

const store = createStore(counter);

const renderPage = () => {
  render(
    <Counter
      value={store.getState()}
      onIncrement = {() =>
        store.dispatch({
          type: 'INCREMENT'
        })}
      onDecrement = {() =>
        store.dispatch({
          type: 'DECREMENT'
        })}
    />,
    document.getElementById('root')
  );
};


store.subscribe(renderPage);
renderPage();
