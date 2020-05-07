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
	Num,
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
				{
					ALT: () => $.SUBRULE($.expr)
				},
				{
					ALT: () => $.SUBRULE($.func)
				}
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
			$.CONSUME2(Num)
		})
		
		$.RULE("unaryExpr", () => {
			$.CONSUME(Identifier)
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
			$.CONSUME(Identifier)
			$.SUBRULE($.bool)
			$.CONSUME(Num)
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

		console.log(op)
		
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
		} else if(ctx.assignment){
			return this.visit(ctx.assignment)
		} else if(ctx.mathExpr) {
			return this.visit(ctx.mathExpr)
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

	mathExpr(ctx) {
		const num1 = Number(ctx.Num[0].image)
		const num2 = Number(ctx.Num[1].image)
		const mathType = this.visit(ctx.numOp)

		if(tokenMatcher(mathType, Add)) {
			return num1 + num2
		} else if(tokenMatcher(mathType, Subtract)) {
			return num1 - num2
		} else if(tokenMatcher(mathType, Multiply)) {
			return num1 * num2
		} else if(tokenMatcher(mathType, Divide)) {
			return num1 / num2
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
