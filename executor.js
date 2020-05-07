const {createToken, Lexer, CstParser, tokenMatcher} = require("chevrotain"), readline = require("readline");

const rl = readline.createInterface({
	input:  process.stdin,
	output: process.stdout
});

// LEXICON

const True = createToken({name: "True", pattern: /true/})
const False = createToken({name: "False", pattern: /false/})

const Add = createToken({name: "Add", pattern: /\+/})
const Subtract = createToken({name: "Subtract", pattern: /-/})
const Multiply = createToken({name: "Multiply", pattern: /\*/})
const Divide = createToken({name: "Divide", pattern: /\//})

const AddOne = createToken({name: "AddOne", pattern: /\+\+/})
const SubtractOne = createToken({name: "SubOne", pattern: /--/})

const Greater = createToken({name: "Greater", pattern: />/})
const GreaterEquals = createToken({name: "GreaterEquals", pattern: />=/})
const Lesser = createToken({name: "Lesser", pattern: /</})
const LesserEqual = createToken({name: "LesserEqual", pattern: /<=/})
const Equals = createToken({name: "Equals", pattern: /==/})
const NotEquals = createToken({name: "NotEquals", pattern: /!=/})

const Assign = createToken({name: "Assign", pattern: /:=/})
const AddAssign = createToken({name: "AddAssign", pattern: /\+=/})
const SubtractAssign = createToken({name: "SubtractAssign", pattern: /-=/})
const MultiplyAssign = createToken({name: "MultiplyAssign", pattern: /\*=/})
const DivideAssign = createToken({name: "DivideAssign", pattern: /\/=/})

const LParen = createToken({name: "LParen", pattern: /\(/})
const RParen = createToken({name: "RParen", pattern: /\)/})
const LBracket = createToken({name: "LBracket", pattern: /{/})
const RBracket = createToken({name: "RBracket", pattern: /}/})

const If = createToken({name: "If", pattern: /if/})
const Else = createToken({name: "Else", pattern: /else/})
const While = createToken({name: "While", pattern: /while/})
const Function = createToken({name: "Function", pattern: /function/})
const Print = createToken({name: "Print", pattern: /print/})

const Identifier = createToken({name: "Identifier", pattern: /[_a-zA-Z][_a-zA-Z0-9]*/})

const Comma = createToken({name: "Comma", pattern: /,/})
const Semicolon = createToken({name: "Semicolon", pattern: /;/})

const Num = createToken({
	name:    "Num",
	pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
})

const WhiteSpace = createToken({
	name:    "WhiteSpace",
	pattern: /[ \t\n\r]+/,
	// ignore whitespace
	group:   Lexer.SKIPPED
})

const allTokens = [
	Num,
	LParen,
	RParen,
	LBracket,
	RBracket,
	Comma,
	Semicolon,
	If,
	Else,
	While,
	Function,
	Print,
	GreaterEquals,
	Greater,
	LesserEqual,
	Lesser,
	Equals,
	NotEquals,
	AddAssign,
	SubtractAssign,
	MultiplyAssign,
	DivideAssign,
	Assign,
	AddOne,
	SubtractOne,
	True,
	False,
	Add,
	Subtract,
	Multiply,
	Divide,
	Identifier,
	WhiteSpace
]

const LanguageLexer = new Lexer(allTokens)

// PARSER

class Parser extends CstParser {
	constructor(input) {
		super(allTokens)
		const $ = this
		
		$.RULE("program", () => {
			$.MANY_SEP({
				SEP: Semicolon,
				DEF: () => {
					$.SUBRULE($.expr)
				}
			})
		})
		
		$.RULE("func", () => {
			$.CONSUME(Function)
			$.CONSUME(Identifier, {LABEL: "id"})
			$.CONSUME(LParen)
			$.MANY_SEP({
				SEP: Comma,
				DEF: () => {
					$.CONSUME2(Identifier)
				}
			})
			$.CONSUME(RParen)
			$.CONSUME(LBracket)
			$.SUBRULE($.program, {LABEL: "declaration"})
			$.CONSUME(RBracket)
		})
		
		$.RULE("funcCall", () => {
			$.CONSUME(Identifier, {LABEL: "id"})
			$.CONSUME(LParen)
			$.SUBRULE($.parameters)
			$.CONSUME(RParen)
		})
		
		$.RULE("parameters", () => {
			$.MANY_SEP({
				SEP: Comma,
				DEF: () => {
					$.OR([
						{ALT: () => $.CONSUME2(Identifier)},
						{ALT: () => $.CONSUME(True)},
						{ALT: () => $.CONSUME(False)},
						{ALT: () => $.CONSUME(Num)}
					
					])
				}
			})
		})
		
		$.RULE("ifOp", () => {
			$.CONSUME(If)
			$.CONSUME(LParen)
			$.SUBRULE($.condition)
			$.CONSUME(RParen)
			$.CONSUME(LBracket)
			$.SUBRULE($.program)
			$.CONSUME(RBracket)
			$.OPTION(() => {
				$.CONSUME(Else)
				$.CONSUME2(LBracket)
				$.SUBRULE2($.program, {LABEL: "elseExpr"})
				$.CONSUME2(RBracket)
			})
		})
		
		$.RULE("whileOp", () => {
			$.CONSUME(While)
			$.CONSUME(LParen)
			$.SUBRULE($.condition)
			$.CONSUME(RParen)
			$.CONSUME(LBracket)
			$.SUBRULE($.program)
			$.CONSUME(RBracket)
		})
		
		$.RULE("expr", () => {
			$.OR([
				{ALT: () => $.SUBRULE($.unaryExpr)},
				{ALT: () => $.SUBRULE($.condition)},
				{ALT: () => $.SUBRULE($.assignment)},
				{ALT: () => $.SUBRULE($.mathExpr)},
				{ALT: () => $.SUBRULE($.funcCall)},
				{ALT: () => $.SUBRULE($.ifOp)},
				{ALT: () => $.SUBRULE($.whileOp)},
				{ALT: () => $.SUBRULE($.printOp)},
				{ALT: () => $.SUBRULE($.func)},
				{ALT: () => $.CONSUME(Num)}
			])
		})

		$.RULE("printOp", () => {
			$.CONSUME(Print)
			$.CONSUME(Identifier)
		})
		
		$.RULE("mathExpr", () => {
			$.OR([
				{ALT: () => $.CONSUME(Num)},
				{ALT: () => $.CONSUME(Identifier)}
			])
			$.SUBRULE($.numOp)
			$.OR2([
				{ALT: () => $.CONSUME2(Num)},
				{ALT: () => $.CONSUME2(Identifier)}
			])
		})
		
		$.RULE("unaryExpr", () => {
			$.OR([
				{ALT: () => $.CONSUME(Identifier)},
				{ALT: () => $.CONSUME(Num)}
			])
			$.SUBRULE($.unaryOp)
		})
		
		$.RULE("condition", () => {
			$.OR([
				{ALT: () => $.SUBRULE($.bool)},
				{ALT: () => $.SUBRULE($.comparison)}
			])
		})
		
		$.RULE("assignment", () => {
			$.CONSUME(Identifier, {LABEL: "id"})
			$.OR([
				{ALT: () => $.CONSUME(Assign, {LABEL: "op"})},
				{ALT: () => $.CONSUME(AddAssign, {LABEL: "op"})},
				{ALT: () => $.CONSUME(SubtractAssign, {LABEL: "op"})},
				{ALT: () => $.CONSUME(MultiplyAssign, {LABEL: "op"})},
				{ALT: () => $.CONSUME(DivideAssign, {LABEL: "op"})}
			])
			$.SUBRULE($.expr, {LABEL: "value"})
		})
		
		$.RULE("comparison", () => {
			$.OR([
				{ALT: () => $.CONSUME(Identifier)},
				{ALT: () => $.CONSUME(Num)}
			])
			$.SUBRULE($.boolOp)
			$.OR2([
				{ALT: () => $.CONSUME2(Identifier)},
				{ALT: () => $.CONSUME2(Num)},
				{ALT: () => $.SUBRULE($.bool)}
			])
		})
		
		$.RULE("boolOp", () => {
			$.OR([
				{ALT: () => $.CONSUME(Greater)},
				{ALT: () => $.CONSUME(GreaterEquals)},
				{ALT: () => $.CONSUME(Lesser)},
				{ALT: () => $.CONSUME(LesserEqual)},
				{ALT: () => $.CONSUME(Equals)},
				{ALT: () => $.CONSUME(NotEquals)}
			])
		})
		
		$.RULE("numOp", () => {
			$.OR([
				{ALT: () => $.CONSUME(Add)},
				{ALT: () => $.CONSUME(Subtract)},
				{ALT: () => $.CONSUME(Multiply)},
				{ALT: () => $.CONSUME(Divide)}
			])
		})
		
		$.RULE("unaryOp", () => {
			$.OR([
				{ALT: () => $.CONSUME(AddOne)},
				{ALT: () => $.CONSUME(SubtractOne)}
			])
		})
		
		$.RULE("bool", () => {
			$.OR([
				{ALT: () => $.CONSUME(True)},
				{ALT: () => $.CONSUME(False)}
			])
		})
		
		this.performSelfAnalysis()
	}
}

const LanguageParser = new Parser()

// Switch to without Defaults once all visitor methods have been implemented
const BaseCstVisitor = LanguageParser.getBaseCstVisitorConstructor()
// const BaseCstVisitor = LanguageParser.getBaseCstVisitorConstructorWithDefaults()

class Interpreter extends BaseCstVisitor {
	constructor() {
		super()
		this.validateVisitor()
	}
	
	assignment(ctx) {
		const value = this.visit(ctx.value)
		const id = ctx.id[0].image
		const op = ctx.op[0].tokenType
		
		if (tokenMatcher(op, Assign)) { // Defaults to normal assignment if the value is not a number, or if the identifier has not been initialized
			if (isNaN(value)) {
				identifiers[id] = value === "true"
			} else {
				identifiers[id] = value
			}
		}
		
		if (!(id in identifiers)) {
			throw "Identifier must be initialized before attempting computation"
		} else if (tokenMatcher(op, AddAssign)) {
			identifiers[id] += value
		} else if (tokenMatcher(op, SubtractAssign)) {
			identifiers[id] -= value
		} else if (tokenMatcher(op, MultiplyAssign)) {
			identifiers[id] *= value
		} else if (tokenMatcher(op, DivideAssign)) {
			identifiers[id] /= value
		}
		
		return identifiers[id]
	}
	
	expr(ctx) {
		if (ctx.Num) {
			return Number(ctx.Num[0].image)
		} else if(ctx.assignment) {
			return this.visit(ctx.assignment)
		} else if(ctx.mathExpr) {
			return this.visit(ctx.mathExpr)
		} else if(ctx.condition) {
			return this.visit(ctx.condition)
		} else if(ctx.unaryExpr) {
			return this.visit(ctx.unaryExpr)
		} else if(ctx.ifOp) {
			return this.visit(ctx.ifOp)
		} else if(ctx.whileOp) {
			return this.visit(ctx.whileOp)
		} else if(ctx.printOp) {
			return this.visit(ctx.printOp)
		} else if(ctx.func) {
			return this.visit(ctx.func)
		}else if(ctx.funcCall) {
			return this.visit(ctx.funcCall)
		}
	}

	condition(ctx) {
		if(ctx.bool) {
			const val = this.visit(ctx.bool)
			if(tokenMatcher(val, True)) {
				return true
			} else if(tokenMatcher(val, False)) {
				return false
			}
		} else if(ctx.comparison) {
			return this.visit(ctx.comparison)
		}
	}

	comparison(ctx) {
		var num1 = 0
		var num2 = 0

		if(ctx.Identifier) {
			//TODO: error handling

			const id1 = ctx.Identifier[0].image
			num1 = identifiers[id1]

			if(ctx.Identifier[1]) {
				const id2 = ctx.Identifier[1].image
				num2 = identifiers[id2]
			} else if (ctx.Num) {
				num2 = Number(ctx.Num[0].image)
			} else {
				num2 = ctx.bool[0].image === "true"
			}
		} else {
			num1 = Number(ctx.Num[0].image)
			num2 = Number(ctx.Num[1].image)
		}
		
		const op = this.visit(ctx.boolOp)

		if(tokenMatcher(op, Greater)) {
			return num1 > num2
		} else if(tokenMatcher(op, GreaterEquals)) {
			return num1 >= num2
		} else if(tokenMatcher(op, Lesser)) {
			return num1 < num2
		} else if(tokenMatcher(op, LesserEqual)) {
			return num1 <= num2
		} else if(tokenMatcher(op, Equals)) {
			return num1 === num2
		} else if(tokenMatcher(op, NotEquals)) {
			return num1 !== num2
		}
	}

	bool(ctx) {
		if(ctx.True) {
			return ctx.True[0].tokenType
		} else if(ctx.False) {
			return ctx.False[0].tokenType
		}
	}
	
	func(ctx) {
		const name = ctx.id[0].image
		const parameters = ctx.Identifier.map(x => x.image)
		identifiers[name] = {params: parameters, pgm: JSON.parse(JSON.stringify(ctx.declaration[0]))}
		
		
		
		return "function"
	}
	
	funcCall(ctx) {
		const name = ctx.id[0].image
		
		if (!(name in identifiers)) throw `Function ${name} does not exist`
		
		const paramNames = identifiers[name].params
		const parameters = this.visit(ctx.parameters)
		
		if (paramNames.length !== parameters.length) throw `Improper number of parameters`
		
		const bindingHolder = {}
		for (let variable in paramNames) {
			if (identifiers[variable]) bindingHolder[variable] = identifiers[variable]
		}
		
		for (let i = 0; i < parameters.length; i++) identifiers[paramNames[i]] = parameters[i]
		
		this.visit(identifiers[name].pgm)
		
		identifiers = {...identifiers, ...bindingHolder}
		return "functionCall"
	}
	
	parameters(ctx) {
		let all = []

		if (ctx.Num) {
			all.push(...ctx.Num)
		}
		
		if (ctx.True) {
			all.push(...ctx.True)
		}
		
		if (ctx.False) {
			all.push(...ctx.False)
		}
		
		if (ctx.Identifier) {
			all.push(...ctx.Identifier)
		}

		all = all.sort((a, b) => a.startOffset - b.startOffset)

		all = all.map(token => {
			if (tokenMatcher(token.tokenType, Identifier)) {
				return identifiers[token.image]
			} else if (tokenMatcher(token.tokenType, Num)) {
				return Number(token.image)
			} else if (tokenMatcher(token.tokenType, True)) {
				return true
			} else if (tokenMatcher(token.tokenType, False)) {
				return false
			}
		})
		
		return all
	}

	numOp(ctx) {
		if(ctx.Add) {
			return ctx.Add[0].tokenType
		} else if(ctx.Subtract) {
			return ctx.Subtract[0].tokenType
		} else if(ctx.Multiply) {
			return ctx.Multiply[0].tokenType
		} else if(ctx.Divide) {
			return ctx.Divide[0].tokenType
		}
	}

	boolOp(ctx) {
		if(ctx.Greater) {
			return ctx.Greater[0].tokenType
		} else if(ctx.GreaterEquals) {
			return ctx.GreaterEquals[0].tokenType
		} else if(ctx.Lesser) {
			return ctx.Lesser[0].tokenType
		} else if(ctx.LesserEqual) {
			return ctx.LesserEqual[0].tokenType
		} else if(ctx.Equals) {
			return ctx.Equals[0].tokenType
		} else if(ctx.NotEquals) {
			return ctx.NotEquals[0].tokenType
		}
	}

	mathExpr(ctx) {
		var num1 = 0
		var num2 = 0

		if(ctx.Identifier) {
			//TODO: error handling

			const id1 = ctx.Identifier[0].image
			num1 = identifiers[id1]

			if(ctx.Identifier[1]) {
				const id2 = ctx.Identifier[1].image
				num2 = identifiers[id2]
			} else {
				num2 = Number(ctx.Num[0].image)
			}
		} else {
			num1 = Number(ctx.Num[0].image)
			num2 = Number(ctx.Num[1].image)
		}

		const op = this.visit(ctx.numOp)

		if(tokenMatcher(op, Add)) {
			return num1 + num2
		} else if(tokenMatcher(op, Subtract)) {
			return num1 - num2
		} else if(tokenMatcher(op, Multiply)) {
			return num1 * num2
		} else if(tokenMatcher(op, Divide)) {
			return num1 / num2
		}
	}

	unaryExpr(ctx) {
		var val = undefined
		var id = undefined

		if(ctx.Identifier) {
			// TODO: handle error if id does not exist in identifiers

			id = ctx.Identifier[0].image
			val = identifiers[id]
		} else {
			val = Number(ctx.Num[0].image)
		}

		const op = this.visit(ctx.unaryOp)

		if(tokenMatcher(op, AddOne)) {
			identifiers[id] = val + 1
			return val + 1
		} else if(tokenMatcher(op, SubtractOne)) {
			identifiers[id] = val - 1
			return val - 1
		}
	}

	unaryOp(ctx) {
		if(ctx.AddOne) {
			return ctx.AddOne[0].tokenType
		} else if(ctx.SubOne) {
			return ctx.SubOne[0].tokenType
		}
	}
	
	ifOp(ctx) {
		const condition = this.visit(ctx.condition)
		const expr = this.visit(ctx.program)
		let elseExpr = undefined

		if(ctx.elseExpr) { elseExpr = this.visit(ctx.elseExpr) }

		if(condition) {
			return expr
		} else {
			if(elseExpr) {
				return elseExpr
			} else {
				return undefined
			}
		}
	}

	printOp(ctx) {
		const id = ctx.Identifier[0].image
		console.log(`=> ${identifiers[id]}`)
	}

	// while (val < 4) {val++}
	whileOp(ctx) {
		while(this.visit(ctx.condition)) {
			this.visit(ctx.program)
		}
	}
	
	program(ctx) {
		const expressions = Object.values(ctx)[0]
		
		for (let i = 0; i < expressions.length; i++) {
			this.visit(expressions[i])
		}
	}
}

const LanguageInterpreter = new Interpreter()

let identifiers = []

function lang(input) {
	const lexResult = LanguageLexer.tokenize(input)
	LanguageParser.input = lexResult.tokens
	const CST = LanguageParser.program()
	LanguageInterpreter.visit(CST)
}

console.log("Language Generated in JavaScript - Ajay Patnaik & Jacob Schwartz")

function run() {
	rl.question("$ ", (input) => {
		lang(input)
		run()
	});
}

run()
