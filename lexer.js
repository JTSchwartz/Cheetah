const isAssignment = token => /([:+\-*/]=)|\+\+|--/.test(token)
const isBool = token => /(TRUE)|(FALSE)/.test(token)
const isBooleanOperator = token => /([<>]=)|==/.test(token)
const isNumericalOperator = token => /[+\-*/]/.test(token)

const isSpace = token => /[ ]+/.test(token)
const isIdentifier = token => /[_a-zA-Z][_a-zA-Z0-9]*/.test(token)
const isNumber = token => /[0-9]+/.test(token)

const isValidCharacter = token => /[_a-zA-Z0-9(){}+-\/*<> !]|(:=)/.test(token)

function lex(input) {
	let characters = input.split("")
	console.log(characters)

	let tokens = []
	let currentToken = ""
	for (let index = 0; index < characters.length; index++) {
		currentToken += characters[index]
		console.log(currentToken)

		if(isSpace(characters[index+1]) || (index + 1) == characters.length || (!isIdentifier(characters[index+1]) && !isNumber(characters[index+1]))) {
			if(currentToken == "if" || currentToken == "IF") {
				tokens.push("IF")
				currentToken = ""
			} else if(currentToken == "else" || currentToken == "ELSE") {
				tokens.push("ELSE")
				currentToken = ""
			} else if(currentToken == "while" || currentToken == "WHILE") {
				tokens.push("WHILE")
				currentToken = ""
			} else if(currentToken == "function" || currentToken == "FUNCTION") {
				tokens.push("FUNCTION")
				currentToken = ""
			} else if(currentToken == "TRUE") {
				tokens.push("TRUE")
				currentToken = ""
			} else if(currentToken == "FALSE") {
				tokens.push("FALSE")
				currentToken = ""
			} else if(isIdentifier(currentToken)) {
				tokens.push("IDENTIFIER:" + currentToken.trim())
				currentToken = ""
			} else if(isNumber(currentToken)) {
				tokens.push("NUMBER:" + currentToken.trim())
				currentToken = ""
			} 
		}

		if(isSpace(currentToken)) currentToken = ""

		if(currentToken == ":=") {
			tokens.push("EQUALS")
			currentToken = ""
		} else if(currentToken == "==") {
			tokens.push("EQUALSEQUALS")
			currentToken = ""
		} else if(currentToken == "!=") {
			tokens.push("NOTEQUALS")
			currentToken = ""
		} else if(currentToken == "+") {
			if(characters[index+1] != "=" && characters[index+1] != "+") {
				tokens.push("PLUS")
				currentToken = ""
			}
		} else if(currentToken == "+=") {
			tokens.push("PLUSEQUALS")
			currentToken = ""
		} else if(currentToken == "++") {
			tokens.push("PLUSPLUS")
			currentToken = ""
		} else if(currentToken == "-") {
			if(characters[index+1] != "=" && characters[index+1] != "-") {
				tokens.push("MINUS")
				currentToken = ""
			}
		} else if(currentToken == "-=") {
			tokens.push("MINUSEQUALS")
			currentToken = ""
		} else if(currentToken == "--") {
			tokens.push("MINUSMINUS")
			currentToken = ""
		} else if(currentToken == "*") {
			if(characters[index+1] != "=") {
				tokens.push("TIMES")
				currentToken = ""
			}
		} else if(currentToken == "*=") {
			tokens.push("TIMESEQUALS")
			currentToken = ""
		} else if(currentToken == "/") {
			if(characters[index+1] != "=") {
				tokens.push("DIV")
				currentToken = ""
			}
		} else if(currentToken == "/=") {
			tokens.push("DIVEQUALS")
			currentToken = ""
		} else if(currentToken == ">") {
			if(characters[index+1] != "=") {
				tokens.push("GREATER")
				currentToken = ""
			}
		} else if(currentToken == ">=") {
			tokens.push("GREATEREQUALS")
			currentToken = ""
		} else if(currentToken == "<") {
			if(characters[index+1] != "=") {
				tokens.push("LESSER")
				currentToken = ""
			}
		} else if(currentToken == "<=") {
			tokens.push("LESSEREQUALS")
			currentToken = ""
		} else if(currentToken == "(") {
			tokens.push("LPAREN")
			currentToken = ""
		} else if(currentToken == ")") {
			tokens.push("RPAREN")
			currentToken = ""
		} else if(currentToken == "{") {
			tokens.push("LBRACE")
			currentToken = ""
		} else if(currentToken == "}") {
			tokens.push("RBRACE")
			currentToken = ""
		} else {
			if(!isValidCharacter(characters[index]) && isValidCharacter(characters[index+1])) {
				tokens.push("INVALID:" + currentToken)
				currentToken = ""
			}
		}
	}

	console.log(tokens)
	return tokens
}