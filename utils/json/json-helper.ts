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

export function turnMapToJSON(obj: Map<any, any>): string {
  return JSON.stringify(obj, mapReplacer, 2);
}

export function turnJSONToMap(jsonString: string): Map<any, any> {
  return JSON.parse(jsonString, mapReviver);
}

function mapReplacer(_: string, value: any) {
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }
  return value;
}

function mapReviver(key: string, value: any) {
  if (value && value.__type === 'Map') {
    return new Map(value.value);
  }
  return value;
}