/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrCopy = [...arr];

  const compareStrings = (a, b) => {
    const sortASC = a.localeCompare(b, 'ru', { caseFirst: 'upper' });
    const sortDESC = b.localeCompare(a, 'ru', { caseFirst: 'upper' });

    return param === "asc" ? sortASC : sortDESC;
  };

  arrCopy.sort(compareStrings);

  return arrCopy;
}
