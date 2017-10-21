/* eslint-env jasmine */
const utils = require('../lib/utils')
const ugs = require('../lib/index')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000

function basicSearchQuery () {
  return {
    bandName: 'Muse'
  }
}

function basicAutocompleteQuery () {
  return {
    query: 'Ozzy'
  }
}

function completeSearchQuery () {
  return {
    bandName: 'Black Keys',
    songName: 'Little Black Submarines',
    type: ['video lessons', 'tabs', 'chords', 'bass tabs', 'guitar pro tabs', 'power tabs', 'drum tabs', 'ukulele chords'],
    page: 1
  }
}

describe('utils', () => {
  describe('formatAutocompleteSearchQuery', () => {
    it('is invalid without param query', () => {
      expect(() => {
        utils.formatAutocompleteSearchQuery({})
      }).toThrowError(Error)
    })

    it('is invalid with bad param type', () => {
      expect(() => {
        utils.formatAutocompleteSearchQuery({
          query: 'Muse',
          type: 'artisssssst'
        })
      }).toThrowError(Error)
    })

    it("is invalid without param 'artist' if param 'type' is 'tab'", () => {
      expect(() => {
        utils.formatAutocompleteSearchQuery({
          query: 'New Born',
          type: 'tab'
        })
      }).toThrowError(Error)
    })

    it('uses default params', () => {
      let query = basicAutocompleteQuery()
      expect(utils.formatAutocompleteQuery(query)).toEqual({
        q: 'Ozzy',
        type: 'artist'
      })
    })
  })

  describe('formatSearchQuery', () => {
    it('is invalid without param bandName', () => {
      expect(() => {
        utils.formatSearchQuery({})
      }).toThrowError(Error)
    })

    it('uses default params', () => {
      let query = basicSearchQuery()
      expect(utils.formatSearchQuery(query)).toEqual({
        band_name: 'Muse',
        type: [ 300, 200 ],
        page: 1,
        view_state: 'advanced',
        tab_type_group: 'text',
        app_name: 'ugt',
        order: 'myweight',
        version_la: ''
      })
    })

    it('uses params', () => {
      let query = completeSearchQuery()
      expect(utils.formatSearchQuery(query)).toEqual({
        band_name: 'Black Keys',
        song_name: 'Little Black Submarines',
        type: [ 100, 200, 300, 400, 500, 600, 700, 800 ],
        page: 1,
        view_state: 'advanced',
        tab_type_group: 'text',
        app_name: 'ugt',
        order: 'myweight',
        version_la: ''
      })
    })
  })
})

describe('ultimate-guitar-scraper', () => {
  describe('search', () => {
    it('searches TABs', (done) => {
      let query = basicSearchQuery()
      ugs.search(query, (error, results) => {
        expect(error).toBeNull()
        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBeGreaterThan(0)
        done()
      })
    })

    it('searches TABs with request options', (done) => {
      let query = completeSearchQuery()
      let requestOptions = {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
      }
      ugs.search(query, (error, results, response, body) => {
        expect(error).toBeNull()
        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBeGreaterThan(0)

        expect(response.statusCode).toBe(200)
        expect(typeof body).toBe('string')
        done()
      }, requestOptions)
    })
  })

  describe('get', () => {
    let tabUrl

    beforeEach(() => {
      tabUrl = 'https://tabs.ultimate-guitar.com/t/the_black_keys/little_black_submarines_ver2_tab.htm'
    })

    it('get the TAB', (done) => {
      ugs.get(tabUrl, (error, tab) => {
        expect(error).toBeNull()
        expect(typeof tab).toBe('object')
        expect(typeof tab.name).toBe('string')
        expect(typeof tab.type).toBe('string')
        expect(typeof tab.artist).toBe('string')
        expect(typeof tab.artist).toBe('string')

        expect(typeof tab.contentText).toBe('string')
        expect(tab.contentText.trim().length).toBeGreaterThan(0)

        expect(typeof tab.contentHTML).toBe('string')
        expect(tab.contentHTML.trim().length).toBeGreaterThan(0)
        // Optional properties.
        expect(typeof tab.rating).not.toBe('undefined')
        expect(typeof tab.numberRates).not.toBe('undefined')
        expect(typeof tab.difficulty).not.toBe('undefined')
        done()
      })
    })

    it('get the TAB with request options', (done) => {
      let requestOptions = {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
      }
      ugs.get(tabUrl, (error, tab, response, body) => {
        expect(error).toBeNull()
        expect(typeof tab).toBe('object')
        expect(typeof tab.name).toBe('string')
        expect(typeof tab.type).toBe('string')
        expect(typeof tab.artist).toBe('string')
        // Optional properties.
        expect(typeof tab.rating).not.toBe('undefined')
        expect(typeof tab.numberRates).not.toBe('undefined')
        expect(typeof tab.difficulty).not.toBe('undefined')

        expect(response.statusCode).toBe(200)
        expect(typeof body).toBe('string')
        done()
      }, requestOptions)
    })
  })

  describe('autocomplete', () => {
    it('get suggestions', (done) => {
      let query = 'Ozzy'
      ugs.autocomplete(query, (error, suggestions) => {
        expect(error).toBeNull()
        expect(Array.isArray(suggestions)).toBe(true)
        expect(suggestions.length).toBeGreaterThan(0)
        done()
      })
    })

    it('get suggestions for artist, with request options', (done) => {
      let requestOptions = {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
      }
      let query = 'Crazy'
      ugs.autocomplete(query, (error, suggestions, response, body) => {
        expect(error).toBeNull()
        expect(Array.isArray(suggestions)).toBe(true)
        expect(suggestions.length).toBeGreaterThan(0)

        expect(response.statusCode).toBe(200)
        expect(typeof body).toBe('string')
        done()
      }, requestOptions)
    })
  })
})
