require('dotenv').config()
const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Trip = require('./models/trip')

const MONGODB_LOCAL="mongodb://127.0.0.1:27017/helcity"
// process.env.MONGODB_URI found in .env for remote database

mongoose
  .connect(MONGODB_LOCAL) // process.env.MONGODB_URI
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB', error.message)
  })

const typeDefs = gql`
  input InputTrip {
    departure_time: String!
    return_time: String!
    departure_station_id: String!
    departure_station_name: String!
    return_station_id: String!
    return_station_name: String!
    distance_m: String!
    duration_s: String!
  }

  type Trip {
    departure_time: String!
    return_time: String!
    departure_station_id: String!
    departure_station_name: String!
    return_station_id: String!
    return_station_name: String!
    distance_m: String!
    duration_s: String!
    id: ID!
  }

  type FeedTrips {
    trips: [Trip!]
    cursor: Cursor
  }

  type Cursor {
    next: String
    sort: [String]
    filter: [String]
  }

  input InputCursor {
    next: String
    sort: [String]
    filter: [String]
  }

  type Query {
    moreTrips(cursor: InputCursor, limit: Int): FeedTrips
  }

  type Mutation {
    addTrips(trips: [InputTrip!]!): [Trip]
  }
`

const resolvers = {
  Query: {
    moreTrips: async (root, args) => {
      let cursor = args.cursor
      const limit = args.limit || 50
      let trips
      if (cursor) {
        trips = await Trip.find({ _id: { $lt: cursor.next } })
          .sort({ _id: -1 })
          .limit(limit)
          .exec()
      } else {
        cursor = {}
        trips = await Trip.find({}).sort({ _id: -1 }).limit(limit).exec()
      }

      const next = trips[trips.length - 1]._id.toString()
      cursor.next = next

      return { trips, cursor }
    },
  },
  Mutation: {
    addTrips: async (root, args) => {
      try {
        await Trip.insertMany(args.trips)
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
