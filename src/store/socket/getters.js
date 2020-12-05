export default {

	getUrl: state => {
		return "//" + state.hostname + (state.port === 80 ? ":"+state.port : "")
	}
}