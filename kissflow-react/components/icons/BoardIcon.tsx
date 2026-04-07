import { SVGProps } from 'react'

export function BoardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 12 12"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1.5 1.5v2h2v-2h-2ZM1 .5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V1A.5.5 0 0 0 4 .5H1ZM1.5 8.5v2h2v-2h-2Zm-.5-1a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5H1ZM8.5 1.5v2h2v-2h-2ZM8 .5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V1a.5.5 0 0 0-.5-.5H8ZM8.5 8.5v2h2v-2h-2Zm-.5-1a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5H8Z"
        clipRule="evenodd"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8.017 2.833H3.983v-1h4.034v1ZM10.167 3.983v4.034h-1V3.983h1ZM2.833 3.983v4.034h-1V3.983h1ZM8.017 10.533H3.983v-1h4.034v1Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
