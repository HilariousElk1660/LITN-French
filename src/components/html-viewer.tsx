import parse from 'html-react-parser';

export function HTMLViewer({ htmlString }) {
  return <div>{parse(htmlString)}</div>;
}