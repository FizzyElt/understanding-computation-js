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

  reduce() {
    if (this.left.reducible) {
      return new Add(this.left.reduce(), this.right);
    }
    if (this.right.reducible) {
      return new Add(this.left, this.right.reduce());
    }
    return new Num(this.left.value + this.right.value);
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

  reduce() {
    if (this.left.reducible) {
      return new Multiply(this.left.reduce(), this.right);
    }
    if (this.right.reducible) {
      return new Multiply(this.left, this.right.reduce());
    }
    return new Num(this.left.value * this.right.value);
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

  reduce() {
    if (this.left.reducible) {
      return new LessThan(this.left.reduce(), this.right);
    }
    if (this.right.reducible) {
      return new LessThan(this.left, this.right.reduce());
    }
    return new Bool(this.left.value < this.right.value);
  }
}

class Machine {
  constructor(expression) {
    this.expression = expression;
  }

  step() {
    this.expression = this.expression.reduce();
  }

  run(logFn = console.log) {
    console.log(this.expression.reducible);
    while (this.expression.reducible) {
      logFn(this.expression.toString());
      this.step();
    }
    logFn(this.expression.toString());
  }
}

const expression = new LessThan(new Num(5), new Add(new Num(2), new Num(2)));

const machine = new Machine(expression);

machine.run();
