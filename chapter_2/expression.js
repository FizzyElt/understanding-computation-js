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
      return new LessThan(this.left.reduce(environment), this.right);
    }
    if (this.right.reducible) {
      return new LessThan(this.left, this.right.reduce(environment));
    }
    return new Bool(this.left.value < this.right.value);
  }
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

const statement = new If(new Variable('x'), new Assign('y', new Num(1)), new DoNothing());

const environment = { x: new Bool(false) };

const machine = new Machine(statement, environment);

machine.run();
