import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init('phc_m67rvmZoPrXkJ5BqqW9svJt3NASSNFedsfJ7hDj7da75', {
    api_host: 'https://eu.posthog.com',
  })
}

export default posthog