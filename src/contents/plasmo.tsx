import type {PlasmoCSConfig} from "plasmo"
import cssText from "data-text:~/style.css"

import Movebar from "~features/movebar"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const GoogleSidebar = () => {
  return (
    <Movebar/>
  )
}

export default GoogleSidebar
