const ugs = require('../lib/index')

let query = {
  bandName: 'Muse'
}

function callback (error, tabs, response, body) {
  if (error) {
    console.log(error)
  } else {
    console.log(tabs)
    console.log('Utlimate Guitar server: ' + response.headers['server'])
  }
}

var options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
  }
}

ugs.search(query, callback, options)
