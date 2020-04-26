function lex(input) {
	let tokens = input.split()
}

const isAssignment = token => /([:+\-*/]=)|\+\+|--/.test(token)
const isBool = token => /#(TRUE)|(FALSE)/.test(token)
const isNum = token => /[0-9]+/.test(token)
const isBooleanOperator = token => /([<>]=)|==/.test(token)
const isNumericalOperator = token => /[+\-*/]/.test(token)
