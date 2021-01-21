module.exports = {

	"normal": {

		_meta: {
			"tab": { key: "\t", width: 60, classes: "control tab"},
			"shiftl": { keySet: "shifted", width: 100, classes: "control shift"},
			"shiftr": { keySet: "shifted", width: 100, classes: "control shift"},
			"caps": { keySet: "capsed", width: 80, classes: "control caps"},
			"space": { key: " ", text: " ", width: 180},
			"enter": { key: "\r\n", width: 80, classes: "control enter"},
			"backspace": { func: "backspace", classes: "control backspace", width: 65},
			"accept": { func: "accept", classes: "control featured close"},
			"clear": { func: "next", classes: "control featured clear"}
		},

		default: [
			"` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
			"{tab} q w e r t y u i o p [ ] \\",
			"{caps} a s d f g h j k l ; ' {enter}",
			"{shiftl} z x c v b n m , . / {shiftr}",
			"{clear} {space} {accept}"
		],
		shifted: [
			"~ ! @ # $ % ^ & * ( ) _ + {backspace}",
			"{tab} Q W E R T Y U I O P { } |",
			"{caps} A S D F G H J K L : \" {enter}",
			"{shiftl} Z X C V B N M < > ? {shiftr}",
			"{clear} {space} {accept}"
		],
		
		capsed: [
			"` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
			"{tab} Q W E R T Y U I O P [ ] \\",
			"{caps} A S D F G H J K L ; ' {enter}",
			"{shiftl} Z X C V B N M , . / {shiftr}", 
			"{clear} {space} {accept}"
		]		
	},

	"compact": {

		_meta: {
			"default": { keySet: "default", text: "abc", classes: "control"},
			"alpha": { keySet: "default", text: "Abc", classes: "control"},
			"shift": { keySet: "shifted", text: "ABC", classes: "control"},
			"numbers": { keySet: "numbers", text: "123", classes: "control"},
			"space": { key: " ", width: 200},
			"backspace": { func: "backspace", classes: "control"},
			"accept": { func: "accept", classes: "control featured close"},
			"clear": { func: "next", classes: "control featured clear"},
			"zero": { key: "0", width: 130}
		},

		default: [
			"q w e r t y u i o p",
			" a s d f g h j k l ",
			"{shift} z x c v b n m {backspace}",
			"{numbers} , {space} . {clear} {accept}"
		],

		shifted: [
			"Q W E R T Y U I O P",
			" A S D F G H J K L ",
			"{default} Z X C V B N M ",
			"{numbers} _ {space} {backspace} {clear} {accept}"
		],

		numbers: [
			"1 2 3",
			"4 5 6",
			"7 8 9",
			"  {alpha} . {zero} {backspace} {clear} {accept}"
		]
	},

	"numeric": {

		_meta: {
			"backspace": { func: "backspace", classes: "control"},
			"accept": { func: "accept", classes: "control featured close"},
			"clear": { func: "next", classes: "control featured clear"},
			"zero": { key: "0", width: 130}
		},

		default: [
			"1 2 3",
			"4 5 6",
			"7 8 9",
			"_ - . {zero} {backspace} {clear} {accept}"
		]
	}

};
