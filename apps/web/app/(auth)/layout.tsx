import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className=" ">
      <div className="">{children}</div>
    </div>
  )
}
