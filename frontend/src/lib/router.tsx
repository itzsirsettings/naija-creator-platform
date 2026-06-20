"use client"

/**
 * React Router → Next.js navigation compatibility shim.
 *
 * The app was migrated from react-router to the Next.js App Router. To keep every
 * page/component body byte-identical (and the design untouched), consumers import
 * the same named primitives from here instead of "react-router" / "react-router-dom".
 *
 * Only the import module specifier changed in each file; usage stayed the same.
 */

import NextLink from "next/link"
import {
  useRouter,
  usePathname,
  useSearchParams as useNextSearchParams,
} from "next/navigation"
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react"

type AnchorProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "style" | "children">

interface LinkProps extends AnchorProps {
  to: string
  replace?: boolean
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
}

/** react-router <Link to="..."> → next/link href="..." */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, children, ...props },
  ref,
) {
  return (
    <NextLink ref={ref} href={to} replace={replace} {...props}>
      {children}
    </NextLink>
  )
})

interface NavRenderState {
  isActive: boolean
  isPending: boolean
  isTransitioning: boolean
}

interface NavLinkProps extends AnchorProps {
  to: string
  end?: boolean
  replace?: boolean
  className?: string | ((state: NavRenderState) => string | undefined)
  style?: React.CSSProperties | ((state: NavRenderState) => React.CSSProperties | undefined)
  children?: ReactNode | ((state: NavRenderState) => ReactNode)
}

/** react-router <NavLink> with isActive-aware className/style/children. */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, end, replace, className, style, children, ...props },
  ref,
) {
  const pathname = usePathname() ?? "/"
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
  const state: NavRenderState = { isActive, isPending: false, isTransitioning: false }

  const resolvedClassName = typeof className === "function" ? className(state) : className
  const resolvedStyle = typeof style === "function" ? style(state) : style
  const resolvedChildren = typeof children === "function" ? children(state) : children

  return (
    <NextLink
      ref={ref}
      href={to}
      replace={replace}
      className={resolvedClassName}
      style={resolvedStyle}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive ? "true" : undefined}
      {...props}
    >
      {resolvedChildren}
    </NextLink>
  )
})

interface NavigateOptions {
  replace?: boolean
  state?: unknown
}

/** react-router useNavigate(): navigate(to, { replace }) or navigate(delta). */
export function useNavigate() {
  const router = useRouter()
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (to === -1) router.back()
      else if (to === 1) router.forward()
      else if (typeof window !== "undefined") window.history.go(to)
      return
    }
    if (options?.replace) router.replace(to)
    else router.push(to)
  }
}

interface Location {
  pathname: string
  search: string
  hash: string
  state: unknown
  key: string
}

/** react-router useLocation() → { pathname, search, hash, state }. */
export function useLocation(): Location {
  const pathname = usePathname() ?? "/"
  const searchParams = useNextSearchParams()
  const search = searchParams?.toString() ?? ""
  return {
    pathname,
    search: search ? `?${search}` : "",
    hash: typeof window !== "undefined" ? window.location.hash : "",
    state: null,
    key: "default",
  }
}

type SetSearchParams = (
  next:
    | URLSearchParams
    | Record<string, string>
    | ((prev: URLSearchParams) => URLSearchParams | Record<string, string>),
) => void

/** react-router useSearchParams() → [searchParams, setSearchParams]. */
export function useSearchParams(): [URLSearchParams, SetSearchParams] {
  const next = useNextSearchParams()
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  const current = new URLSearchParams(next?.toString() ?? "")

  const setSearchParams: SetSearchParams = (value) => {
    const resolved = typeof value === "function" ? value(new URLSearchParams(current.toString())) : value
    const params = resolved instanceof URLSearchParams ? resolved : new URLSearchParams(resolved)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return [current, setSearchParams]
}
