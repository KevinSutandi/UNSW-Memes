import { getData, setData } from './dataStore';

/**
 * Resets the internal data of the application to its initial state
 *
 * @param {} none - does not take any parameters
 *
 * @returns {}  - returns {} when it is cleared
 */

export function clearV1() {
  const data = getData();
  data.users = [];
  data.channels = [];
  data.dm = [];
  setData(data);

  return {};
}
