class Token {
	_value
	
	constructor(val) {
		this._value = val
	}
	
	get() {
		return this._value
	}
}

class Assignment extends Token {
	
	constructor(op) {
		if (!(op in [":=", "+=", "-=", "*=", "/=", "++", "--"])) throw "Assignment: Not a valid assignment type."
		
		super(op)
	}
	
	operation(identifier, value = null) {
		switch (this._value) {
			case ":=":   identifier.set(value); break
			case "+=":  identifier.set(identifier.get + value); break
			case "-=":  identifier.set(identifier.get - value); break
			case "*=":  identifier.set(identifier.get * value); break
			case "/=":  identifier.set(identifier.get / value); break
			case "++":  identifier.set(identifier.get + 1); break
			case "--":  identifier.set(identifier.get - 1); break
		}
	}
}

class Bool extends Token {
	
	constructor(val) {
		if (val !== "#TRUE" && val !== "#FALSE") throw "Boolean: Not a valid boolean value"
		super(val);
	}
	
	get() {
		return this._value === "#TRUE";
	}
	
	toNum() {
		return new Num(this._value ? 1 : 0)
	}
}

class Num extends Token {
	
	constructor(val) {
		const parsed = Number
		if (isNaN(Number(val))) throw "Number: Not a valid number value"
		
		super(Number(val))
	}
	
	set(val) {
		this._value = val
	}
}

class Operator extends Token {
	
	constructor(op) {
		if (!(op in ["+", "-", "*", "/", ">", ">=", "<", "<="])) throw "Operation: Not a valid operation type."
		
		super(op)
	}
	
	operation(a, b) {
		let value;
		
		switch (this._value) {
			case "+":   value = a + b; break
			case "-":   value = a - b; break
			case "*":   value = a * b; break
			case "/":   value = a / b; break
			case ">":   value = a > b; break
			case ">=":  value = a >= b; break
			case "<":   value = a < b; break
			case "<=":  value = a <= b; break
		}
	}
}

class BooleanOperator extends Operator{
	constructor(op) {
		if (!(op in [">", ">=", "<", "<=", "==", "!="])) throw "Operation: Not a valid operation type."
		
		super(op)
	}
	
	operation(a, b) {
		let value;
		
		switch (this._value) {
			case ">":   value = a > b; break
			case ">=":  value = a >= b; break
			case "<":   value = a < b; break
			case "<=":  value = a <= b; break
			case "==":  value = a === b; break
			case "!=":  value = a !== b; break
		}
		
		return new Bool(value ? "#TRUE" : "#FALSE")
	}
}

class NumericalOperator extends Operator{
	constructor(op) {
		if (!(op in ["+", "-", "*", "/"])) throw "Operation: Not a valid operation type."
		
		super(op)
	}
	
	operation(a, b) {
		switch (this._value) {
			case "+":   return new Num(a + b)
			case "-":   return new Num(a - b)
			case "*":   return new Num(a * b)
			case "/":   return new Num(a / b)
		}
	}
}
