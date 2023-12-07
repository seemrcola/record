import {Button} from "~features/button"
import {Icon} from '@iconify/react'
import "~style.css"

const Header = () => {
  return (
    <header className="flex items-center px-2 h-10 w-full bg-[teal] text-[#fff] ">
      <Icon icon='fluent:record-stop-20-regular' className="h-8 w-8 mr-2"></Icon>
      <span className="text-5 font-bold"> Recorder X </span>
    </header>
  )
}

function IndexPopup() {
  function goto() {
    // todo: goto tab
  }
  
  return (
    <div className="w-40 rounded-[4] overflow-hidden">
      <Header></Header>
      <main className="flex items-center justify-center h-16">
        <div className="w-30">
          <Button text={'Click Me'} onClick={goto}/>
        </div>
      </main>
    </div>
  )
}

export default IndexPopup
