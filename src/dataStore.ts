import fs from 'fs';
import { Channel, Dm, users, newData } from './interfaces';

export let data: {
  users: users[];
  channels: Channel[];
  dm: Dm[];
  secret: string;
} = {
  users: [],
  channels: [],
  dm: [],
  secret: 'KEVINHINDIEALMINAELSHIBO2394850-92840)_(*%&)_($#&()*',
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
export function getData(): newData {
  const dataString = fs.readFileSync('dataStore.json', 'utf8');
  data = JSON.parse(dataString);
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
export function setData(newData: newData) {
  data = newData;
  fs.writeFileSync('dataStore.json', JSON.stringify(data));
}
