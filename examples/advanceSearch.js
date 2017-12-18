const ugs = require('../lib/index')

ugs.advanceSearch({
  bandName: 'Pink Floyd',
  songName: 'Wish You Were Here',
  page: 1,
  type: ['tabs', 'chords', 'guitar pro tabs']
}, (error, tabs) => {
  if (error) {
    console.log(error)
  } else {
    console.log(tabs)
  }
})
