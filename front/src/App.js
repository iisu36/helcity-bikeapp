import { gql, useQuery } from '@apollo/client'

const ALL_TRIPS = gql`
  query {
    allTrips {
      departure_time
      return_time
      departure_station_id
      departure_station_name
      return_station_id
      return_station_name
      distance_m
      duration_s
      id
    }
  }
`

const App = () => {
  const result = useQuery(ALL_TRIPS)

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div className="App">
      <div>
        <h1>Import csv file:</h1>
        <form>
          <input type={'file'} accept={'.csv'} />
          <button>import</button>
        </form>
      </div>
      <div>
        {result.data.allTrips.map((trip) => {
          const distance = (trip.distance_m / 1000).toFixed(2)
          const date = new Date(null)
          date.setSeconds(trip.duration_s)
          const duration = date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds()
          return (
            <div key={trip.id}>
              {/* {trip.departure_station_id}  */}
              {/* {trip.return_station_id} */}
              {/* {new Date(trip.return_time).toLocaleString()} */}
              {/* {new Date(trip.departure_time).toLocaleString()}{' '} */}
              {trip.departure_station_name} {trip.return_station_name}{' '}
              {distance}km {duration}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
