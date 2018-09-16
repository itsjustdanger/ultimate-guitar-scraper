const request = require('request')
const utils = require('./utils')

function search (query, callback, requestOptions) {
  requestOptions = requestOptions || {}
  query = utils.formatSearchQuery(query)
  requestOptions.url = 'http://www.ultimate-guitar.com/search.php?' + utils.encodeParams(query)
  return request(requestOptions, (error, response, body) => {
    if (error) {
      return callback(error, null, response, body)
    } else if (response.statusCode !== 200) {
      return callback(new Error('Bad response'), null, response, body)
    } else {
      const tabs = utils.parseListTABs(body)
      return callback(null, tabs, response, body)
    }
  })
}

function autocomplete (query, callback, requestOptions) {
  requestOptions = requestOptions || {}
  query = query.toLowerCase()
  const letter = query[0]
  // Ultimate-Guitars autocomplete only supports a maximum of 5 characters, and underscores are recognized as spaces.
  query = query.slice(0, 4).replace(' ', '_')
  requestOptions.url = 'https://www.ultimate-guitar.com/static/article/suggestions/' + letter + '/' + query + '.js'
  return request(requestOptions, (error, response, body) => {
    if (error) {
      return callback(error, null, response, body)
    } else if (response.statusCode !== 200) {
      return callback(new Error('Bad response'))
    } else {
      try {
        const results = JSON.parse(body)
        if (results.hasOwnProperty('suggestions')) {
          return callback(null, results['suggestions'], response, body)
        } else {
          return callback(new Error('Bad response'), null, response, body)
        }
      } catch (e) {
        return callback(new Error('Bad response'), null, response, body)
      }
    }
  })
}

function get (tabUrl, callback, requestOptions) {
  requestOptions = requestOptions || {}
  requestOptions.url = tabUrl
  return request(requestOptions, (error, response, body) => {
    if (error) {
      return callback(error, null, response, body)
    } else if (response.statusCode !== 200) {
      return callback(new Error('Bad response'), null, response, body)
    } else {
      const tab = utils.parseSingleTAB(body, tabUrl)
      if (tab) {
        return callback(null, tab, response, body)
      } else {
        return callback(new Error("Can't parse TAB"), null, response, body)
      }
    }
  })
}

module.exports = {
  search,
  autocomplete,
  get
}
