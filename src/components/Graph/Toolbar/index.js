import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStop, faSave, faWrench, faSitemap, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import Legend from '../Legend'
import './style.scss'

export default ({ groups, onToggleGroup, onFitWindow, onSearch }) => {
  const [showLegend, setShowLegend] = useState(false)
  const legendRef = useRef();

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    }
  }, [])

  const handleClick = e => {
    if (legendRef.current && !legendRef.current.contains(e.target)) {
      setShowLegend(false);
    }
  }

  const handleSearchChange = e => {
    const q = e.target.value
    if (e.which === 13 || q.length === 0) {
      onSearch && onSearch(q)
    }
  }

  const handleLegendHover = () => setShowLegend(true)

  return (
    <div className='Toolbar'>
      <input
        className='Toolbar__SearchNetwork'
        placeholder='Search this network'
        onKeyUp={handleSearchChange}
      />
      <div>
        <span
          title='Fit to window'
          onClick={onFitWindow}
          className='Toolbar__Tool'
        >
          <FontAwesomeIcon icon={faStop} />
        </span>
        <span title='Save network' className='Toolbar__Tool'>
          <FontAwesomeIcon icon={faSave} />
        </span>
        <span onMouseEnter={handleLegendHover} className='Toolbar__Tool'>
          <FontAwesomeIcon icon={faWrench} />
        </span>
      </div>

      {showLegend && (
        <Legend
          className='Toolbar__Legend'
          onToggleGroup={onToggleGroup}
          groups={groups}
          ref={legendRef}
        />
      )}
    </div>
  )
}
