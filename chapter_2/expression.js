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
      const [leftExpression] = this.left.reduce(environment);
      return [new Add(leftExpression, this.right), environment];
    }
    if (this.right.reducible) {
      const [rightExpression] = this.right.reduce(environment);
      return [new Add(this.left, rightExpression), environment];
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
      const [rightExpression] = this.expression.reduce(environment);
      return [new Assign(this.name, rightExpression), environment];
    }

    return [new DoNothing(), { ...environment, [this.name]: this.expression }];
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

const statement = new Assign('x', new Add(new Num(3), new Num(4)));

const environment = { x: new Num(2) };

const machine = new Machine(statement, environment);

machine.run();
