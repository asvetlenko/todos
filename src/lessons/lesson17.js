'use strict';

import {createStore, combineReducers} from 'redux'
import React from 'react';
import ReactDOM, { render} from 'react-dom'

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



const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  };
};

const todoApp = combineReducers({todos, visibilityFilter});

const store = createStore(todoApp);

let nextTodoId = 0;
class TodoApp extends React.Component {
  render(){
    return (
      <div>
        <input ref={node => {
          this.input = node;
        }} />
        <button onClick={() => {
          store.dispatch({
            type: 'ADD_TODO',
            text: this.input.value.trim(),
            id: nextTodoId++
          });
          this.input.value = '';
        }}>
          Add Todo
        </button>
        <ul>
          {this.props.todos.map(todo =>
            <li key={todo.id}>
              {todo.text}
            </li>
          )}
        </ul>
      </div>
    );
  }
}

const render1 = () => {
  ReactDOM.render(
    <TodoApp
      todos={store.getState().todos}/>,
    document.getElementById('root')
  )
};


store.subscribe(render1);
render1();