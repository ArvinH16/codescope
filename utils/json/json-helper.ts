import { promises as fsPromises } from 'fs';

// Saves some object as a JSON file to the specified file name. 
// Overwrites the file if it already exists. Logs success or error messages to the console.
export async function saveObjectToFile(filename: string, dataObject: any): Promise<void> {
  try {
    const jsonString = JSON.stringify(dataObject, mapReplacer, 2);
    await fsPromises.writeFile(filename, jsonString, { flag: 'w' });
    console.log('File saved successfully!');
  } catch (err) {
    console.error('Error saving file:', err);
  }
}

// Turns a map into a JSON string that can be stored in the database, and then later turned back into a map
export function turnMapToJSON(map: Map<any, any>): string {
  return JSON.stringify(map, mapReplacer);
}

// Lemma function used in turnMapToJSON to 
// convert a map into an array of key-value pairs, which can be turned back into a map later
function mapReplacer(key: string, value: any): any {
  if (value instanceof Map) {
    return Array.from(value.entries());
  }
  return value;
}

// Turns a JSON string back into a map.
//  Also can handle the case where the input is already an array of key-value pairs 
// (in case the JSON was parsed without using the reviver)
export function turnJSONToMap(input: string | [any, any][]): Map<any, any> {
  if (Array.isArray(input)) {
    return new Map(input);
  }
  return JSON.parse(input, mapReviver);
}

// Lemma function used in turnJSONToMap to convert an array of key-value pairs back into a map
function mapReviver(key: string, value: any): any {
  if (Array.isArray(value) && value.length > 0 && value.every(item => Array.isArray(item) && item.length === 2)) {
    return new Map(value);
  }
  return value;
}