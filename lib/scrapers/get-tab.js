const yoloScraper = require('yolo-scraper')
// const url = require('url')
const schema = require('../../spec/support/schemas/tab.json')
const JSON5 = require('json5')

function extractJavaScriptAssignation ($, assignTo) {
  let script = $('script').toArray().find((script) => {
    return $(script).html().indexOf(assignTo) !== -1
  })
  if (!script) return
  const content = $(script).html()
  const index = content.indexOf('=')
  if (index === -1) return
  try {
    return JSON5.parse(content.slice(index + 1))
  } catch (error) {
    console.error(error)
  }
}

module.exports = yoloScraper.createScraper({

  request: function (tabUrl) {
    return tabUrl
  },

  extract: function (response, body, $) {
    const data = extractJavaScriptAssignation($, 'window.UGAPP.store.page')
    if (!data) return
    const tab = {}
    // Artist.
    tab.artist = data.data.tab.artist_name
    // Name.
    tab.name = data.data.tab.song_name
    // Url.
    tab.url = data.data.tab.tab_url
    // Rating and number rates.
    tab.rating = data.data.tab.rating
    tab.numberRates = data.data.tab.votes
    // Type.
    tab.type = data.data.tab.type
    // Difficulty.
    if (typeof data.data.tab_view.meta.difficulty === 'string') {
      tab.difficulty = data.data.tab_view.meta.difficulty
    }
    // Content.
    tab.content = this.extractContent(data)
    return tab
  },

  extractContent: function (data) {
    switch (data.data.tab.type) {
      case 'Video':
        let videoId = data.data.tab.marty_youtube_video_id
        if (!videoId) {
          videoId = data.data.tab_view.wiki_tab.content
        }
        return {
          url: `https://www.youtube.com/watch?v=${videoId}`
        }
      case 'Tabs':
      case 'Chords':
      case 'Bass Tabs':
      case 'Drum Tabs':
      case 'Ukulele Chords':
        return {
          text: data.data.tab_view.wiki_tab.content
        }
      case 'Power':
      case 'Pro':
        const id = data.data.tab.id
        return {
          url: `https://tabs.ultimate-guitar.com/tab/download?id=${id}`
        }
    }
  },

  schema
})
