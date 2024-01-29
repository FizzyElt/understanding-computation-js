class Num {
  reducible = false;
  constructor(value) {
    this.value = value;
  }
  toString() {
    return String(this.value);
  }
  inspect() {
    return `(${this.constructor.name} ${this.value})`;
  }
}

function num(value) {
  return new Num(value);
}

class Variable {
  reducible = true;
  constructor(name) {
    this.name = name;
  }
  toString() {
    return this.name;
  }
  inspect() {
    return `(${this.constructor.name} ${this.name})`;
  }

  reduce(environment) {
    return [environment[this.name], environment];
  }
}

function variable(name) {
  return new Variable(name);
}

class Add {
  reducible = true;
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

  reduce(environment) {
    if (this.left.reducible) {
      const [leftExpression, newEnvironment] = this.left.reduce(environment);
      return [new Add(leftExpression, this.right), newEnvironment];
    }
    if (this.right.reducible) {
      const [rightExpression, newEnvironment] = this.right.reduce(environment);
      return [new Add(this.left, rightExpression), newEnvironment];
    }
    return [new Num(this.left.value + this.right.value), environment];
  }
}

function add(left, right) {
  return new Add(left, right);
}

class Multiply {
  reducible = true;
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

  reduce(environment) {
    if (this.left.reducible) {
      const [leftExpression] = this.left.reduce(environment);
      return [new Multiply(leftExpression, this.right), environment];
    }
    if (this.right.reducible) {
      const [rightExpression] = this.right.reduce(environment);
      return [new Multiply(this.left, rightExpression), environment];
    }
    return [new Num(this.left.value * this.right.value), environment];
  }
}

function mul(left, right) {
  return new Multiply(left, right);
}

class Bool {
  reducible = false;
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value ? 'true' : 'false';
  }
  inspect() {
    return `(${this.constructor.name} ${this.value})`;
  }
}

function bool(value) {
  return new Bool(value);
}

class LessThan {
  reducible = true;
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  toString() {
    return `${this.left} < ${this.right}`;
  }

  reduce(environment) {
    if (this.left.reducible) {
      const [leftExpression, newEnvironment] = this.left.reduce(environment);
      return [new LessThan(leftExpression, this.right), newEnvironment];
    }
    if (this.right.reducible) {
      const [rightExpression, newEnvironment] = this.right.reduce(environment);
      return [new LessThan(this.left, rightExpression), newEnvironment];
    }
    return [new Bool(this.left.value < this.right.value), environment];
  }
}

function lessThan(left, right) {
  return new LessThan(left, right);
}

class DoNothing {
  reducible = false;
  toString() {
    return 'do-nothing';
  }
  inspect() {
    return `(${this.constructor.name})`;
  }

  equals(other_statement) {
    return other_statement instanceof DoNothing;
  }
}

function doNothing() {
  return new DoNothing();
}

class Assign {
  reducible = true;
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

  reduce(environment) {
    if (this.expression.reducible) {
      const [rightExpression, newEnvironment] = this.expression.reduce(environment);
      return [new Assign(this.name, rightExpression), newEnvironment];
    }

    return [new DoNothing(), { ...environment, [this.name]: this.expression }];
  }
}

function assign(name, expression) {
  return new Assign(name, expression);
}

class If {
  reducible = true;
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

  reduce(environment) {
    if (this.condition.reducible) {
      const [statement, newEnvironment] = this.condition.reduce(environment);
      return [new If(statement, this.consequence, this.alternative), newEnvironment];
    }

    if (this.condition instanceof Bool && this.condition.value) {
      return [this.consequence, environment];
    }

    if (this.condition instanceof Bool && !this.condition.value) {
      return [this.alternative, environment];
    }

    throw new Error(`Invalid condition: ${this.condition}`);
  }
}

function ifStatement(condition, consequence, alternative) {
  return new If(condition, consequence, alternative);
}

class Sequence {
  reducible = true;
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

  reduce(environment) {
    if (this.first instanceof DoNothing) {
      return [this.second, environment];
    }

    const [firstStatement, newEnvironment] = this.first.reduce(environment);

    return [new Sequence(firstStatement, this.second), newEnvironment];
  }
}

function sequence(first, second) {
  return new Sequence(first, second);
}

class While {
  reducible = true;
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

  reduce(environment) {
    return [new If(this.condition, new Sequence(this.body, this), new DoNothing()), environment];
  }
}

function whileLoop(condition, body) {
  return new While(condition, body);
}

class Machine {
  constructor(statement, environment = {}) {
    this.statement = statement;
    this.environment = environment;
  }

  step() {
    const [statement, environment] = this.statement.reduce(this.environment);
    this.statement = statement;
    this.environment = environment;
  }

  run(logFn = console.log) {
    while (this.statement.reducible) {
      logFn(this.statement.toString(), this.environment);
      this.step();
    }
    logFn(this.statement.toString(), this.environment);
  }
}

function createMachine(statement, environment = {}) {
  return new Machine(statement, environment);
}

const machine = createMachine(
  whileLoop(lessThan(variable('x'), num(5)), assign('x', mul(variable('x'), num(3)))),
  { x: num(1) }
);

machine.run();
