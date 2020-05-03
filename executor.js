const {createToken, Lexer, CstParser} = require("chevrotain")

// LEXICON

const True = createToken({name: "True", pattern: /true/})
const False = createToken({name: "False", pattern: /false/})

const Plus = createToken({name: "Plus", pattern: /\+/})
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
const PlusAssign = createToken({name: "PlusAssign", pattern: /\+=/})
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

const Comma = createToken({ name: "Comma", pattern: /,/ })

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
	Assign,
	PlusAssign,
	SubtractAssign,
	MultiplyAssign,
	DivideAssign,
	AddOne,
	SubtractOne,
	True,
	False,
	Plus,
	Subtract,
	Multiply,
	Divide,
	Num,
	Identifier,
	WhiteSpace
]

// PARSER

class Parser extends CstParser {
	constructor(input) {
		super(allTokens)
		const $ = this
		
		$.RULE("program", () => {
			$.OR([
				{ALT: () => $.SUBRULE($.expr),
					// IGNORE_AMBIGUITIES: true
				},
				{ALT: () => $.SUBRULE($.func),
					// IGNORE_AMBIGUITIES: true
				},
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
				{ALT: () => $.SUBRULE($.while)}
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
				{ALT:  () => $.SUBRULE($.bool)},
				{ALT:  () => $.SUBRULE($.comparison)}
			])
		})
		
		$.RULE("assignment", () => {
			$.CONSUME(Identifier)
			$.OR([
				{ALT: () => $.CONSUME(Assign)},
				{ALT: () => $.CONSUME(PlusAssign)},
				{ALT: () => $.CONSUME(SubtractAssign)},
				{ALT: () => $.CONSUME(MultiplyAssign)},
				{ALT: () => $.CONSUME(DivideAssign)}
			])
			$.SUBRULE($.expr)
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
				{ALT: () => $.CONSUME(Plus)},
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

const LanguageLexer = new Lexer(allTokens)
const LanguageParser = new Parser()

function lang(input) {
	const lexResult = LanguageLexer.tokenize(input)
	LanguageParser.input = lexResult.tokens
	const CST = LanguageParser.program()
	console.log("Parser: ", LanguageParser)
	console.log(`CST: ${JSON.stringify(CST)}`)
	
	return CST
}

lang("12 + 4")
