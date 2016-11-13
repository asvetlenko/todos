'use strict';

import {createStore, combineReducers} from 'redux'
import React from 'react';
import { render } from 'react-dom'

import expect, { createSpy, spyOn, isSpy } from 'expect';
import deepFreeze from 'deep-freeze';

const todo = (state, action) => {
  switch (action.type){
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if(state.id !== state.id){
        return state;
      }
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

const todos = (state = [], action) => {
  switch (action.type){
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      return state.map(item => todo(item, action));
    default:
      return state;
  }
};

const testAddTodo = () => {
  const stateBefore = [];
  const action = {
    type: 'ADD_TODO',
    id: 0,
    text: 'Learn Reux',
  };
  const stateAfter = [
    {
      id: 0,
      text: 'Learn Reux',
      completed: false
    }
  ];

  deepFreeze(stateBefore);
  deepFreeze(action);

  expect(
    todos(stateBefore, action)
  ).toEqual(stateAfter)
};

const testToggleTodo = () => {
  const stateBefore = [
    {
      id: 0,
      text: 'Learn Reux',
      completed: false
    },
    {
      id: 1,
      text: 'Go shopping',
      completed: false
    }
  ];
  const action = {
    type: 'TOGGLE_TODO',
    id: 1
  };
  const stateAfter = [
    {
      id: 0,
      text: 'Learn Reux',
      completed: false
    },
    {
      id: 1,
      text: 'Go shopping',
      completed: true
    }
  ];

  deepFreeze(stateBefore);
  deepFreeze(action);

  expect(
    todos(stateBefore, action)
  ).toEqual(stateAfter)

};

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  };
};

const todoApp = combineReducers({todos, visibilityFilter});
/*
const todoApp = (status = {}, action) => { // const todoApp = combineReducers({todos, visibilityFilter});
  return {
    todos: todos(
      status.todos,
      action
    ),
    visibilityFilter: visibilityFilter(
      status.visibilityFilter,
      action
    )
  };
};
*/

const store = createStore(todoApp);
console.log('Initial state:');
console.log(store.getState());
console.log('-----------------------');

console.log('Dispatching ADD_TODO.');
store.dispatch({
  type:'ADD_TODO',
  id:0,
  text: 'Learn Redux'
});

console.log('Current state:');
console.log(store.getState());
console.log('-----------------------');

console.log('Dispatching ADD_TODO.');
store.dispatch({
  type:'ADD_TODO',
  id:1,
  text: 'Go Shopping'
});

console.log('Current state:');
console.log(store.getState());
console.log('-----------------------');

console.log('Dispatching TOGGLE_TODO.');
store.dispatch({
  type:'TOGGLE_TODO',
  id:0
});

console.log('Current state:');
console.log(store.getState());
console.log('-----------------------');


console.log('Dispatching SET_VISIBILITY_FILTER.');
store.dispatch({
  type:'SET_VISIBILITY_FILTER',
  filter:'SHOW_COMPLETED'
});

console.log('Current state:');
console.log(store.getState());
console.log('-----------------------');
