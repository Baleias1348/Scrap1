// Provide minimal JSX/React ambient types until deps are installed, to silence editor errors.
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}