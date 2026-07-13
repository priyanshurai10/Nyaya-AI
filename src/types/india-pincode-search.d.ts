declare module 'india-pincode-search' {
  export function search(pincode: string | number): any;
  const pincodeSearch: {
    search: (pincode: string | number) => any;
  };
  export default pincodeSearch;
}
