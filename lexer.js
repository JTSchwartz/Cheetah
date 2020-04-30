const isAssignment = token => /([:+\-*/]=)|\+\+|--/.test(token)
const isBool = token => /#(TRUE)|(FALSE)/.test(token)
const isBooleanOperator = token => /([<>]=)|==/.test(token)
const isNumericalOperator = token => /[+\-*/]/.test(token)

const isSpace = token => /[ ]+/.test(token)
const isIdentifier = token => /[_a-zA-Z][_a-zA-Z0-9]*/.test(token)
const isNumber = token => /[0-9]+/.test(token)

function lex(input) {
	let characters = input.split("")
	console.log(characters)
}

// i have to fix this
// this wont produce right output
// it also doesnt know the difference between + and +=

/*
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

	if(isIdentifier(input)) {
		return {type: "identifier", value: input}
	} else if(isNumber(input)) {
		return {type: "number", value: input}
	} else {
		return {type: "lexeme", value: input}
	}
}
*/
