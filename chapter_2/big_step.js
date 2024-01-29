class Num {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return String(this.value);
  }
  inspect() {
    return `(${this.constructor.name} ${this.value})`;
  }

  evaluate(environment) {
    return this;
  }
}

function num(value) {
  return new Num(value);
}

class Variable {
  constructor(name) {
    this.name = name;
  }
  toString() {
    return this.name;
  }
  inspect() {
    return `(${this.constructor.name} ${this.name})`;
  }

  evaluate(environment) {
    return environment[this.name];
  }
}

function variable(name) {
  return new Variable(name);
}

class Add {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }
  toString() {
    return `${this.left} + ${this.right}`;
  }
  inspect() {
    return `(${this.constructor.name} ${this.left} ${this.right})`;
  }

  evaluate(environment) {
    return new Num(this.left.evaluate(environment).value + this.right.evaluate(environment).value);
  }
}

function add(left, right) {
  return new Add(left, right);
}

class Multiply {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }
  toString() {
    return `${this.left} * ${this.right}`;
  }
  inspect() {
    return `(${this.constructor.name} ${this.left} ${this.right})`;
  }

  evaluate(environment) {
    return new Num(this.left.evaluate(environment).value * this.right.evaluate(environment).value);
  }
}

function mul(left, right) {
  return new Multiply(left, right);
}

class Bool {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value ? 'true' : 'false';
  }
  inspect() {
    return `(${this.constructor.name} ${this.value})`;
  }

  evaluate(environment) {
    return this;
  }
}

function bool(value) {
  return new Bool(value);
}

class LessThan {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  toString() {
    return `${this.left} < ${this.right}`;
  }

  evaluate(environment) {
    return new Bool(this.left.evaluate(environment).value < this.right.evaluate(environment).value);
  }
}

function lessThan(left, right) {
  return new LessThan(left, right);
}

class DoNothing {
  toString() {
    return 'do-nothing';
  }
  inspect() {
    return `(${this.constructor.name})`;
  }

  equals(other_statement) {
    return other_statement instanceof DoNothing;
  }

  evaluate(environment) {
    return environment;
  }
}

function doNothing() {
  return new DoNothing();
}

class Assign {
  constructor(name, expression) {
    this.name = name;
    this.expression = expression;
  }

  toString() {
    return `${this.name} = ${this.expression}`;
  }

  inspect() {
    return `(${this.constructor.name} ${this.name} ${this.expression})`;
  }

  evaluate(environment) {
    return { ...environment, [this.name]: this.expression.evaluate(environment) };
  }
}

function assign(name, expression) {
  return new Assign(name, expression);
}

class If {
  constructor(condition, consequence, alternative) {
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  toString() {
    return `if ${this.condition} { ${this.consequence} } else { ${this.alternative} }`;
  }

  inspect() {
    return `(${this.constructor.name} ${this.condition} ${this.consequence} ${this.alternative})`;
  }

  evaluate(environment) {
    if (
      this.condition.evaluate(environment) instanceof Bool &&
      this.condition.evaluate(environment).value
    ) {
      return this.consequence.evaluate(environment);
    }
    if (
      this.condition.evaluate(environment) instanceof Bool &&
      !this.condition.evaluate(environment).value
    ) {
      return this.alternative.evaluate(environment);
    }
    throw new Error(`Invalid condition: ${this.condition}`);
  }
}

function ifStatement(condition, consequence, alternative) {
  return new If(condition, consequence, alternative);
}

class Sequence {
  constructor(first, second) {
    this.first = first;
    this.second = second;
  }

  toString() {
    return `${this.first}; ${this.second}`;
  }

  inspect() {
    return `(${this.constructor.name} ${this.first} ${this.second})`;
  }

  evaluate(environment) {
    return this.second.evaluate(this.first.evaluate(environment));
  }
}

function sequence(first, second) {
  return new Sequence(first, second);
}

class While {
  constructor(condition, body) {
    this.condition = condition;
    this.body = body;
  }

  toString() {
    return `while (${this.condition}) { ${this.body} }`;
  }

  inspect() {
    return `(${this.constructor.name} ${this.condition} ${this.body})`;
  }

  evaluate(environment) {
    if (
      this.condition.evaluate(environment) instanceof Bool &&
      this.condition.evaluate(environment).value
    ) {
      return this.evaluate(this.body.evaluate(environment));
    }

    if (
      this.condition.evaluate(environment) instanceof Bool &&
      !this.condition.evaluate(environment).value
    ) {
      return environment;
    }

    throw new Error(`Invalid condition: ${this.condition}`);
  }
}

function whileLoop(condition, body) {
  return new While(condition, body);
}

const result = whileLoop(
  lessThan(variable('x'), num(5)),
  assign('x', mul(variable('x'), num(3)))
).evaluate({ x: num(1) });

console.log(result);
