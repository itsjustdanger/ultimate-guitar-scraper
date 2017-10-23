/* eslint-env jasmine */
const utils = require('../lib/utils')

describe('utils', () => {
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
