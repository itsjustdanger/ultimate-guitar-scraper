/* eslint-env jasmine */
const utils = require('../lib/utils')

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
      let query = { query: 'Ozzy' }
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
      let query = {
        bandName: 'Muse'
      }

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
      let query = {
        bandName: 'Black Keys',
        songName: 'Little Black Submarines',
        type: ['video lessons', 'tabs', 'chords', 'bass tabs', 'guitar pro tabs', 'power tabs', 'drum tabs', 'ukulele chords'],
        page: 1
      }

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
