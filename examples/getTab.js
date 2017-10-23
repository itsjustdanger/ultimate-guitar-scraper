const ugs = require('../lib/index')

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
  const tabType = type
  const tabUrl = tabUrlByType[type]

  ugs.get(tabUrl, (error, tab) => {
    if (error) {
      console.log(error)
    } else {
      console.log(tabType, tabUrl, tab)
    }
  })
})
