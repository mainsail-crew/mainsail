import { getDefaultState } from './index'
import { colorArray, colorChamber, colorHeaterBed } from "@/store/variables";

export default {
	reset(state) {
		Object.assign(state, getDefaultState)
	},
	
	setHistory(state, payload) {
		let now = new Date();

		if (payload !== undefined) {
			Object.entries(payload).sort().forEach(([key, datasets]) => {
				let keySplit = key.split(" ");

				if (keySplit.length > 1) key = keySplit[1];

				if (datasets.temperatures) {
					let max = datasets.temperatures.length;
					for (let i = 0; i < max; i++) {
						let time = new Date(now.getTime() - 1000 * (max - i));

						this.commit('printer/tempHistory/addValue', {
							name: key,
							value: {
								temperature: datasets.temperatures[i],
								target: datasets.targets[i],
							},
							type: keySplit[0],
							time: time
						});
					}
				}
			});
		}
	},

	addHeater( state, payload) {
		let color = '';

		switch (payload.name) {
			case 'heater_bed': color = colorHeaterBed; break;
			case 'chamber': color = colorChamber; break;
			default: color = colorArray[state.datasets.filter(element => !element.label.endsWith("_target") && element.label !== "heater_bed" && element.label !== "chamber").length]; break;
		}

		let hidden = this.state.gui.dashboard.hiddenTempChart.indexOf(payload.name.toUpperCase()) >= 0 ? true : null;

		state.datasets.push({
			label: payload.name,
			data: [],
			borderColor: color,
			backgroundColor: color,
			pointBackgroundColor: color,
			fill: false,
			borderWidth: 2,
			hidden: hidden,
		});

		if (payload.type !== "temperature_sensor") {
			state.datasets.push({
				label: payload.name+"_target",
				data: [],
				borderColor: color,
				backgroundColor: color+'20',
				pointBackgroundColor: color,
				fill: true,
				borderWidth: 0,
				hidden: hidden,
			});
		}
	},

	addValue(state, payload) {
		// definations for delete old entries
		let timeOld = new Date().getTime() - (1000 * 60 * 10);
		let minResolution = 1000;   // value in ms
		let deletedIndex;

		let index =  state.datasets.findIndex(element => element.label === payload.name);
		if (index < 0) {
			this.commit('printer/tempHistory/addHeater', {
				name: payload.name,
				type: payload.type,
			});
			index =  state.datasets.findIndex(element => element.label === payload.name);
		}
		let index_target =  state.datasets.findIndex(element => element.label === payload.name+'_target');

		// update current temp in temperature chart
		if (index >= 0) {
			let temperature = 0;
			if (payload.value.temperature !== undefined) temperature = payload.value.temperature.toFixed(1);
			else if (state.datasets[index].data.length) temperature = state.datasets[index].data[state.datasets[index].data.length - 1].y;

			if (
				(state.datasets[index].data.length && (
					(
						state.datasets[index].data[state.datasets[index].data.length - 1].y !== temperature ||
						payload.time-state.datasets[index].data[state.datasets[index].data.length - 1].x > minResolution
					) && state.datasets[index].data[state.datasets[index].data.length - 1].x < payload.time
				)) || state.datasets[index].data.length === 0
			) {
				state.datasets[index].data.push({
					x: payload.time,
					y: temperature
				});
			}

			// delete old entries
			while ((deletedIndex = state.datasets[index].data.findIndex(item => item.x < timeOld)) > -1) {
				state.datasets[index].data.splice(deletedIndex, 1);
			}
		}

		// update target temp in temperature chart
		if (index_target >= 0) {
			let target = 0;
			if (payload.value.target !== undefined) target = payload.value.target.toFixed(1);
			else if (state.datasets[index_target].data.length) target = state.datasets[index_target].data[state.datasets[index_target].data.length - 1].y;

			if (
				(state.datasets[index_target].data.length && (
					(
						state.datasets[index_target].data[state.datasets[index_target].data.length - 1].y !== target ||
						payload.time-state.datasets[index_target].data[state.datasets[index_target].data.length - 1].x > minResolution
					) && state.datasets[index_target].data[state.datasets[index_target].data.length - 1].x < payload.time
				)) || state.datasets[index_target].data.length === 0
			) {
				state.datasets[index_target].data.push({
					x: payload.time,
					y: target
				});
			}

			// delete old entries
			while ((deletedIndex = state.datasets[index_target].data.findIndex(item => item.x < timeOld)) > -1) {
				state.datasets[index_target].data.splice(deletedIndex, 1);
			}
		}
	},
}