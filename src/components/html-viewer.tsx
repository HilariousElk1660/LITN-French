import parse from 'html-react-parser';

export function HTMLViewer({ htmlString }) {
  if (!typeof htmlString === "string") return null;
  return <div>{parse(htmlString)}</div>;
}