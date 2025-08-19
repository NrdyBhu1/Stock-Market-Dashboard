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
			actual_data: {},
			market_data: {},
			value: 0,
			data_range: 10,
			range: 0,
		}

		this.api = axios.create({
			baseURL: import.meta.env.VITE_BACKEND_URI,
			headers: {
				access_token: import.meta.env.VITE_API_KEY,
			},
			withCredentials: false,
		})
	}

	handleChange = (event, newValue) => {
		this.setState({ value: newValue })
	}

	handleRange = (event, newValue) => {
		const ranges = [10, 30, 90, 180, 360, 720]
		console.log(newValue)
		const data_newrange = ranges[newValue]
		console.log(data_newrange)

		this.setState({ range: newValue, data_range: data_newrange }, () =>
			this.changeActualData()
		)
	}

	changeActualData() {
		const { data_range, companies, market_data } = this.state

		if (!companies.length || !Object.keys(market_data).length) return

		let actual_data = {}

		for (const c of companies) {
			actual_data[c] = Array.from(market_data[c]).slice(0, data_range)
		}

		this.setState({ actual_data: actual_data })
	}

	async componentDidMount() {
		let res = await this.api.get("/")
		let companies = res.data.Companies

		let cached_data = {}
		for (const c of companies) {
			let company_res = await this.api.get(`/company/${c}?records=max`)
			cached_data[c] = company_res.data.data
		}

		this.setState({ companies: companies, market_data: cached_data }, () =>
			this.changeActualData()
		)
	}

	render() {
		const { market_data, actual_data, value, companies, range } = this.state

		if (
			!companies.length ||
			!Object.keys(market_data).length ||
			!Object.keys(actual_data).length
		) {
			return <div>Loading...</div>
		}

		// { open, high, low, close, volume }
		Object.keys(actual_data).map((cname) => {
			actual_data[cname] = actual_data[cname].reverse()
		})

		return (
			<div>
				<h1>Stock Market Dashboard</h1>
				<Box>
					<Tabs
						variant="scrollable"
						value={range}
						onChange={this.handleRange}
						aria-label="Horizontal tabs"
						sx={{
							borderBottom: 2,
							borderColor: "divider",
						}}>
						<Tab key="10D" label="10D" />
						<Tab key="1M" label="1M" />
						<Tab key="3M" label="3M" />
						<Tab key="6M" label="6M" />
						<Tab key="1Y" label="1Y" />
						<Tab key="2Y" label="2Y" />
					</Tabs>
				</Box>
				<Box
					sx={{
						flexGrow: 1,
						bgcolor: "background.paper",
						display: "flex",
						height: 550,
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
						{companies.map((c) => (
							<Tab key={`tab-${c}`} label={c} />
						))}
					</Tabs>

					{companies.map((c, i) => (
						<TabPanel key={`tabpanel-${c}`} value={value} index={i}>
							<Line
								width={900}
								height={450}
								data={{
									labels: actual_data[c].map(
										(row) => row.mdate
									),
									datasets: [
										{
											label: "Close",
											data: actual_data[c].map(
												(row) => row.close
											),
											borderColor: "#2196f3",
											borderWidth: 2,
											pointRadius: 0,
											pointHoverRadius: 4,
										},
										{
											label: "Open",
											data: actual_data[c].map(
												(row) => row.open
											),
											borderColor: "#c6ff00",
											borderWidth: 2,
											pointRadius: 0,
											pointHoverRadius: 4,
										},
										{
											label: "High",
											data: actual_data[c].map(
												(row) => row.high
											),
											borderColor: "#00e676",
											borderWidth: 2,
											pointRadius: 0,
											pointHoverRadius: 4,
										},
										{
											label: "Low",
											data: actual_data[c].map(
												(row) => row.low
											),
											borderColor: "#f50057",
											borderWidth: 2,
											pointRadius: 0,
											pointHoverRadius: 4,
										},
									],
								}}
							/>
						</TabPanel>
					))}
				</Box>
			</div>
		)
	}
}

export default App
