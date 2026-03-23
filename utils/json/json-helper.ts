import { promises as fsPromises } from 'fs';

export async function saveObjectToFile(filename: string, dataObject: any): Promise<void> {
  try {
    const jsonString = JSON.stringify(dataObject, mapReplacer, 2);
    await fsPromises.writeFile(filename, jsonString, { flag: 'w' });
    console.log('File saved successfully!');
  } catch (err) {
    console.error('Error saving file:', err);
  }
}

export function turnMapToJSON(map: Map<any, any>): string {
  return JSON.stringify(map, mapReplacer);
}

function mapReplacer(key: string, value: any): any {
  if (value instanceof Map) {
    return Array.from(value.entries());
  }
  return value;
}


export function turnJSONToMap(input: string | [any, any][]): Map<any, any> {
  if (Array.isArray(input)) {
    return new Map(input);
  }
  return JSON.parse(input, mapReviver);
}

function mapReviver(key: string, value: any): any {
  if (Array.isArray(value) && value.length > 0 && value.every(item => Array.isArray(item) && item.length === 2)) {
    return new Map(value);
  }
  return value;
}