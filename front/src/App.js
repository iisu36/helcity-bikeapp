import { gql, useQuery, useMutation } from '@apollo/client'
import papa from 'papaparse'
import { useState } from 'react'

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
  const [file, setFile] = useState(false)
  const [importAction, setImportAction] = useState('import')
  const result = useQuery(ALL_TRIPS)
  //const [addTrips] = useMutation()

  if (result.loading) {
    return <div>loading...</div>
  }

  const handleChange = (event) => {
    if (event.target.files) {
      setFile(event.target.files[0])
      setImportAction('import')
    }
  }

  const handleImport = (event) => {
    event.preventDefault()

    let trips = []

    setImportAction('importing...')

    papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      step: (row) => {
        trips.push(row.data)
      },
      complete: () => {
        console.log(trips.length)
        setImportAction('done')
      },
    })

    console.log('importing')
  }

  return (
    <div className="App">
      <div>
        <h1>Import csv file:</h1>
        <form>
          <input type={'file'} accept={'.csv'} onChange={handleChange} />
          {importAction === 'import' ? (
            <button onClick={handleImport}>import</button>
          ) : (
            ' ' + importAction
          )}
        </form>
      </div>
      <div>
        {/* {result.data.allTrips.map((trip) => {
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
                {trip.departure_station_id}  
                {trip.return_station_id} 
                {new Date(trip.return_time).toLocaleString()} 
                {new Date(trip.departure_time).toLocaleString()}{' '} 
                {trip.departure_station_name} {trip.return_station_name}{' '}
                {distance}km {duration}
              </div>
            )
          })} */}
      </div>
    </div>
  )
}

export default App
