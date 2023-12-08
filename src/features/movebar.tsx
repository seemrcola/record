import {useEffect, useRef, useState} from 'react'
import {Icon} from '@iconify/react'

/**
 * @param cb 回调函数
 * @param queue 回调函数队列
 * @description
 * 优化性能，防止频繁触发
 */
export function rafDebounce(cb: () => void, queue: any[]) {
  queue.push(cb)
  requestAnimationFrame(() => {
    if (queue.length !== 0) {
      const lastCallback = queue.pop()
      lastCallback && lastCallback()
      queue.length = 0
    }
  })
}

const Movebar = () => {
  // 处理屏幕中心点 -----------------------------------------
  const [center, setCenter] = useState({centerX: 0, centerY: 0})
  
  useEffect(() => {
    calcScreenCenter()
    
    function calcScreenCenter() {
      const documentElement = document.documentElement
      const centerX = documentElement.clientWidth / 2
      const centerY = documentElement.clientHeight / 2
      setCenter({centerX, centerY})
    }
    
    window.addEventListener('resize', calcScreenCenter)
    return () => {
      window.removeEventListener('resize', calcScreenCenter)
    }
  }, [])
  
  
  // 处理鼠标移动 -----------------------------------------
  let isMove = false
  let start = {startX: 0, startY: 0}
  const movebarRef = useRef<HTMLDivElement>()      // 移动的元素
  const borderRef = useRef<HTMLDivElement>()       // 边框
  const tasks = []                                 // 任务队列
  const shadows = {                                // 阴影
    left: useRef<HTMLDivElement>(),
    right: useRef<HTMLDivElement>(),
    top: useRef<HTMLDivElement>(),
    bottom: useRef<HTMLDivElement>(),
  }
  
  function mousedownHandler(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    isMove = true
    start = {startX: e.clientX, startY: e.clientY}
    
    document.addEventListener('mousemove', mousemoveHandler)
    document.addEventListener('mouseup', mouseupHandler)
    
    borderRef.current.style.opacity = '1'    // 显示边框
    Object.values(shadows).forEach(item => { // 显示阴影
      item.current.style.opacity = '1'
    })
  }
  
  function mousemoveHandler(e: MouseEvent) {
    // 去掉页面的选中效果
    e.preventDefault()
    if (!isMove) return
    const task = () => {
      const {clientX, clientY} = e
      // 作差算出移动距离
      const deltaX = clientX - start.startX
      const deltaY = clientY - start.startY
      // 获取当前left top
      const {left, top} = movebarRef.current.getBoundingClientRect()
      // 移动元素
      movebarRef.current.style.left = `${left + deltaX}px`
      movebarRef.current.style.top = `${top + deltaY}px`
      // 更新start
      start = {startX: clientX, startY: clientY}
      // 阴影
      adsorb(false)
    }
    rafDebounce(task, tasks) // 优化性能
  }
  
  function mouseupHandler(e: MouseEvent) {
    isMove = false
    document.removeEventListener('mousemove', mousemoveHandler)
    document.removeEventListener('mouseup', mouseupHandler)
    
    borderRef.current.style.opacity = '0'
    setTimeout(() => {
      Object.values(shadows).forEach(item => {
        item.current.style.opacity = '0'
      })
    }, 300)
    adsorb(true)
  }
  
  // 放开鼠标的时候，我们需要根据屏幕对角线的中心点，将屏幕分成四个部分，判断元素在哪个部分，然后移动到对应的边
  function adsorb(ifMove = false) {
    // 1. 获取元素的中心点
    const {left, top, width, height} = movebarRef.current.getBoundingClientRect()
    const elementCenterX = left + width / 2
    const elementCenterY = top + height / 2
    // 2. 获取屏幕的中心点
    const {centerX, centerY} = center
    // 3. 判断元素在哪个部分
    // 3.1算出屏幕两个对角线的函数 （屏幕中心点为原点）
    const k1 = centerY / centerX // 左下角到右上角
    const f1 = x => k1 * x
    const k2 = -centerY / centerX // 左上角到右下角
    const f2 = x => k2 * x
    // 3.2算出鼠标到是在两函数的哪一侧
    /**
     * k1下方K2上方 right
     * k1上方K2下方 left
     * k1上方K2上方 top
     * k1下方K2下方 bottom
     */
    let position = ''
    const x = elementCenterX - centerX
    const y = elementCenterY - centerY
    if (y < f1(x) && y < f2(x)) position = 'top'
    if (y > f1(x) && y > f2(x)) position = 'bottom'
    if (y > f1(x) && y < f2(x)) position = 'left'
    if (y < f1(x) && y > f2(x)) position = 'right'
    // 3.3 位置映射到屏幕边缘
    if (position === 'top')
      shadows.top.current.style.left = `${elementCenterX - 16}px`
    if (position === 'bottom')
      shadows.bottom.current.style.left = `${elementCenterX - 16}px`
    if (position === 'left')
      shadows.left.current.style.top = `${elementCenterY - 16}px`
    if (position === 'right')
      shadows.right.current.style.top = `${elementCenterY - 16}px`
    // 是否需要移动moveRef元素
    if (!ifMove) return
    // 3.4. 移动元素
    movebarRef.current.style.transition = 'all 0.3s'
    requestAnimationFrame(() => {
      if (position === 'right')
        movebarRef.current.style.left = `${document.documentElement.clientWidth - width}px`
      if (position === 'left')
        movebarRef.current.style.left = `0px`
      if (position === 'top')
        movebarRef.current.style.top = `0px`
      if (position === 'bottom')
        movebarRef.current.style.top = `${document.documentElement.clientHeight - height}px`
    })
    // 3.5. 去掉动画
    setTimeout(() => {
      movebarRef.current.style.transition = ''
    }, 150) // 这里略小于动画时间 有一种吸附的效果
    
  }
  
  return (
    <>
      <div
        ref={movebarRef}
        className="
        w-12 h-12 flex items-center justify-center
        bg-amber-100 rounded-full p-2
        fixed left-5 top-5"
        onMouseDown={e => mousedownHandler(e)}
      >
        <Icon icon='icon-park:movie' className="text-4xl cursor-pointer"/>
      </div>
      <div
        ref={borderRef}
        className="
        opacity-0 transition-[300]
        h-[100vh] w-[100vw]
        box-border border-[8px] border-solid border-[#f60]
        fixed left-0 top-0
        pointer-events-none"
      />
      <div
        ref={shadows.left}
        className="
        movebar-shadow-left h-[32px] w-[8px] rounded-[4px] bg-blue-500
        fixed left-0 top-0 opacity-0"
      />
      <div
        ref={shadows.right}
        className="
        movebar-shadow-right h-[32px] w-[8px] rounded-[4px] bg-blue-500
        fixed right-0 bottom-0 opacity-0"
      />
      <div
        ref={shadows.top}
        className="
        movebar-shadow-top w-[32px] h-[8px] rounded-[4px] bg-blue-500
        fixed left-0 top-0 opacity-0"
      />
      <div
        ref={shadows.bottom}
        className="
        movebar-shadow-bottom w-[32px] h-[8px] rounded-[4px] bg-blue-500
        fixed right-0 bottom-0 opacity-0"
      />
    </>
  )
}

export default Movebar
