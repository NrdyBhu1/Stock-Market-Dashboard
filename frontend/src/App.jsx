import React from 'react';
import './App.css';
import axios from 'axios';

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      companies: [],
      market_data: {},
    }
  }

  async componentDidMount() {
    const URI = `http://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}/`;
    let cached_data = {}
    // load companies
    let res = await axios.get(URI);
    let companies = res.data.Companies;
    // load data
    companies.map(async c => {
      let company_res = await axios.get(`${URI}${c}`)
      cached_data[c] = company_res.data.data;
    })

    this.setState({ companies: [...companies], market_data: cached_data })
  }

  render() {
    return (<div>
        <h1>Companies</h1>
        <ul>
        {this.state.companies.map((c, i) => (
          <li key={i}>
          {c} - {JSON.stringify(this.state.market_data[0])}
          {console.log(this.state.market_data[c])}
          </li>
        ))}
        </ul>
      </div>)
  }
}

export default App
