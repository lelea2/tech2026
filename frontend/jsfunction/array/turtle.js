/**
 * Turtle simulation class.
 *
 * The turtle starts at:
 * - Position: (0, 0)
 * - Facing: North
 *
 * Directions are stored in clockwise order:
 * North -> East -> South -> West
 *
 * We track:
 * - x/y coordinates
 * - current direction index
 *
 * Time Complexity:
 * - All operations are O(1)
 */
export default class Turtle {
  constructor() {
    this.x = 0;
    this.y = 0;
    // driection in clockwise order
    // north -> east -> south -> west
    this.directions = ['N', 'E', 'S', 'W'];
    this.directionIndex = 0; // start facing north
  }

  /**
   * @param {number} distance Distance to move forward while facing the current direction.
   * @returns {Turtle}
   */
  forward(distance) {
    const direction = this.directions[this.directionIndex];
    switch (direction) {
      case 'N':
        this.y += distance;
        break;
      case 'E':
        this.x += distance;
        break;
      case 'S':
        this.y -= distance;
        break;
      case 'W':
        this.x -= distance;
        break;
    }
    return this;
  }

  /**
   * @param {number} distance Distance to move backward while facing the current direction.
   * @returns {Turtle}
   */
  backward(distance) {
    const direction = this.directions[this.directionIndex];
    switch(direction) {
      case 'N':
        this.y -= distance;
        break;
      case 'E':
        this.x -= distance;
        break;
      case 'S':
        this.y += distance;
        break;
      case 'W':
        this.x += distance;
        break;
    }
    return this;
  }

  /**
   * Turns the turtle left.
   * @returns {Turtle}
   */
  left() {
    // rotate counter clockwise
    this.directionIndex = (this.directionIndex + 3) % 4;
    return this;
  }

  /**
   * Turns the turtle right.
   * @returns {Turtle}
   */
  right() {
    // rotate clockwise
    this.directionIndex = (this.directionIndex + 1) % 4;
    return this;
  }

  /**
   * @returns {[number, number]} Coordinates [x, y]
   */
  position() {
    return [this.x, this.y];
  }
}