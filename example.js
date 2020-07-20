const Crawly = require('./lib/crawler');

const crawly = new Crawly({
  parse: function (err, res, done) {
    if (err) {
      console.log(err);
      done();
    } else {

      const self = this;
      const { document } = res;

      console.log(document.querySelector('title').innerHTML);
      (document.querySelectorAll('.pinned-item-list-item-content a') || []).forEach(function (item) {
        self.addQueue(`https://github.com${item.href}`);
      });

      done();
    }
  }
});

crawly.run('https://github.com/antoniowd', () => {
  console.log('ok');
});