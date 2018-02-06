/* eslint-env jasmine */
const request = require('request')
const ugs = require('../lib/index')
const TYPES_WITH_URL = [
  'guitar pro tabs', 'video lessons', 'power tabs'
]

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000

const tabUrlByType = {
  'Video': 'https://tabs.ultimate-guitar.com/tab/nirvana/smells_like_teen_spirit_video_1418317',
  'Tabs': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver3_tab.htm',
  'Chords': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver2_crd.htm',
  'Bass Tabs': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver3_btab.htm',
  'Pro': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver2_guitar_pro.htm',
  'Power': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_power_tab.htm',
  'Drum Tabs': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_drum_tab.htm',
  'Ukulele Chords': 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ukulele_crd.htm'
}

function basicSearchQuery () {
  return {
    query: 'Muse'
  }
}

function basicAdvanceSearchQuery () {
  return {
    bandName: 'Muse'
  }
}

function autocompleteQuery () {
  return 'Ozzy'
}

function completeSearchQuery () {
  return {
    query: 'Little Black Submarines',
    type: ['video lessons', 'tabs', 'chords', 'bass tabs', 'guitar pro tabs', 'power tabs', 'drum tabs', 'ukulele chords'],
    page: 1
  }
}

function completeAdvanceSearchQuery () {
  return {
    bandName: 'Black Keys',
    songName: 'Little Black Submarines',
    type: ['video lessons', 'tabs', 'chords', 'bass tabs', 'guitar pro tabs', 'power tabs', 'drum tabs', 'ukulele chords'],
    page: 1
  }
}

describe('ultimate-guitar-scraper', () => {
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

  describe('advanceSearch', () => {
    it('searches TABs', (done) => {
      let query = basicAdvanceSearchQuery()
      ugs.advanceSearch(query, (error, tabs) => {
        expect(error).toBeNull()

        expect(tabs.length).toBeGreaterThan(0)
        expect(tabs).toMatchJsonSchema('tabs')

        done()
      })
    })

    it('searches TABs with request options', (done) => {
      let query = completeAdvanceSearchQuery()
      let requestOptions = {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
      }
      ugs.advanceSearch(query, (error, tabs, response, body) => {
        expect(error).toBeNull()

        expect(tabs.length).toBeGreaterThan(0)
        expect(tabs).toMatchJsonSchema('tabs')

        expect(response.statusCode).toBe(200)
        expect(typeof body).toBe('string')

        done()
      }, requestOptions)
    })
  })

  Object.keys(tabUrlByType).forEach((type) => {
    describe('get', () => {
      const tabType = type
      const tabUrl = tabUrlByType[type]

      it('get the TAB', (done) => {
        ugs.get(tabUrl, (error, tab) => {
          expect(error).toBeNull()

          expect(tab).toMatchJsonSchema('tab')
          expect(tab.type).toEqual(tabType)

          // Require property content.url to be available.
          if (TYPES_WITH_URL.includes(tabType)) {
            request(tab.content.url, (error, response, body) => {
              expect(error).toBeNull()
              expect(response.statusCode).toBeGreaterThanOrEqual(200)
              expect(response.statusCode).toBeLessThan(300)
              done()
            })
          } else {
            done()
          }
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
      let query = autocompleteQuery()
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
      let query = autocompleteQuery()
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
