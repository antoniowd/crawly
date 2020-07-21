const Crawly = require('./lib/crawler');

const crawly = new Crawly({
  delay: 10000,
  parser: function (err, res, done) {
    const self = this;
    if (err) {
      console.log(err);
      done();
    } else {

      const { document, params } = res;
      switch (params.page) {
        case 'profile': {
          const tabs = document.querySelectorAll('a.link-gray.no-underline.no-wrap');
          if (tabs[1]) {
            self.addQueue(`https://github.com${tabs[1].href}`, {
              page: 'following',
              deep: params.deep
            });
          }
          break;
        }
        case 'following': {
          const followingList = document.querySelectorAll('.v-align-top.pr-3 > a > span.link-gray.pl-1') || [];
          const username = document.querySelector('.p-nickname').textContent;
          const users = [];
          followingList.forEach((item) => {
            const name = item.textContent;
            if (name) {

              users.push(name);

              if (params.deep < 2) {
                self.addQueue(`https://github.com/${name}`, {
                  page: 'profile',
                  deep: params.deep + 1
                });
              }
            }
          });

          console.log(`${username} is following these users: ${users.join(', ')}\n`);
          break;
        }
      }

      done();
    }
  }
});

crawly.run('https://github.com/antoniowd', () => {
  console.log('ok');
}, {
  page: 'profile',
  deep: 0
});