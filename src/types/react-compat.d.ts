declare namespace React {
  interface Attributes { key?: any }
  type ReactNode = any
  type CSSProperties = Record<string, any>
  type HTMLAttributes<T = any> = Record<string, any> & { children?: any; className?: string; style?: any; onClick?: any }
  type InputHTMLAttributes<T = any> = HTMLAttributes<T> & { value?: any; onChange?: any; type?: string }
  type ButtonHTMLAttributes<T = any> = HTMLAttributes<T> & { disabled?: boolean; type?: string }
  type SVGProps<T = any> = HTMLAttributes<T> & { width?: any; height?: any; viewBox?: string; fill?: string; stroke?: string; strokeWidth?: any; strokeLinecap?: string; strokeLinejoin?: string }
  type ComponentPropsWithoutRef<T = any> = any
  type FC<P = any> = (props: P) => any
  type ComponentType<P = any> = (props: P) => any
}

declare module 'react' {
  export as namespace React
  export type ReactNode = React.ReactNode
  export type CSSProperties = React.CSSProperties
  export type HTMLAttributes<T = any> = React.HTMLAttributes<T>
  export type InputHTMLAttributes<T = any> = React.InputHTMLAttributes<T>
  export type ButtonHTMLAttributes<T = any> = React.ButtonHTMLAttributes<T>
  export type SVGProps<T = any> = React.SVGProps<T>
  export type ComponentPropsWithoutRef<T = any> = React.ComponentPropsWithoutRef<T>
  export type FC<P = any> = React.FC<P>
  export type ComponentType<P = any> = React.ComponentType<P>
  export function createElement(type: any, props?: any, ...children: any[]): any
  export function isValidElement(value: any): boolean
  export const Children: { toArray(children: any): any[] }
  export function createContext<T = any>(value: T): any
  export function useContext(ctx: any): any
  export function useState<T = any>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void]
  export function useEffect(effect: () => any, deps?: any[]): void
  export function useMemo<T = any>(factory: () => T, deps?: any[]): T
  export function useCallback<T = any>(factory: T, deps?: any[]): T
  export function useRef<T = any>(value?: T): { current: T }
  export function useSyncExternalStore(subscribe: any, getSnapshot: any, getServerSnapshot?: any): any
  export function forwardRef<T = any, P = any>(render: (props: P, ref: any) => any): any
  export function lazy(loader: any): any
  export const Suspense: any
  export const StrictMode: any
  const ReactDefault: any
  export default ReactDefault
}

declare module 'react/jsx-runtime' {
  export const Fragment: any
  export function jsx(type: any, props: any, key?: any): any
  export function jsxs(type: any, props: any, key?: any): any
}

declare module 'react-dom/client' {
  export function createRoot(container: any): { render(node: any): void }
}

declare namespace JSX {
  interface IntrinsicAttributes extends React.Attributes {}
  interface IntrinsicElements {
    [elemName: string]: any
  }
}
