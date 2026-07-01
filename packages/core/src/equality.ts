import { isPlainObject } from "./utils.js";

export function deepJsonEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (left === null || right === null) {
    return false;
  }

  if (typeof left !== typeof right) {
    return false;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    for (let index = 0; index < left.length; index += 1) {
      if (!deepJsonEqual(left[index], right[index])) {
        return false;
      }
    }

    return true;
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    for (const key of leftKeys) {
      if (!Object.prototype.hasOwnProperty.call(right, key)) {
        return false;
      }

      if (!deepJsonEqual(left[key], right[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}
