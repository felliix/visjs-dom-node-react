import React from 'react'
import cn from 'classnames'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import './style.scss'

export default React.forwardRef(({ className, groups, onToggleGroup }, ref) => (
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
            <div key={name} className='Legend__Legend-item'>
              <span className='Legend__Legend-color' style={{ backgroundColor: color }} />
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
))
