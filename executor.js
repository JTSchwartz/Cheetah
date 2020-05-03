const {createToken, Lexer, CstParser} = require("chevrotain")

const True = createToken({name: "True", pattern: /true/})
const False = createToken({name: "False", pattern: /false/})

const Plus = createToken({name: "Plus", pattern: /\+/})
const Minus = createToken({name: "Minus", pattern: /-/})
const Multiply = createToken({name: "Multiply", pattern: /\*/})
const Divide = createToken({name: "Divide", pattern: /\//})

const AddOne = createToken({name: "AddOne", pattern: /\+\+/})
const SubOne = createToken({name: "SubOne", pattern: /--/})

const Greater = createToken({name: "Greater", pattern: />/})
const GreaterEquals = createToken({name: "GreaterEquals", pattern: />=/})
const Lesser = createToken({name: "Lesser", pattern: /</})
const LesserEqual = createToken({name: "LesserEqual", pattern: /<=/})
const Equals = createToken({name: "Equals", pattern: /==/})
const NotEquals = createToken({name: "NotEquals", pattern: /!=/})

const Assign = createToken({name: "Assign", pattern: /:=/})
const PlusAssign = createToken({name: "PlusAssign", pattern: /\+=/})
const MinusAssign = createToken({name: "MinusAssign", pattern: /-=/})
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
	MinusAssign,
	MultiplyAssign,
	DivideAssign,
	AddOne,
	SubOne,
	True,
	False,
	Plus,
	Minus,
	Multiply,
	Divide,
	Num,
	Identifier,
	WhiteSpace
]

class LanguageParser extends CstParser {
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
			$.CONSUME(LParen)
			$.MANY_SEP({
				SEP: Comma,
				DEF: () => {
					$.CONSUME(Identifier)
				}
			})
			$.CONSUME(RParen)
			$.CONSUME(LBracket)
			$.SUBRULE($.expr)
			$.CONSUME(RBracket)
		})
		
		$.RULE("expr", () => {
			$.OR([
				{ALT: () => $.CONSUME(Num)},
				{ALT: () => $.SUBRULE($.bool)}
			])
		})
		
		$.RULE("condition", () => {
			$.OR([
				{ALT: $.CONSUME($.bool)}
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

function lex(input) {
	const lexResult = LanguageLexer.tokenize(input)
	console.log(lexResult)
}

lex("12 + 4")
