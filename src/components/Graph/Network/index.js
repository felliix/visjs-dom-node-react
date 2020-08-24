import React, { useState, useRef, useEffect, useCallback } from 'react';
import Graph from './react-network';
import Hammer from 'hammerjs';
import './Network.scss';

const getDomNodeStyle = (node, dom) => ({
  ...node,
  widthConstraint: dom.clientWidth,
  heightConstraint: dom.clientHeight,
  shape: 'box',
  margin: 0.01,
  color: {
    border: '#0000',
    background: '#0000',
    highlight: {
      border: '#0000',
      background: '#0000'
    },
    hover: {
      border: '#0000',
      background: '#0000'
    }
  }
})

const decideNodeDom = node => !!node.dom && !node.hidden

function Network(props) {
  const { edges, options, popups, style } = props
  const [nodes, setNodes] = useState(props.nodes)
  const [popupOnEdgeClick, setPopupOnEdgeClick] = useState(null)
  const [popupOnNodeHover, setPopupOnNodeHover] = useState(null)

  const popupOnNodeHoverRef = useRef()
  const popupOnEdgeClickRef = useRef()
  const networkRef = useRef()
  const domRef = useRef({})

  const getNodeDomCount = useCallback(() => {
    return props.nodes.filter(decideNodeDom).length
  }, [props.nodes])

  useEffect(() => {
    domRef.current = {}
    if (getNodeDomCount() === 0) {
      setNodes(props.nodes)
    }
  }, [props.nodes, getNodeDomCount])

  const getDomRef = key => el => {
    const dom = domRef.current
    const network = networkRef.current

    if (!dom[key] && el) {
      dom[key] = el

      if (network) {
        const hammer = new Hammer(el)
        hammer.on('hammer.input', e => e.isFirst && network.body.eventListeners.onTouch(e))
        hammer.on('panstart', network.body.eventListeners.onDragStart)
        hammer.on('panmove', network.body.eventListeners.onDrag)
        hammer.on('panend', network.body.eventListeners.onDragEnd)
        hammer.on('press', network.body.eventListeners.onHold)
        hammer.on('tap', network.body.eventListeners.onTap)
      }

      if (Object.keys(dom).length === getNodeDomCount()) {
        setNodes(props.nodes.map(node => getDomNodeStyle(node, dom[node.id])))
      }
    }
  }

  const handleAfterDrawing = e => {
    const network = networkRef.current
    const dom = domRef.current
    const pos = network.getPositions()
    const scale = network.getScale()
    
    nodes.forEach(({ id }) => {
      if (dom[id]) {
        const { x, y } = network.canvasToDOM({
          x: pos[id].x,
          y: pos[id].y
        })
  
        dom[id].style.left = `${x}px`
        dom[id].style.top = `${y}px`
        dom[id].style.transform = `translate(-50%, -50%) scale(${scale})`
      }
    })
    props.events && props.events.afterDrawing && props.events.afterDrawing(e)
  }

  const handleClick = e => {
    const popupDom = popupOnEdgeClickRef.current

    if (e.edges.length) {
      if (popups && popups.popupOnEdgeClick) {
        popupDom.style.left = e.event.center.x + 'px'
        popupDom.style.top = e.event.center.y + 'px'
        popupDom.style.opacity = 1
        setPopupOnEdgeClick(popups.popupOnEdgeClick(e.edges[0], e))
      }
    } else {
      popupDom.style.opacity = 0
    }
    props.events && props.events.click && props.events.click(e)
  }

  const handleZoom = e => {
    popupOnEdgeClickRef.current.style.opacity = 0
    props.events && props.events.zoom && props.events.zoom(e)
  }

  const handleDragStart = e => {
    popupOnEdgeClickRef.current.style.opacity = 0
    props.events && props.events.dragStart && props.events.dragStart(e)
  }

  const handleHoverNode = e => {
    const network = networkRef.current
    const popupOnNodeHover = popupOnNodeHoverRef.current

    if (popups && popups.popupOnNodeHover && popupOnNodeHover && network) {
      const pos = network.getPosition(e.node)
      const scale = network.getScale()
      const { x, y } = network.canvasToDOM(pos)
      popupOnNodeHover.style.left = `${x}px`
      popupOnNodeHover.style.top = `${y}px`
      popupOnNodeHover.style.transform = `translate(-50%, -50%) scale(${scale}) translateX(50%)`
      setPopupOnNodeHover(popups.popupOnNodeHover(e.node, e))
    }
    props.events && props.events.hoverNode && props.events.hoverNode(e)
  }

  const handleBlurNode = e => {
    setPopupOnNodeHover(null)
    props.events && props.events.blurNode && props.events.blurNode(e)
  }

  const getNetwork = obj => {
    networkRef.current = obj
    props.getNetwork && props.getNetwork(obj)
  }

  const events = {
    ...props.events,
    'afterDrawing': handleAfterDrawing,
    'click': handleClick,
    'zoom': handleZoom,
    'dragStart': handleDragStart,
    'hoverNode': handleHoverNode,
    'blurNode': handleBlurNode
  }

  return (
    <div className='Network' style={style}>
      <Graph
        nodes={nodes}
        edges={edges}
        options={options}
        events={events}
        getNetwork={getNetwork}
      />
      <div className='Network__overlays'>
        {props.nodes.map(node => decideNodeDom(node) && (
          <div
            className='Network__overlay-dom'
            ref={getDomRef(node.id)}
            onMouseMove={networkRef.current && networkRef.current.body.eventListeners.onMouseMove}
            key={node.id}
          >
            {node.dom}
          </div>
        ))}
      </div>
      <div className='Network__popup-edge-click' ref={popupOnEdgeClickRef}>
        {popupOnEdgeClick}
      </div>
      <div className='Network__popup-node-hover' ref={popupOnNodeHoverRef}>
        {popupOnNodeHover}
      </div>
    </div>
  )
}

export default Network
