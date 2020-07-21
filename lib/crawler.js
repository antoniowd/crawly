'use strict';
const got = require('got');
const { JSDOM } = require('jsdom');

class Crawly {
  _queue;
  _opts;

  constructor(options) {
    this._queue = [];
    this._opts = {
      delay: 0,
      ...options
    };

    if (!this._opts.parser || typeof this._opts.parser !== 'function') {
      throw new Error('Invalid parser function');
    }
  }

  addQueue(url, params) {
    this._queue.push({
      url,
      params: params || {}
    });
  }

  queueSize() {
    return this._queue.length;
  }

  run(seed, done, params) {

    const request = (item, next) => {
      got(item.url)
        .then((response) => {
          const jsdom = new JSDOM(response.body);
          const res = {
            response,
            body: response.body,
            document: jsdom.window.document,
            params: item.params
          };
          this._opts.parser.call(this, null, res, next);
        })
        .catch((err) => {
          this._opts.parser.call(this, err);
        });
    }

    const next = () => {
      const item = this._queue.pop();
      if (item) {
        setTimeout(() => request(item, next), this._opts.delay);
      } else {
        done();
      }
    }

    request({
      url: seed,
      params: params || {}
    }, next);
  }

}

module.exports = Crawly;