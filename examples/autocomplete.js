var ugs = require('../lib/index')

var query = 'Ozzy'
ugs.autocomplete(query, function (error, suggestions) {
  if (error) {
    console.log(error)
  } else {
    console.log(suggestions)
  }
})
