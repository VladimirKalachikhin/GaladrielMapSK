var CoordinateNumber;

CoordinateNumber = class CoordinateNumber {
  constructor(coordinateNumbers) {
    coordinateNumbers = this.normalizeCoordinateNumbers(coordinateNumbers);
    this.sign = this.normalizedSignOf(coordinateNumbers[0]);
    [this.degrees, this.minutes, this.seconds, this.milliseconds] = coordinateNumbers.map(Math.abs);
  }

  normalizeCoordinateNumbers(coordinateNumbers) {
    var currentNumber, i, j, len, normalizedNumbers;
    normalizedNumbers = [0, 0, 0, 0];
    for (i = j = 0, len = coordinateNumbers.length; j < len; i = ++j) {
      currentNumber = coordinateNumbers[i];
      normalizedNumbers[i] = parseFloat(currentNumber);
    }
    return normalizedNumbers;
  }

  normalizedSignOf(number) {
    if (number >= 0) {
      return 1;
    } else {
      return -1;
    }
  }

  detectSpecialFormats() {
    if (this.degreesCanBeSpecial()) {
      if (this.degreesCanBeMilliseconds()) {
        return this.degreesAsMilliseconds();
      } else if (this.degreesCanBeDegreesMinutesAndSeconds()) {
        return this.degreesAsDegreesMinutesAndSeconds();
      } else if (this.degreesCanBeDegreesAndMinutes()) {
        return this.degreesAsDegreesAndMinutes();
      }
    }
  }

  degreesCanBeSpecial() {
    var canBe;
    canBe = false;
    if (!this.minutes && !this.seconds) {
      canBe = true;
    }
    return canBe;
  }

  degreesCanBeMilliseconds() {
    var canBe;
    if (this.degrees > 909090) {
      canBe = true;
    } else {
      canBe = false;
    }
    return canBe;
  }

  degreesAsMilliseconds() {
    this.milliseconds = this.degrees;
    return this.degrees = 0;
  }

  degreesCanBeDegreesMinutesAndSeconds() {
    var canBe;
    if (this.degrees > 9090) {
      canBe = true;
    } else {
      canBe = false;
    }
    return canBe;
  }

  degreesAsDegreesMinutesAndSeconds() {
    var newDegrees;
    newDegrees = Math.floor(this.degrees / 10000);
    this.minutes = Math.floor((this.degrees - newDegrees * 10000) / 100);
    this.seconds = Math.floor(this.degrees - newDegrees * 10000 - this.minutes * 100);
    return this.degrees = newDegrees;
  }

  degreesCanBeDegreesAndMinutes() {
    var canBe;
    if (this.degrees > 360) {
      canBe = true;
    } else {
      canBe = false;
    }
    return canBe;
  }

  degreesAsDegreesAndMinutes() {
    var newDegrees;
    newDegrees = Math.floor(this.degrees / 100);
    this.minutes = this.degrees - newDegrees * 100;
    return this.degrees = newDegrees;
  }

  toDecimal() {
    var decimalCoordinate;
    decimalCoordinate = this.sign * (this.degrees + this.minutes / 60 + this.seconds / 3600 + this.milliseconds / 3600000);
    return decimalCoordinate;
  }

};


