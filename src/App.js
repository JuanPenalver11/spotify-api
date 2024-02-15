import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, FormControl, InputGroup, Button, Row, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const CLIENT_ID = '2a631c8254e14ac99ff4816e573a898a';
const CLIENT_SECRET = '688db1a3196f42ca9dbcd115a86dc442';

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);

  

  useEffect(() => {
    //API Access Token
    let authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }
    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token))
      .catch(error => setError(error)); // Handle error for access token request
  }, []);

  //Search
  async function search() {
    setError(null); // Reset error state before each search
    console.log("search for " + searchInput);

    try {
      //Get request using search to get the Artist ID
      let searchParameters = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      }
      let response = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters);
      if (!response.ok) {
        throw new Error('Failed to fetch artist ID');
      }
      let data = await response.json();
      let artistID = data.artists.items[0].id;

      console.log('This is the artist' + artistID);

      // Get request with Artist ID grab all the albums from that artist
      response = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters);
      if (!response.ok) {
        throw new Error('Failed to fetch albums');
      }
      data = await response.json();
      setAlbums(data.items);


    } catch (error) {
      setError(error.message); // Set error state if any error occurs during search
    }
  }

  const approved = () =>{
    setLike(prev => !prev)
  }

  return (
    <div className="App">
      <Container>
        <InputGroup className='m-3' size='lg'>
          <FormControl
            placeholder='Search For Artist'
            type='input'
            onKeyPress={event => {
              if (event.key === 'Enter') {
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>
            Search
          </Button>
        </InputGroup>
      </Container>
      <Container>
        {error && <div className="error">{error}</div>} {/* Display error message if there's an error */}
        <Row className='mx-2 row row-cols-4 d-flex justify-content-center'>
          {albums.map((album, i) => (
            <Card className='m-1 ' key={i}>
              <Card.Img src={album.images[0].url} className='m-2' />
              <Card.Body>
                <Card.Title>{album.name}</Card.Title>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default App;

