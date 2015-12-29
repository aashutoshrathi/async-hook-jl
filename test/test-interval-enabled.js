'use strict';

const asyncHook = require('../async-hook.js');
const assert = require('assert');

let timerCalled = 0;

let initCalls = 0;
let preCalls = 0;
let postCalls = 0;
let destroyCalls = 0;

let initUid = NaN;
let initHandle = {};
let initParent = {};
let initProvider = NaN;

let preHandle = {};
let preUid = NaN;

let postHandle = {};
let postUid = NaN;

let destroyUid = NaN;

asyncHook.addHooks({
  init: function (uid, handle, provider, parent) {
    initUid = uid;
    initHandle = handle;
    initParent = parent;
    initProvider = provider;

    initCalls += 1;
  },
  pre: function (uid, handle) {
    preUid = uid;
    preHandle = handle;

    preCalls += 1;
  },
  post: function (uid, handle) {
    postUid = uid;
    postHandle = handle;

    postCalls += 1;
  },
  destroy: function (uid) {
    destroyUid = uid;
    destroyCalls += 1;
  }
});

asyncHook.enable();

const timerId = setInterval(function (arg1, arg2) {
  timerCalled += 1;
  assert.equal(arg1, 'a');
  assert.equal(arg2, 'b');

  if (timerCalled === 2) clearInterval(timerId);
}, 0, 'a', 'b');

asyncHook.disable();

process.once('exit', function () {
  assert.equal(initUid, preUid);
  assert.equal(initUid, postUid);
  assert.equal(initUid, destroyUid);

  assert.equal(initHandle, preHandle);
  assert.equal(initHandle, postHandle);

  assert.equal(initHandle.constructor.name, 'IntervalWrap');
  assert.equal(initParent, null);
  assert.equal(initProvider, 0);

  assert.equal(timerCalled, 2);
  assert.equal(initCalls, 1);
  assert.equal(preCalls, 2);
  assert.equal(postCalls, 2);
  assert.equal(destroyCalls, 1);
});
