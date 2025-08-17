import React from "react"
import "./App.css"
import axios from "axios"
import { Line } from "react-chartjs-2"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js"

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
)

function TabPanel(props) {
	const { children, value, index, ...other } = props

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`vertical-tabpanel-${index}`}
			aria-labelledby={`vertical-tab-${index}`}
			{...other}>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	)
}

class App extends React.Component {
	constructor() {
		super()
		this.state = {
			companies: [],
			market_data: {},
			value: 0,
		}
	}

	handleChange = (event, newValue) => {
		this.setState({ value: newValue })
	}

	async componentDidMount() {
		const URI = import.meta.env.VITE_BACKEND_URI
		console.log(URI)
		let cached_data = {}
		// load companies
		let res = await axios.get(URI)
		let companies = res.data.Companies
		// load data
		for (const c of companies) {
			let company_res = await axios.get(`${URI}/company/${c}`)
			cached_data[c] = company_res.data.data
		}

		this.setState({ companies: companies, market_data: cached_data })
	}

	render() {
		const { market_data, value, companies } = this.state

		if (!market_data["MSFT"]) {
			return <div> Loading...</div>
		}

		return (
			<div>
				<h1>Stock Market Dashboard</h1>
				<Box
					sx={{
						flexGrow: 1,
						bgcolor: "background.paper",
						display: "flex",
						height: 600,
					}}>
					<Tabs
						orientation="vertical"
						variant="scrollable"
						value={value}
						onChange={this.handleChange}
						aria-label="Vertical tabs"
						sx={{
							borderRight: 1,
							borderColor: "divider",
							minWidth: 150,
						}}>
						{
							companies.map(c => (
								<Tab key={`tab-${c}`} label={c} />
							))
						}
					</Tabs>

					{
						companies.map((c, i) => (
							<TabPanel key={`tabpanel-${c}`} value={value} index={i}>
								<Line width={900} height={450} data={{ labels: market_data[c].map((row) => row.mdate).reverse(), datasets: [{ label: c, data: market_data[c].map((row) => row.close), borderColor: "#2196f3", borderWidth: 2 }] }} />
							</TabPanel>
						))
					}
				</Box>
			</div>
		)
	}
}

export default App
