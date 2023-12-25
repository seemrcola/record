import React, {useEffect, useRef, useState} from "react"
import type {PlasmoCSConfig} from "plasmo"
import cssText from "data-text:~/style.css"
import animationText from "data-text:~/animation.module.css"
import Movebar from "~features/movebar";
import RecordBox from "~features/recordBox";
import {ConfigCard} from "~features/configCard";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText + animationText
  return style
}

const GoogleSidebar = () => {
  const [showRecordBox, setShowRecordBox] = useState(false)
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([])
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([])
  const [cameraMicrophoneStream, setCameraMicrophoneStream] = useState(null)
  const [displayStream, setDisplayStream] = useState(null)
  const recordData = useRef([])
  const mediaRecorder = useRef<MediaRecorder>()
  const [start, setStart] = useState(false)
  
  function toggleRecordBox() {
    setShowRecordBox(!showRecordBox)
    getCameraMicrophone(!showRecordBox)
  }
  
  useEffect(() => {
    getCameraDevices()
    
    // 枚举电脑摄像头设备
    async function getCameraDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices()
      devices.forEach(device => {
        if (device.kind === 'videoinput') setCameraDevices([...cameraDevices, device])
        if (device.kind === 'audioinput') setMicrophoneDevices([...microphoneDevices, device])
      })
    }
  }, []);
  
  async function getCameraMicrophone(recordBoxShow: boolean) {
    if (!recordBoxShow) {
      cameraMicrophoneStream?.getTracks().forEach(track => track.stop())
      setCameraMicrophoneStream(null)
      return false
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {width: 300, height: 300},
      audio: true,
    })
    setCameraMicrophoneStream(stream)
    return true
  }
  
  function toggleStreamState(type: string, state: boolean) {
    if (type === 'audio') {
      cameraMicrophoneStream.getAudioTracks().forEach(track => {
        track.enabled = state
      })
    }
    if (type === 'video') {
      cameraMicrophoneStream.getVideoTracks().forEach(track => {
        track.enabled = state
      })
    }
  }
  
  async function startRecord(state: boolean) {
    setStart(state)
    if (state) {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getDisplayMedia()
      } catch (e) {
        setStart(false)
        return
      }
      setDisplayStream(stream)
      // 开启录制器
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 3000000, // 视频码率
        audioBitsPerSecond: 128000,  // 音频码率
      })
      const recorder = mediaRecorder.current
      recorder.start(1000)
      recorder.ondataavailable = (e) => {
        recordData.current.push(e.data)
      }
      recorder.onstop = () => {
        setStart(false)
        // 关闭录制流
        recorder.stream.getTracks().forEach(track => track.stop())
        // 下载录制文件
        downloadRecord()
        // 关闭全部流
        displayStream.getTracks().forEach(track => track.stop())
        setDisplayStream(null)
        // cameraMicrophoneStream.getTracks().forEach(track => track.stop())
        // setCameraMicrophoneStream(null)
      }
      return
    }
    mediaRecorder.current.stop()
  }
  
  function downloadRecord() {
    const blob = new Blob(recordData.current, {type: 'video/webm'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'your-record.webm'
    a.click()
    // 清空录制数据
    a.remove()
    URL.revokeObjectURL(url)
    recordData.current = []
  }
  
  return (
    <>
      <Movebar toggleRecordBox={toggleRecordBox}/>
      {showRecordBox &&
        <div>
          <RecordBox
            cameraMicrophoneStream={cameraMicrophoneStream}
            startRecord={startRecord}
            start={start}
          />
          <ConfigCard
            cameraDevices={cameraDevices}
            microphoneDevices={microphoneDevices}
            toggleStreamState={toggleStreamState}
            startRecord={startRecord}
            start={start}
          />
        </div>
      }
    </>
  )
}

export default GoogleSidebar
