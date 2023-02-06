import ReactDOM from 'react-dom/client'
import App from './App'

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        moreTrips: {
          keyArgs: false,
          merge(existing, incoming, { readField }) {
            const trips = existing ? { ...existing.trips } : {}
            incoming.trips.forEach((trip) => {
              trips[readField('id', trip)] = trip
            })
            return {
              cursor: incoming.cursor,
              trips,
            }
          },

          read(existing) {
            if (existing) {
              return {
                cursor: existing.cursor,
                trips: Object.values(existing.trips),
              }
            }
          },
        },
      },
    },
  },
})

const client = new ApolloClient({
  cache: cache,
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ApolloProvider client={client}>
    <App client={client}/>
  </ApolloProvider>
)
