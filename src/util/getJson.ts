import { readFileSync } from 'fs';

// @ts-ignore @TODO add types for strip-json-comments
import stripJsonComments from 'strip-json-comments';

/**
 *  Get JSON as a JS object from a file, without caring about comments.
 *
 * @param filePath Path to file
 * @returns JS object form of the JSON from file
 */
export default function getJson(filePath: string): any {
  let rawFileData: string = readFileSync(filePath).toString();
  let strippedJson: any = stripJsonComments(rawFileData);
  return JSON.parse(strippedJson);
}