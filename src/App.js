import React, { useState, useEffect } from 'react';
import { JsonViewer } from '@textea/json-viewer';
const options = [
  'GET', "POST", "PUT", "DELETE"
];
function App() {
  const [url, setUrl] = useState("");
  const [url_error, setUrlInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState("GET");
  const [end_points, setEndpoint] = useState([]);
  const [data, setData] = useState("");
  const [invalid_data, setInvalidData] = useState(false);
  const [active_data, setActiveData] = useState(null);
  const [status_code, setStatusCode] = useState(null);

  const [responseData, setResponseData] = useState(null);


  const validURL = (str) => {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
  }

  const addEndPoint = async () => {
    try {
      if (validURL(url)) {
        const index = end_points.findIndex((point)=>{
          return point['url'] === url & point['option'] === option;
        });
        if(index !== -1){
          setActiveData(end_points[index]);
          return;
        }
        const inputData = { url: url, data: (option === "POST" || option === "PUT") ? JSON.parse(data) : {}, option: option };
        setEndpoint([inputData, ...end_points]);
        setActiveData(inputData);
        setUrlInvalid(false);
      } else {
        setUrlInvalid(true);
      }
    }
    catch (e) {
      setInvalidData(true);
    }
  }

  const bgColor = () => {
    if (status_code) {
      if (status_code < 300)
        return "green";
      else if (status_code < 400)
        return "yellow";
      else return "red";
    }
  }

  useEffect(() => {
    if (end_points.length > 0)
      localStorage.setItem('end_points', JSON.stringify(end_points));
  }, [end_points]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('end_points'));
    if (items) {
      setEndpoint(items);
    }
  }, []);

  useEffect(() => {
    if (active_data) {
      setUrl(active_data['url']);
      setOption(active_data['option']);
      setData(JSON.stringify(active_data['data']));
      const network_option = active_data['option'] === "PUT" || active_data['option'] === "POST" ? {
        method: active_data['option'],
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(active_data['data'])
      } : {
        method: active_data['option'],
        headers: { 'Content-Type': 'application/json' }
      };
      setResponseData(null);
      setStatusCode(null);
      setLoading(true);
      setUrlInvalid(false);
      setInvalidData(false);
      fetch(active_data['url'], network_option).then((response) => {
        setStatusCode(response.status);
        if (response.ok) {
          return response.json();
        }
        throw new Error('Something went wrong');
      })
        .then((responseJson) => {
          setLoading(false)
          setResponseData(responseJson);
          setActiveData(null);
        })
        .catch((error) => {
          // console.log(error)
          setLoading(false)
        });

    }

  }, [active_data]);

  


  return (

    <div className="container-fluid" style={{ paddingTop: '20px' }}>
      <div className='row'>
        <div className='col-sm-4'>
          <h1>End Points</h1>
          <div>
            <ul className="list-group">
              {
                end_points.filter((end, key) => {
                  return key < 5;
                }).map((end, key) => {
                  return (
                    <li style={{ cursor: 'pointer' }} onClick={(e) => {
                      e.preventDefault();
                      setActiveData(end);
                    }} key={key} className="list-group-item d-flex justify-content-between align-items-center">
                      {end['url']}
                      <span className="badge bg-primary rounded-pill">  {end['option']}</span>
                    </li>
                  )
                })
              }
            </ul>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h2>New End Point</h2>
            <div className='mb-3'>
              {/* <label className='form-label'>URl</label> */}
              <input onChange={(e) => {
                setUrl(e.target.value);
              }} placeholder='URL' type='text'
                className={url_error ? `form-control is-invalid` : `form-control`}
                value={url} />
              {
                url_error && <div className="invalid-feedback">
                  Invalid URL
                </div>
              }

            </div>
            <div className='mb-3'>
              <label className='form-label'>Select Option</label>
              <select value={option} className='form-select' onChange={(e) => {
                setOption(e.target.value);
              }}>
                {
                  options.map((op, key) => {
                    return <option key={key} value={op}>{op}</option>
                  })
                }

              </select>
            </div>

            {
              (option === "POST" || option === "PUT") && <div className='mb-4'>
                <label className='form-label'>Data</label>
                <textarea onChange={(e) => {
                  setData(e.target.value);
                }} className={invalid_data ? `form-control is-invalid` : `form-control`} value={data}></textarea>
                {
                invalid_data && <div className="invalid-feedback">
                  Invalid JSON
                </div>
              }
              </div>
            }
            <button onClick={() => {
              addEndPoint();
            }} className={`w-100 btn btn-success`} type="button">
              {
                loading ? <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div> : "Save"
              }
            </button>
          </div>
        </div>

        <div className='col-sm-8'>
          <div className='row'>
            <div className='col-sm-8'>
              <h1>Response </h1>
            </div>
            <div className='col-sm-4'>
              {
                status_code && <h3 style={{ fontSize: '18px', backgroundColor: bgColor(), padding: 15, textAlign: 'center', color: '#fff' }}>Status Code {status_code}</h3>
              }
            </div>
          </div>
          <div className='row'>
            {
              responseData && <JsonViewer value={responseData} />
            }
          </div>
        </div>
      </div>
    </div>

  );
}

export default App;