class Num {
  constructor(value) {
    this.value = value;
    this.reducible = false;
  }
  toString() {
    return String(this.value);
  }
  inspect() {
    return `(${this.constructor.name} ${this.value})`;
  }
}

class Add {
  constructor(left, right) {
    this.left = left;
    this.right = right;
    this.reducible = true;
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
  constructor(left, right) {
    this.left = left;
    this.right = right;
    this.reducible = true;
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

let expression = new Add(
  new Multiply(new Num(1), new Num(2)),
  new Multiply(new Num(3), new Num(4))
);
console.log(expression.toString());

while (expression.reducible) {
  expression = expression.reduce();
  console.log(expression.toString());
}
