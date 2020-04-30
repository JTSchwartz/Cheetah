const isAssignment = token => /([:+\-*/]=)|\+\+|--/.test(token)
const isBool = token => /#(TRUE)|(FALSE)/.test(token)
const isNum = token => /[0-9]+/.test(token)
const isBooleanOperator = token => /([<>]=)|==/.test(token)
const isNumericalOperator = token => /[+\-*/]/.test(token)
const isSpace = token => /[ ]+/.test(token)
const isIdentifier = token => /[_a-zA-Z][_a-zA-Z0-9]*/.test(token)

function lex(input) {
	let characters = input.split("")

	let tokens = []
	let currentToken = ""
	characters.forEach(c => {
		currentToken += c

		if(isSpace(c)) {
			val = determineToken(currentToken)
			if(val) tokens.push(val)
			currentToken = ""
		}
	});

	if(currentToken) tokens.push(determineToken(currentToken))
	console.log(tokens)
}

function determineToken(input) {
	input = input.trim()
	
	if(isAssignment(input)) {
		return {type: "assignment", value: input}
	} else if(isIdentifier(input)) {
		return {type: "identifier", value: input}
	} else if(isNum(input)) {
		return {type: "num", value: input}
	} else {
		return null
	}
}
