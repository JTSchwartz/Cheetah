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

	let tokens = []
	let currentToken = ""
	for (let index = 0; index < characters.length; index++) {
		currentToken += characters[index]
		console.log(currentToken)
		console.log(isIdentifier(currentToken))

		// fix if there are no spaces in between identifier and token

		if(currentToken == "+") {
			if((index + 1) != characters.length && characters[index + 1] == "="){
				tokens.push("PLUSEQUAL")
				currentToken = ""
			} else {
				tokens.push("PLUS")
				currentToken = ""
			}
		} else if(currentToken == ":=") {
			tokens.push("EQUAL")
			currentToken = ""
		}else if(currentToken == "(") {
			tokens.push("LPAREN")
			currentToken = ""
		} else if(currentToken == "{") {
			tokens.push("LBRACE")
			currentToken = ""
		} else if(characters[index] == " " || (index + 1) == characters.length) {
			if(isIdentifier(currentToken)) {
				tokens.push("IDENTIFIER:" + currentToken.trim())
				currentToken = ""
			} else if(isNumber(currentToken)) {
				// TODO determine type of number here
				tokens.push("NUMBER:" + currentToken.trim())
				currentToken = ""
			} else {
				currentToken = ""
			}
		}


		
	}
	console.log(tokens)
}