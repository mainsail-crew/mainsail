export default {

	getTotalPrintTime(state) {
		let output = 0

		state.jobs.forEach(current => {
			output += current.print_duration
		})

		return output
	},

	getTotalCompletedPrintTime(state) {
		let output = 0

		state.jobs.forEach(current => {
			if (current.status === "completed") output += current.print_duration
		})

		return output
	},

	getLongestPrintTime(state) {
		let output = 0

		state.jobs.forEach(current => {
			if (current.print_duration > output) output = current.print_duration
		})

		return output
	},

	getTotalFilamentUsed(state) {
		let output = 0

		state.jobs.forEach(current => {
			output += current.filament_used
		})

		return output
	},

	getTotalJobsCount(state) {
		return state.jobs.length
	},

	getTotalCompletedJobsCount(state) {
		return state.jobs.filter(job => job.status === "completed").length
	},

	getAvgPrintTime(state, getters) {
		const totalCompletedPrintTime = getters.getTotalCompletedPrintTime
		const totalCompletedJobsCount = getters.getTotalCompletedJobsCount

		return totalCompletedPrintTime > 0 && totalCompletedJobsCount > 0 ? Math.round(totalCompletedPrintTime / totalCompletedJobsCount) : 0
	},

	getAllPrintStatusArray(state) {
		let output = []

		state.jobs.forEach(current => {
			const index = output.findIndex(element => element.name === current.status)
			if (index !== -1) output[index].value +=1
			else {
				let itemStyle = {
					opacity: 0.9,
					color: '#424242'
				}

				switch (current.status) {
					case 'completed':
						itemStyle['color'] = '#BDBDBD'
						break

					case 'in_progress':
						itemStyle['color'] = '#EEEEEE'
						break

					case 'cancelled':
						itemStyle['color'] = '#616161'
						break

					case 'klippy_shutodwn':
						itemStyle['color'] = '#757575'
						break

					case 'klippy_disconnect':
						itemStyle['color'] = '#888888'
						break
				}

				output.push({
					name: current.status,
					value: 1,
					itemStyle: itemStyle,
					label: {
						color: '#fff'
					}
				})
			}
		})

		return output
	},

	getFilamentUsageArray(state) {
		let output = []
		const startDate = new Date()
		startDate.setDate(startDate.getDate() - 14)
		startDate.setHours(0,0,0,0)
		const jobsFiltered = state.jobs.filter(job => job.start_time * 1000 >= startDate && job.filament_used > 0)

		for (let i = 0; i <= 14; i++) {
			const tmpDate = new Date()
			tmpDate.setDate(startDate.getDate() + i)

			output.push([
				new Date(tmpDate).setHours(0,0,0,0),
				0
			])
		}

		if (jobsFiltered.length) {
			jobsFiltered.forEach(current => {
				const currentStartDate = new Date(current.start_time * 1000).setHours(0,0,0,0)
				const index = output.findIndex(element => element[0] === currentStartDate)
				if (index !== -1) output[index][1] += Math.round(current.filament_used) / 1000
			})
		}

		return output.sort((a,b) => {
			return b[0] - a[0]
		})
	},

	getPrinttimeAvgArray(state) {
		let output = [0,0,0,0,0]
		const startDate = new Date(new Date().getDate() - 14)
		const jobsFiltered = state.jobs.filter(job => job.start_time * 1000 >= startDate && job.status === 'completed')

		if (jobsFiltered.length) {
			jobsFiltered.forEach(current => {
				if 		(current.print_duration > 0 		&& current.print_duration <= 60*60*2) 	output[0]++
				else if (current.print_duration > 60*60*2 	&& current.print_duration <= 60*60*6) 	output[1]++
				else if (current.print_duration > 60*60*6 	&& current.print_duration <= 60*60*12) 	output[2]++
				else if (current.print_duration > 60*60*12 	&& current.print_duration <= 60*60*24) 	output[3]++
				else if (current.print_duration > 60*60*24) 										output[4]++
			})
		}

		return output
	},

	getPrintStatus: (state) => (file) => {
		if (state.jobs.length) {
			const jobs = state.jobs.filter(job =>
				'filename' in job &&
				job.filename === file.filename &&
				'status' in job &&
				'metadata' in job &&
				'modified' in job.metadata &&
				parseInt(job.metadata.modified * 1000) === file.modified
			)

			if (jobs.length > 1) {
				jobs.sort((a,b) => {
					return b.start_time - a.start_time
				})

				return jobs[0].status
			} else if (jobs.length === 1) {
				return jobs[0].status
			}
		}

		return ""
	},

	getPrintStatusChipColor: () => (status) => {
		switch(status) {
			case 'in_progress': return 'blue accent-3' //'blue-grey darken-1'
			case 'completed': return 'green' //'green'
			case 'cancelled': return 'red'

			default: return 'orange'
		}
	},

	getPrintStatusChipIcon: () => (status) => {
		switch(status) {
			case 'in_progress': return 'mdi-progress-clock'
			case 'completed': return 'mdi-checkbox-marked-circle-outline'
			case 'cancelled': return 'mdi-close-circle-outline'

			default: return 'mdi-alert-outline'
		}
	}
}