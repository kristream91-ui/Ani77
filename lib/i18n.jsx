/** Tiny i18n layer — English (default) and Hindi. Add a key in both and it just works. */
import { useApp } from './store.jsx'

export const UI_LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' }
]

const dict = {
  en: {
    home: 'Home', browse: 'Browse', search: 'Search', myList: 'My List', profile: 'Profile',
    // editorial section names, in the spirit of Moctale
    mostInterested: 'Most Interested',
    thisWeek: 'This Week',
    interested: 'Interested',
    talkOfTown: 'Talk of the Town',
    editorsPick: "Editor's Pick",
    worthHindi: 'Worth watching in Hindi',
    newSeason: 'New this season',
    topRated: 'Top rated',
    movies: 'Movies',
    forYou: 'For you',
    continueWatching: 'Continue watching',
    // actions
    addToList: 'Add to list', inList: 'In your list', watchNow: 'Watch now', moreInfo: 'More info',
    episodes: 'Episodes', genre: 'Genre', language: 'Language', all: 'All', sort: 'Sort',
    signIn: 'Sign in', settings: 'Settings', noResults: 'Nothing matched that',
    seeAll: 'See all', rating: 'Rating', trending: 'Trending now', newest: 'New this season',
    hindiDub: 'Popular with Hindi dub', upcoming: 'Coming up',
    // verdicts
    yourVerdict: 'Your verdict', communityVerdict: 'How people voted',
    v_skip: 'Skip', v_timepass: 'Timepass', v_goforit: 'Go for it', v_perfection: 'Perfection',
    v_hint: 'Four words beat a meaningless 7.4/10.',
    // statuses
    watching: 'Watching', planned: 'Plan to watch', completed: 'Completed',
    onhold: 'On hold', dropped: 'Dropped', synopsis: 'Synopsis', studio: 'Studio',
    empty: 'Your list is empty', emptyHint: 'Tap the bookmark on any poster to start.'
  },
  hi: {
    home: 'होम', browse: 'ब्राउज़', search: 'खोजें', myList: 'मेरी सूची', profile: 'प्रोफ़ाइल',
    mostInterested: 'सबसे लोकप्रिय',
    thisWeek: 'इस हफ्ते',
    interested: 'लोग इच्छुक',
    talkOfTown: 'चर्चा में',
    editorsPick: 'एडिटर की पसंद',
    worthHindi: 'हिंदी में देखने लायक',
    newSeason: 'इस सीज़न नया',
    topRated: 'टॉप रेटेड',
    movies: 'फ़िल्में',
    forYou: 'आपके लिए',
    continueWatching: 'देखना जारी रखें',
    addToList: 'सूची में जोड़ें', inList: 'सूची में है', watchNow: 'अभी देखें', moreInfo: 'और जानें',
    episodes: 'एपिसोड', genre: 'शैली', language: 'भाषा', all: 'सभी', sort: 'क्रम',
    signIn: 'साइन इन', settings: 'सेटिंग्स', noResults: 'कुछ नहीं मिला',
    seeAll: 'सभी देखें', rating: 'रेटिंग', trending: 'अभी ट्रेंडिंग', newest: 'इस सीज़न नया',
    hindiDub: 'हिंदी डब में लोकप्रिय', upcoming: 'आगे',
    yourVerdict: 'आपका फ़ैसला', communityVerdict: 'लोगों का फ़ैसला',
    v_skip: 'छोड़ दें', v_timepass: 'टाइमपास', v_goforit: 'ज़रूर देखें', v_perfection: 'बेजोड़',
    v_hint: 'एक बेमतलब 7.4/10 से चार शब्द बेहतर हैं।',
    watching: 'देख रहे हैं', planned: 'देखना है', completed: 'पूरा हुआ',
    onhold: 'रोका गया', dropped: 'छोड़ दिया', synopsis: 'कहानी', studio: 'स्टूडियो',
    empty: 'आपकी सूची खाली है', emptyHint: 'शुरू करने के लिए किसी पोस्टर पर बुकमार्क दबाएँ।'
  }
}

export function useT() {
  const { prefs } = useApp()
  const table = dict[prefs.ui] || dict.en
  return (k) => table[k] || dict.en[k] || k
}
