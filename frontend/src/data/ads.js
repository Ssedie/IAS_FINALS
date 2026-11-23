// Simulated ads. An ad with a `url` opens that site in a new tab when its button is clicked.
// An ad without a `url` just shows a "simulated ad" toast, so you can mix in fictional ones.
// Keep copy generic: don't invent prices or promos for a real brand.
export const ADS = [
  {
    id: 'shopee-1',
    sponsor: 'Shopee',
    headline: 'Shop on Shopee',
    text: 'Fashion, gadgets and home finds, delivered to your door.',
    cta: 'Visit Shopee',
    url: 'https://shopee.ph',
    color: '#c2371b',
  },
  {
    id: 'lazada-1',
    sponsor: 'Lazada',
    headline: 'Shop on Lazada',
    text: 'Electronics, groceries, beauty and more in one place.',
    cta: 'Visit Lazada',
    url: 'https://www.lazada.com.ph',
    color: '#1b1f8a',
  },
  {
    id: 'shopee-2',
    sponsor: 'Shopee',
    headline: 'Find something new today',
    text: 'Search products from sellers across the Philippines.',
    cta: 'Browse Shopee',
    url: 'https://shopee.ph',
    color: '#9a3412',
  },
  {
    id: 'lazada-2',
    sponsor: 'Lazada',
    headline: 'Compare and shop',
    text: 'Browse products from sellers and official brand stores.',
    cta: 'Browse Lazada',
    url: 'https://www.lazada.com.ph',
    color: '#312e81',
  },
];

// For the "not every ad is what it looks like" demo. This does NOT impersonate any real
// brand or company — it's a generic too-good-to-be-true prize banner, the classic phishing
// shape. The link is Google's own public test page that exists specifically so developers
// can safely trigger the "Deceptive site ahead" / Safe Browsing warning in the classroom
// and in automated tests. It carries no real payload.
// Docs: https://testsafebrowsing.appspot.com/
export const PHISHING_DEMO_AD = {
  id: 'phishing-demo',
  sponsor: 'RewardHub',
  headline: 'You have won a prize!',
  text: 'Congratulations! Tap to claim your reward before it expires.',
  cta: 'Claim now',
  url: 'https://testsafebrowsing.appspot.com/s/phishing.html',
  color: '#b45309',
};
