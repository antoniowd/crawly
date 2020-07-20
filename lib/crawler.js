'use strict';
const got = require('got')
  , { JSDOM } = require('jsdom')
  , EventEmitter = require('events').EventEmitter
  , util = require('util');

function Crawly(options) {
  const self = this;
  self.queue = [];
  self.opts = options || {};

  if (!self.opts.parse || typeof self.opts.parse !== 'function') {
    throw new Error('Invalid parse function');
  }
}

util.inherits(Crawly, EventEmitter);

Crawly.prototype.addQueue = function (url) {
  this.queue.push(url);
}

Crawly.prototype.run = function (seed, done) {
  const self = this;

  const next = () => {
    const url = self.queue.pop();
    if (url) {
      self._request(url, next);
    } else {
      done();
    }
  }

  self._request(seed, next);
}

Crawly.prototype._request = function (url, next) {
  const self = this;
  got(url)
    .then((response) => {
      const jsdom = new JSDOM(response.body);
      const res = {
        response,
        body: response.body,
        document: jsdom.window.document
      };
      this.opts.parse.call(self, null, res, next);
    })
    .catch((err) => {
      this.opts.parse.call(self, err);
    });
}

module.exports = Crawly;