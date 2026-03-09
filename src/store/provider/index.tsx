import { Provider } from 'jotai';

export function StoreProvider({ children }: { children: any }) {
  return <Provider>{children}</Provider>;
}
