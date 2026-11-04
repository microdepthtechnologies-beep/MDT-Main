/** Strip MongoDB ObjectIds and non-plain values so docs can cross the Server→Client boundary. */
export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
