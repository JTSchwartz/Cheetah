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

const Identifier = createToken({name: "Identifier", pattern: /[_a-zA-Z][_a-zA-Z0-9]*/})

const Comma = createToken({name: "Comma", pattern: /,/})

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
	If,
	Else,
	While,
	Function,
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
			$.OR([
				{ALT: () => $.SUBRULE($.expr)},
				{ALT: () => $.SUBRULE($.func)}
			])
		})
		
		$.RULE("func", () => {
			$.CONSUME(Function)
			$.CONSUME(Identifier)
			$.CONSUME(LParen)
			$.MANY_SEP({
				SEP: Comma,
				DEF: () => {
					$.CONSUME2(Identifier)
				}
			})
			$.CONSUME(RParen)
			$.CONSUME(LBracket)
			$.SUBRULE($.expr)
			$.CONSUME(RBracket)
		})
		
		$.RULE("funcCall", () => {
			$.CONSUME(Identifier)
			$.CONSUME(LParen)
			$.MANY_SEP({
				SEP: Comma,
				DEF: () => {
					$.CONSUME2(Identifier)
				}
			})
			$.CONSUME(RParen)
		})
		
		$.RULE("if", () => {
			$.CONSUME(If)
			$.CONSUME(LParen)
			$.SUBRULE($.condition)
			$.CONSUME(RParen)
			$.CONSUME(LBracket)
			$.SUBRULE($.expr)
			$.CONSUME(RBracket)
			$.OPTION(() => {
				$.CONSUME(Else)
				$.CONSUME2(LBracket)
				$.SUBRULE2($.expr)
				$.CONSUME2(RBracket)
			})
		})
		
		$.RULE("while", () => {
			$.CONSUME(While)
			$.CONSUME(LParen)
			$.SUBRULE($.condition)
			$.CONSUME(RParen)
			$.CONSUME(LBracket)
			$.SUBRULE($.expr)
			$.CONSUME(RBracket)
		})
		
		$.RULE("expr", () => {
			$.OR([
				{ALT: () => $.SUBRULE($.unaryExpr)},
				{ALT: () => $.SUBRULE($.condition)},
				{ALT: () => $.SUBRULE($.assignment)},
				{ALT: () => $.SUBRULE($.mathExpr)},
				{ALT: () => $.SUBRULE($.funcCall)},
				{ALT: () => $.SUBRULE($.if)},
				{ALT: () => $.SUBRULE($.while)},
				{ALT: () => $.CONSUME(Num)}
			])
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
				{ALT: () => $.CONSUME2(Num)}
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
// const BaseCstVisitor = LanguageParser.getBaseCstVisitorConstructor()
const BaseCstVisitor = LanguageParser.getBaseCstVisitorConstructorWithDefaults()

class Interpreter extends BaseCstVisitor {
	constructor() {
		super()
		this.validateVisitor()
	}
	
	assignment(ctx) {
		const value = this.visit(ctx.value)
		const id = ctx.id[0].image
		const op = ctx.op[0].tokenType
		
		if (tokenMatcher(op, Assign) || isNaN(value)) { // Defaults to normal assignment if the value is not a number, or if the identifier has not been initialized
			identifiers[id] = value
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
			} else {
				num2 = Number(ctx.Num[0].image)
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
			return num1 == num2
		} else if(tokenMatcher(op, NotEquals)) {
			return num1 != num2
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
		return "function"
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
		var val = 0

		if(ctx.Identifier) {
			// TODO: handle error if id does not exist in identifiers

			const id = ctx.Identifier[0].image
			val = identifiers[id]
		} else {
			val = Number(ctx.Num[0].image)
		}

		const op = this.visit(ctx.unaryOp)

		if(tokenMatcher(op, AddOne)) {
			return val + 1
		} else if(tokenMatcher(op, SubtractOne)) {
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
	
	program(ctx) {
		if (ctx.expr) {
			return this.visit(ctx.expr)
		} else {
			return this.visit(ctx.func)
		}
	}
}

const LanguageInterpreter = new Interpreter()

const identifiers = []

function lang(input) {
	const lexResult = LanguageLexer.tokenize(input)
	LanguageParser.input = lexResult.tokens
	const CST = LanguageParser.program()
	const value = LanguageInterpreter.visit(CST)
	
	//console.log("Parser: ", LanguageParser)
	console.log(`CST: ${JSON.stringify(CST)}`)
	console.log(`Value: ${value}`)
	
	return value
}

console.log("Language Generated in JavaScript - Ajay Patnaik & Jacob Schwartz")

function run() {
	rl.question("=> ", (input) => {
		lang(input)
		run()
	});
}

run()
