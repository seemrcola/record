import {Icon} from "@iconify/react"
import React, {useEffect, useRef} from "react"
import animationText from "~animation.module.css"

import {useDrag} from "~hooks/useDrag"

interface RecordBoxProps {
  cameraMicrophoneStream: MediaStream | null,
  startRecord: (state: boolean) => void,
  start: boolean
}

const RecordBox: React.FC<RecordBoxProps>
  = ({cameraMicrophoneStream, startRecord, start}) => {
  const dragBoxRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const {handleMouseDown} = useDrag(dragBoxRef)
  
  useEffect(() => {
    if (!cameraMicrophoneStream) return
    videoRef.current.srcObject = cameraMicrophoneStream
  }, [cameraMicrophoneStream])
  
  return (
    <div
      ref={dragBoxRef}
      className={`
        ${animationText.smooth_slideInRight}
        fixed bottom-[10px] left-[10px] h-[240px] w-[240px]
      `}
      onMouseDown={handleMouseDown}>
      <div
        className="w-full h-full rounded-full bg-red-300 overflow-hidden cursor-pointer">
        <video
          autoPlay playsInline muted
          ref={videoRef}
          className="object-cover w-full h-full transform scale-x-[-1]"
        />
      </div>
      <div
        className="
          p-[4px]
          rounded-full border-[2px] border-[#8c8c8d]
          flex items-center bg-[#212121]
          absolute bottom-4 right-0 transform translate-x-[100%]
        "
        onClick={() => start && startRecord(false)}
      >
        <Icon
          icon={!start ? "gg:play-stop-o" : "fluent:record-stop-16-regular"}
          className={`
            ${!start ? 'text-blue-400' : 'text-red-400'}
            h-[40px] w-[40px] text-[#9797a4] rounded-full
            cursor-pointer
          `}
        />
      </div>
    </div>
  )
}

export default RecordBox
