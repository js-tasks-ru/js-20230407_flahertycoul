/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {return '';}
  if (!size) {return string;}

  let count = 0;

  const strToArr = string.split('');

  const filterstrToArr = strToArr.filter((item, index, arr) => {
    if (item !== arr[index - 1]) {
      count = 0;
    }

    count++;

    return count <= size;
  });

  return filterstrToArr.join('');
}
