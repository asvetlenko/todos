'use strict';

import {createStore} from 'redux'
import React from 'react';
import { render } from 'react-dom'

import expect, { createSpy, spyOn, isSpy } from 'expect';
import deepFreeze from 'deep-freeze';

const toggleTodo = (todo) => {
  return {...todo, completed: !todo.cpmpleted};
};

const testToggleTodo = () => {
  const todoBefore = {
    id: 0,
    text: 'Learn Redux',
    completed: false
  };

  const todoAfter = {
    id: 0,
    text: 'Learn Redux',
    completed: true
  };

  deepFreeze(todoBefore);

  expect(
    toggleTodo(todoBefore)
  ).toEqual(todoAfter);
};

testToggleTodo();
console.log('All tests passed.');