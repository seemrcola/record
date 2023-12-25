import {useEffect, useRef, useState} from "react"

export const useDrag = (domRef) => {
  const [dragging, setDragging] = useState(false)
  let startPosition = useRef({x: 0, y: 0})
  
  const handleMouseDown = (e) => {
    setDragging(true)
    startPosition.current = {x: e.clientX, y: e.clientY}
  }
  
  const handleMouseMove = (e) => {
    e.preventDefault()
    if (!dragging) return
    // 计算偏移
    const {clientX, clientY} = e
    const deltaX = clientX - startPosition.current.x
    const deltaY = clientY - startPosition.current.y
    // 获取当前位置
    const {left, top} = domRef.current.getBoundingClientRect()
    // 更新位置
    domRef.current.style.left = `${left + deltaX}px`
    domRef.current.style.top = `${top + deltaY}px`
    // 更新起始点
    startPosition.current = {x: clientX, y: clientY}
  }
  
  const handleMouseUp = (e) => {
    e.preventDefault()
    setDragging(false)
  }
  
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging])
  
  return {
    dragging,
    handleMouseDown
  }
}
