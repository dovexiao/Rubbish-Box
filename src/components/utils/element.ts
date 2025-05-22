import {
  ReactNode,
  Children,
  isValidElement,
  Fragment,
  cloneElement,
} from 'react';
export function isNotObjectAndArray(node: ReactNode) {
  return node === null || typeof node !== 'object';
}

export function isReactElement(node: ReactNode) {
  return (
    node != null &&
    typeof node === 'object' &&
    typeof (node as Iterable<ReactNode>)[Symbol.iterator] !== 'function'
  );
}

export function isReactIterator(node: ReactNode) {
  return (
    node != null &&
    typeof node === 'object' &&
    typeof (node as Iterable<ReactNode>)[Symbol.iterator] === 'function'
  );
}

export function cloneThroughFragments(children: ReactNode): React.ReactNode {
  return Children.map(children, c => {
    if (isValidElement(c)) {
      if (c.type === Fragment) {
        return cloneThroughFragments(c.props.children);
      }
      return cloneElement(c, {...c.props, isWhatever: true});
    }
    return c;
  });
}
