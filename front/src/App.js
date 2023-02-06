import { gql, useQuery, useMutation } from '@apollo/client'
import papa from 'papaparse'
import { useState } from 'react'

import { cluster, parallel } from 'radash'

import { InView } from 'react-intersection-observer'

const MORE_TRIPS = gql`
  query moreTrips($cursor: InputCursor, $limit: Int) {
    moreTrips(cursor: $cursor, limit: $limit) {
      trips {
        distance_m
        departure_station_name
        duration_s
        return_station_name
        id
      }
      cursor {
        next
      }
    }
  }
`

const ADD_TRIPS = gql`
  mutation addTrips($trips: [InputTrip!]!) {
    addTrips(trips: $trips) {
      id
    }
  }
`

const App = ({ client }) => {
  const [file, setFile] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const result = useQuery(MORE_TRIPS)
  const [addTrips] = useMutation(ADD_TRIPS)

  if (result.loading) {
    return <div>loading...</div>
  }

  const handleChange = (event) => {
    if (event.target.files) {
      setFile(event.target.files[0])
      setImportStatus('')
    }
  }

  const handleImport = (event) => {
    event.preventDefault()

    let tripArray = []
    let chunks = []
    let promises = []
    const headers = [
      'departure_time',
      'return_time',
      'departure_station_id',
      'departure_station_name',
      'return_station_id',
      'return_station_name',
      'distance_m',
      'duration_s',
    ]

    setImportStatus('importing...')

    papa.parse(file, {
      header: true,
      transformHeader: (header, index) => {
        return headers[index]
      },
      skipEmptyLines: true,
      step: (row) => {
        if (row.data.distance_m > 9 && row.data.duration_s > 9) {
          tripArray.push(row.data)
        }
      },
      complete: async () => {
        setImportStatus(
          'importing... this will take about ' +
            (tripArray.length / 4525 / 60).toFixed(0) +
            ' minutes'
        )
        chunks = cluster(tripArray, 1000)

        chunks.forEach((trips) => {
          promises.push(() => addTrips({ variables: { trips } }))
        })

        await parallel(16, promises, async (promise) => await promise())
        await client.refetchQueries({
          include: [MORE_TRIPS]
        })
        setImportStatus('done')
      },
    })
  }

  return (
    <div className="App">
      <div>
        <h1>Import csv file:</h1>
        <form>
          <input type={'file'} accept={'.csv'} onChange={handleChange} />
          {file && !importStatus ? (
            <button onClick={handleImport}>import</button>
          ) : (
            ' ' + importStatus
          )}
        </form>
      </div>
      <div>
        {result.data &&
          result.data.moreTrips.trips.map((trip) => {
            const distance = (trip.distance_m / 1000).toFixed(2)
            const date = new Date(null)
            date.setSeconds(trip.duration_s)
            const duration =
              date.getUTCHours() +
              ':' +
              date.getUTCMinutes() +
              ':' +
              date.getUTCSeconds()
            return (
              <div key={trip.id}>
                {/* {trip.departure_station_id}
              {trip.return_station_id}
              {new Date(trip.return_time).toLocaleString()}
              {new Date(trip.departure_time).toLocaleString()}{' '} */}
                {trip.departure_station_name} {trip.return_station_name}{' '}
                {distance}km {duration}
              </div>
            )
          })}
        {result.data && (
          <InView
            onChange={async (inView) => {
              if (inView) {
                await result.fetchMore({
                  variables: {
                    cursor: { next: result.data.moreTrips.cursor.next },
                  },
                })
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
