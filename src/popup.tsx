import {Icon} from "@iconify/react"

import "~style.css"

const Header = () => {
  return (
    <header
      className="flex items-center px-2 h-10 w-full bg-[teal] text-[#fff]"
    >
      <Icon
        icon="fluent:record-stop-20-regular"
        className="h-8 w-8 mr-2 cursor-pointer"
      />
      <span className="text-5 font-bold"> Recorder X </span>
    </header>
  )
}

const IndexPopup = () => {
  return (
    <div className="w-40 rounded-[4] overflow-hidden">
      <Header></Header>
    </div>
  )
}

export default IndexPopup

