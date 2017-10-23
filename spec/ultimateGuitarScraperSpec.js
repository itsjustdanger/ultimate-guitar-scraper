/* eslint-env jasmine */
const utils = require('../lib/utils')
const ugs = require('../lib/index')
const Ajv = require('ajv')
const ajv = new Ajv()

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000

// TODO: Move this in helper file?
const jsonSchemaMatcher = {
  toMatchJsonSchema: (util, customEqualityTesters) => {
    return {
      compare: (actual, expected) => {
        const schema = require(`./support/schemas/${expected}.json`)
        const valid = ajv.validate(schema, actual)

        if (!valid) console.error(ajv.errors)

        const result = {}
        result.pass = valid === true
        if (result.pass) {
          result.message = 'Expected ' + JSON.stringify(actual, null, 2) + `not to match schema ${expected}.json`
        } else {
          result.message = 'Expected ' + JSON.stringify(actual, null, 2) + `to match schema ${expected}.json`
        }
        return result
      }
    }
  }
}

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
  beforeEach(() => {
    jasmine.addMatchers(jsonSchemaMatcher)
  })

  describe('search', () => {
    it('searches TABs', (done) => {
      let query = basicSearchQuery()
      ugs.search(query, (error, tabs) => {
        expect(error).toBeNull()

        expect(tabs.length).toBeGreaterThan(0)
        expect(tabs).toMatchJsonSchema('tabs')

        done()
      })
    })

    it('searches TABs with request options', (done) => {
      let query = completeSearchQuery()
      let requestOptions = {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
      }
      ugs.search(query, (error, tabs, response, body) => {
        expect(error).toBeNull()

        expect(tabs.length).toBeGreaterThan(0)
        expect(tabs).toMatchJsonSchema('tabs')

        expect(response.statusCode).toBe(200)
        expect(typeof body).toBe('string')

        done()
      }, requestOptions)
    })
  })

  const tabUrlByType = {
    'video lessons': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver3_video_lesson.htm',
    'tabs': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver3_tab.htm',
    'chords': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver2_crd.htm',
    'bass tabs': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver3_btab.htm',
    'guitar pro tabs': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver2_guitar_pro.htm',
    'power tabs': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_power_tab.htm',
    'drum tabs': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_drum_tab.htm',
    'ukulele chords': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ukulele_crd.htm'
  }

  Object.keys(tabUrlByType).forEach((type) => {
    describe('get', () => {
      const tabType = type
      const tabUrl = tabUrlByType[type]

      it('get the TAB', (done) => {
        ugs.get(tabUrl, (error, tab) => {
          expect(error).toBeNull()

          expect(tab).toMatchJsonSchema('tab')
          expect(tab.type).toEqual(tabType)

          done()
        })
      })

      it('get the TAB with request options', (done) => {
        let requestOptions = {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
        }
        ugs.get(tabUrl, (error, tab, response, body) => {
          expect(error).toBeNull()

          expect(tab).toMatchJsonSchema('tab')
          expect(tab.type).toEqual(tabType)

          expect(response.statusCode).toBe(200)
          expect(typeof body).toBe('string')

          done()
        }, requestOptions)
      })
    })
  })

  describe('autocomplete', () => {
    it('get suggestions', (done) => {
      let query = 'Ozzy'
      ugs.autocomplete(query, (error, suggestions) => {
        expect(error).toBeNull()

        expect(suggestions.length).toBeGreaterThan(0)
        expect(suggestions).toMatchJsonSchema('suggestions')

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

        expect(suggestions.length).toBeGreaterThan(0)
        expect(suggestions).toMatchJsonSchema('suggestions')

        expect(response.statusCode).toBe(200)
        expect(typeof body).toBe('string')

        done()
      }, requestOptions)
    })
  })
})
