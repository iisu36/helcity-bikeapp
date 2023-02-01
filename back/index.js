require('dotenv')
const { ApolloServer, gql } = require('apollo-server')
const { GraphQLScalarType } = require('graphql')
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

/* let trips = [
  {
    id: 1,
    departure_time: new Date('2021-05-31T23:57:25'),
    return_time: new Date('2021-06-01T00:05:46'),
    departure_station_id: '094',
    departure_station_name: 'Laajalahden aukio',
    return_station_id: '100',
    return_station_name: 'Teljäntie',
    distance_m: 2043,
    duration_s: 500,
  },

  {
    id: 12,
    departure_time: new Date('2021-05-31T23:56:59'),
    return_time: new Date('2021-06-01T00:07:14'),
    departure_station_id: '082',
    departure_station_name: 'Töölöntulli',
    return_station_id: '113',
    return_station_name: 'Pasilan asema',
    distance_m: 1870,
    duration_s: 611,
  },

  {
    id: 13,
    departure_time: new Date('2021-05-31T23:56:44'),
    return_time: new Date('2021-06-01T00:03:26'),
    departure_station_id: '123',
    departure_station_name: 'Näkinsilta',
    return_station_id: '121',
    return_station_name: 'Vilhonvuorenkatu',
    distance_m: 1025,
    duration_s: 399,
  },

  {
    id: 14,
    departure_time: new Date('2021-05-31T23:56:23'),
    return_time: new Date('2021-06-01T00:29:58'),
    departure_station_id: '004',
    departure_station_name: 'Viiskulma',
    return_station_id: '065',
    return_station_name: 'Hernesaarenranta',
    distance_m: 4318,
    duration_s: 2009,
  },

  {
    id: 15,
    departure_time: new Date('2021-05-31T23:56:11'),
    return_time: new Date('2021-06-01T00:02:02'),
    departure_station_id: '004',
    departure_station_name: 'Viiskulma',
    return_station_id: '065',
    return_station_name: 'Hernesaarenranta',
    distance_m: 1400,
    duration_s: 350,
  },
] */

const typeDefs = gql`
  scalar Date

  type Trip {
    departure_time: Date!
    return_time: Date!
    departure_station_id: String!
    departure_station_name: String!
    return_station_id: String!
    return_station_name: String!
    distance_m: Int!
    duration_s: Int!
    id: ID!
  }

  type Query {
    allTrips: [Trip!]!
  }

  type Mutation {
    addTrips(
      trips: [Trip!]!
    ): [Trip]
  }
`

const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    parseValue(value) {
      return new Date(value)
    },
    serialize(value) {
      return value.toISOString()
    },
  }),
  Query: {
    allTrips: async () => await Trip.find({}),
  },
  Mutation: {
    addTrips: async (root, args) => {
      let trips
      try {
        trips = await Trip.insertMany(args.trips)
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return trips
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
