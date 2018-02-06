const cheerio = require('cheerio')
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

function extractContent (data) {
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
}

const difficulties = {
  'novice': 'novice',
  'intermediate': 'intermediate',
  'advanced': 'advanced'
}

const types = {
  'video lessons': 'video lessons',
  'tabs': 'tabs',
  'chords': 'chords',
  'bass tabs': 'bass tabs',
  'guitar pro tabs': 'guitar pro tabs',
  'power tabs': 'power tabs',
  'drum tabs': 'drum tabs',
  'ukulele chords': 'ukulele chords',
  'official': 'official'
}

/**
* TAB typeValues
* @type {Hash}
*/
const typeValues = {
  'video lessons': 100,
  'tabs': 200,
  'chords': 300,
  'bass tabs': 400,
  'guitar pro tabs': 500,
  'power tabs': 600,
  'drum tabs': 700,
  'ukulele chords': 800
}

/**
* Change a string with camelCase to snake_case
* @param {String} camelCase string
* @return {String} snake_case string
*/
function underscore (string) {
  let underscored = string[0].toLowerCase()
  return underscored + string.slice(1, string.length).replace(/([A-Z])/g, (match) => {
    return '_' + match.toLowerCase()
  })
}

/**
* Take the name of a TAB type and return its value.
* @param {String} type name
* @return {Number} type value
*/
function validateType (type) {
  type = String(type)
  if (typeValues.hasOwnProperty(type)) {
    return typeValues[type]
  } else {
    throw new Error("Unknown type '" + type + "'. Accepted type are: '" + Object.keys(typeValues).join("', '") + "'")
  }
}

/**
* Return TABs from the response body.
*/
function parseListTABs (body) {
  const $ = cheerio.load(body)
  const data = extractJavaScriptAssignation($, 'window.UGAPP.store.page')
  if (!data) return []
  return data.data.results.reduce((tabs, result) => {
    if (typeof result.marketing_type !== 'undefined') return tabs
    const tab = {}
    // Artist.
    tab.artist = result.artist_name
    // Name.
    tab.name = result.song_name
    // Url.
    tab.url = result.tab_url
    // Rating and number rates.
    tab.rating = result.rating
    tab.numberRates = result.votes
    // Type.
    tab.type = result.type_name

    tabs.push(tab)
    return tabs
  }, [])
}

function parseSingleTAB (html, tabUrl) {
  const $ = cheerio.load(html)
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
  tab.type = data.data.tab.type_name
  // Difficulty.
  if (typeof data.data.tab_view.meta.difficulty === 'string') {
    tab.difficulty = data.data.tab_view.meta.difficulty
  }
  // Content.
  tab.content = extractContent(data)
  return tab
}

/**
* Validate the query params and set the default params for the 'search'
*
* @param {Object} query params
* @return {Object} formatted query params
*/
function formatSearchQuery (query) {
  let params = {}
  let acceptedParams = ['query', 'type', 'page']
  let requiredParams = ['query']
  let defaults = {
    type: ['chords', 'tabs'],
    page: 1
  }

  // accepted params only
  for (let param in query) {
    let underscored = underscore(param)
    if (acceptedParams.indexOf(underscored) !== -1) {
      params[underscored] = query[param]
    } else {
      throw new Error("Unknown param '" + underscored + "'. Accepted params are: '" + acceptedParams.join("', '") + "'.")
    }
  }
  // required params
  for (let i = 0; i < requiredParams.length; i++) {
    if (Object.keys(params).indexOf(requiredParams[i]) === -1) {
      throw new Error("Query requires param '" + requiredParams[i] + "'.")
    }
  };
  // default params
  for (let param in defaults) {
    if (!params.hasOwnProperty(param)) {
      params[param] = defaults[param]
    }
  }
  // param 'type' can be a string or an array of string
  if (Array.isArray(params.type)) {
    for (let i = 0; i < params.type.length; i++) {
      params.type[i] = validateType(params.type[i])
    };
  } else {
    params.type = validateType(params.type)
  }
  // Rename `query` => `value`
  params.value = params.query
  delete params.query

  // to not evoke suspicion, we try to make the same request as in the ultimate guitar web application
  params.search_type = 'title'
  params.order = ''

  return params
}

function encodeParam (key, value) {
  if (Array.isArray(value)) {
    return value.map((item) => encodeParam(`${key}[]`, item)).join('&')
  } else {
    return key + '=' + encodeURIComponent(value)
  }
}

/**
* Encode the query params
*
* @param {Object} query params
* @return {String} encoded query params
*/
function encodeParams (params) {
  // encode everything
  return Object.keys(params).map((key) => {
    return encodeParam(key, params[key])
  }).join('&').replace(/%20/g, '+')
}

module.exports = {
  encodeParams,
  parseListTABs,
  parseSingleTAB,
  formatSearchQuery
}
