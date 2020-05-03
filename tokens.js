class Token {
	_value
	
	constructor(val) {
		this._value = val
	}
	
	get() {
		return this._value
	}
	
	set(value) {
		this._value = value
	}
}

class Assignment extends Token {
	
	constructor(op) {
		if (!(op in ["EQUALS", "PLUSEQUALS", "MINUSEQUALS", "TIMESEQUALS", "DIVEQUALS", "PLUS+", "MINUS-"])) throw "Assignment: Not a valid assignment type."
		
		super(op)
	}
	
	operation(identifier, value = null) {
		switch (this._value) {
			case "EQUALS":   identifier.set(value); break
			case "PLUSEQUALS":  identifier.set(identifier.get + value); break
			case "MINUSEQUALS":  identifier.set(identifier.get - value); break
			case "TIMESEQUALS":  identifier.set(identifier.get * value); break
			case "DIVEQUALS":  identifier.set(identifier.get / value); break
			case "PLUSPLUS":  identifier.set(identifier.get + 1); break
			case "MINUSMINUS":  identifier.set(identifier.get - 1); break
		}
	}
}

class Bool extends Token {
	
	constructor(val) {
		if (val !== "TRUE" && val !== "FALSE") throw "Boolean: Not a valid boolean value"
		super(val === "TRUE");
	}
	
	get() {
		return this._value;
	}
	
	toNum() {
		return new Num(this._value ? 1 : 0)
	}
}

class Num extends Token {
	
	constructor(val) {
		if (isNaN(Number(val))) throw "Number: Not a valid number value"
		
		super(Number(val))
	}
}

class Operator extends Token {
	
	constructor(op) {
		if (!(op in ["PLUS", "MINUS", "TIMES", "DIV", "GREATER", "GREATEREQUALS", "LESSER", "LESSEREQUALS"])) throw "Operation: Not a valid operation type."
		
		super(op)
	}
	
	operation(a, b) {
		let value;
		
		switch (this._value) {
			case "PLUS":   value = a + b; break
			case "MINUS":   value = a - b; break
			case "TIMES":   value = a * b; break
			case "DIV":   value = a / b; break
			case "GREATER":   value = a > b; break
			case "GREATEREQUALS":  value = a >= b; break
			case "LESSER":   value = a < b; break
			case "LESSEREQUALS":  value = a <= b; break
		}
	}
}

class BooleanOperator extends Operator{
	constructor(op) {
		if (!(op in ["GREATER", "GREATEREQUALS", "LESSER", "LESSEREQUALS", "EQUALSEQUALS", "NOTEQUALS"])) throw "Operation: Not a valid operation type."
		
		super(op)
	}
	
	operation(a, b) {
		let value;
		
		switch (this._value) {
			case "GREATER":   value = a > b; break
			case "GREATEREQUALS":  value = a >= b; break
			case "LESSER":   value = a < b; break
			case "LESSEREQUALS":  value = a <= b; break
			case "EQUALSEQUALS":  value = a === b; break
			case "NOTEQUALS":  value = a !== b; break
		}
		
		return new Bool(value ? "#TRUE" : "#FALSE")
	}
}

class NumericalOperator extends Operator{
	constructor(op) {
		if (!(op in ["PLUS", "MINUS", "TIMES", "DIV"])) throw "Operation: Not a valid operation type."
		
		super(op)
	}
	
	operation(a, b) {
		switch (this._value) {
			case "PLUS":   return new Num(a + b)
			case "MINUS":   return new Num(a - b)
			case "TIMES":   return new Num(a * b)
			case "DIV":   return new Num(a / b)
		}
	}
}

class Identifier extends Token {
	_assignment = null
	
	constructor(name) {
		super(name);
	}
	
	get() {
		return this._assignment
	}
	
	set(value) {
		this._assignment = value
	}
}
