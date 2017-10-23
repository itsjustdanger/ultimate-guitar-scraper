const url = require('url')
const cheerio = require('cheerio')

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

function parseType (type) {
  type = type.trim().toLowerCase()
  switch (type) {
    case 'video':
    case 'video lesson':
      return types['video lessons']
    case 'tab':
      return types['tabs']
    case 'chords':
      return types['chords']
    case 'bass':
    case 'bass tab':
      return types['bass tabs']
    case 'guitar pro':
      return types['guitar pro tabs']
    case 'power':
    case 'power tab':
    case 'tab pro':
    case 'official':
      return types['power tabs']
    case 'drums':
    case 'drum tab':
      return types['drum tabs']
    case 'ukulele chords':
    case 'ukulele':
      return types['ukulele chords']
    default:
      if (type.length > 0) console.log(`parseType unkown type '${type}'`)
  }
}

/**
* Trim and remove new line, carriage return and tab characters.
* @param {String} text
* @return {String} cleaned text
*/
function removeShit (text) {
  return text.trim().replace(/[\n\r\t]/g, '')
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
* Return the TAB from a HTML <tr></tr> tag.
*/
function searchExtractTab ($, tr) {
  let tds = $(tr).children('td').toArray()
  let tab = {}
  // Ultimate guitar add an extra <td> tag at the beginning of the first <tr>,
  // to prevent scraping.
  if (tds.length === 5) {
    tds.shift()
  }
  // Artist.
  let $td1 = $(tds[0])
  if ($td1.find('a').length === 1) {
    tab['artist'] = removeShit($td1.text())
  }
  let $td2 = $(tds[1])
  let $link = $td2.find('a').first()
  if ($link && $link.attr('href')) {
    // Url.
    let href = $link.attr('href')
    tab['url'] = url.resolve('http://tabs.ultimate-guitar.com/', href)
    // Name.
    tab['name'] = removeShit($link.text())
  }
  // Difficulty.
  let $dn = $td2.find('.dn').first()
  if ($dn) {
    let difficulty = $dn.text().replace(/\+?\s?difficulty:?/i, '').trim()
    if (typeof difficulties[difficulty] !== 'undefined') {
      tab['difficulty'] = difficulty
    }
  }
  // Rating.
  let $td3 = $(tds[2])
  let $rating = $td3.find('.rating')
  if ($rating) {
    let rating = parseFloat($rating.attr('title'))
    if (!isNaN(rating)) tab['rating'] = rating
  }
  // Number of rates.
  let $ratdig = $td3.find('.ratdig')
  if ($ratdig) {
    let numberRates = parseInt($ratdig.text())
    if (!isNaN(numberRates)) tab['numberRates'] = numberRates
  }
  // Type.
  let $td4 = $(tds[3])
  tab.type = parseType(removeShit($td4.text()))
  return tab
}

/**
* Return TABs from the response body.
*/
function parseListTABs (body) {
  const $ = cheerio.load(body)
  let artist
  return $('.tresults tr').toArray().reduce((tabs, tr) => {
    let tab = searchExtractTab($, tr)
    if (tab && tab.name && tab.url && tab.type) {
      // Only the first TAB has the artist name.
      // Only the first TAB is type 'tab pro', which we skip.
      if (tab.artist) {
        artist = tab.artist
      } else if (artist) {
        tab.artist = artist
        tabs.push(tab)
      }
    }
    return tabs
  }, [])
}

function parseSingleTAB (html, tabUrl) {
  const $ = cheerio.load(html)
  let tab = {
    url: url.parse(tabUrl).href
  }

  let page = $('.page_bcg')
  if (!page) {
    return null
  }

  let $titleElement = $('.page_bcg .t_header .t_title h1')
  if (!$titleElement) {
    return null
  }
  let title = $titleElement.text()
  let match = /(.*)\s(power tab|power|drums|drum tab|guitar pro|video lesson|video|bass|ukulele|ukulele chords|chords|tab)$/i.exec(title)
  if (match == null || match.length !== 3) {
    return null
  }
  // name
  tab.name = match[1]
  // type
  tab.type = parseType(match[2])
  // artist
  let $bandLink = $('.page_bcg .t_header .t_title .t_autor a')
  if (!$bandLink) {
    return null
  }
  tab.artist = $bandLink.text().split('\n')[0]
  // rating
  let $ratingElement = $('.page_bcg .t_header .raiting')
  let rating = $ratingElement.find('.voting a.cur').length
  if (rating > 0) tab.rating = rating
  // numberRates
  let $numberRatesElement = $ratingElement.find('.v_c')
  if ($numberRatesElement) {
    let numberRates = parseInt($numberRatesElement.text().trim().replace(/\D/, ''))
    if (!isNaN(numberRates)) tab.numberRates = numberRates
  }
  // difficulty
  let $infoKeysElement = $('.page_bcg .t_b .t_dt')
  let $infoValuesElement = $('.page_bcg .t_b .t_dtd .t_dtde')
  if ($infoKeysElement && $infoValuesElement) {
    let infoKeys = $infoKeysElement.html().split(/<br\/?>/).map((text) => {
      return text.trim()
    })
    for (let i = 0; i < infoKeys.length; i++) {
      if (infoKeys[i].toLowerCase() === 'difficulty' && i < $infoValuesElement.length) {
        tab.difficulty = $($infoValuesElement[i]).text().trim()
        break
      }
    }
  }
  // content
  tab.content = {}
  switch (tab.type) {
    case types['tabs']:
    case types['chords']:
    case types['ukulele chords']:
    case types['drum tabs']:
    case types['bass tabs']:
      let $contentElement = $('.page_bcg .js-copy-content').first()
      if ($contentElement.length === 0) {
        return null
      }
      tab.content.text = $contentElement.text()
      tab.content.html = $contentElement.html()
      break
    case types['power tabs']:
    case types['guitar pro tabs']:
      let $downloadId = $('.page_bcg .tab_download_box input#tab_id')
      if ($downloadId.length === 0) {
        return null
      }
      tab.content.url = 'https://tabs.ultimate-guitar.com/tabs/download?id=' + $downloadId.val()
      break
    case types['video lessons']:
      let $iframe = $('.page_bcg .t_b iframe')
      if ($iframe.length === 0) {
        return null
      }
      tab.content.url = $iframe.attr('src').replace('//', '')
      break
  }
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
  let acceptedParams = ['band_name', 'song_name', 'type', 'page']
  let requiredParams = ['band_name']
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
  // to not evoke suspicion, we try to make the same request as in the ultimate guitar web application
  params.view_state = 'advanced'
  params.tab_type_group = 'text'
  params.app_name = 'ugt'
  params.order = 'myweight'
  params.version_la = ''

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
