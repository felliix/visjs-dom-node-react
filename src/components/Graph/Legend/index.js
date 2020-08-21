import React, { useState } from 'react'
import cn from 'classnames'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import xor from 'lodash/xor'
import './style.scss'

export default React.forwardRef(({ className, groups, hiddenGroups, onToggleGroup }, ref) => {
  const [hidden, setHidden] = useState(hiddenGroups || [])
  
  const handleGroupClick = name => () => {
    const updatedHidden = xor(hidden, [name])
    onToggleGroup && onToggleGroup(updatedHidden, name)
    setHidden(updatedHidden)
  }

  return (
    <div className={cn('Legend', className)} ref={ref}>
      <Accordion preExpanded={['legend']}>
        <AccordionItem uuid='legend'>
          <AccordionItemHeading>
            <AccordionItemButton>
              Legend
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            {groups.map(({ name, color }) => (
              <div
                key={name}
                onClick={handleGroupClick(name)}
                className={'Legend__Legend-item' + (hidden.includes(name) ? '--hidden' : '')}
              >
                <span className='Legend__Legend-color' style={{ backgroundColor: color, borderColor: color }} />
                <span>{name}</span>
              </div>
            ))}
          </AccordionItemPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionItemHeading>
            <AccordionItemButton>
              Highlight
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            asdf
          </AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
})
