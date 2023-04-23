/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArr = path.split('.');

  const iterValues = (obj) => {
    let value = obj;

    for (let item of pathArr) {
      if (!result) { return; }

      value = value[item];
    }

    return value;
  };

  return iterValues;
}
