import React, { useState } from 'react'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import { useMock } from './useMock'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { arrayMove2d, findDroppable } from './helpers'
import produce from 'immer'
import { CategoryTypes, ContainerTypes } from './Types'

function Droppable({ items, id, children }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <SortableContext items={items} id={id}>
      <div ref={setNodeRef}>{children}</div>
    </SortableContext>
  )
}

function Box({ listeners, content }) {
  return (
    <div
      style={{
        width: '100%',
        margin: '8px 0',
        height: '100px',
        backgroundColor: 'gray',
      }}
    >
      <div>
        <div {...listeners}>Перетащи за меня</div>
      </div>
      <div>{content}</div>
    </div>
  )
}

function SortableItem({ id, content }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Box content={content} listeners={listeners} />
    </div>
  )
}

export default function DndKit() {
  const [activeDragItem, setActiveDragItem] = useState(null)
  const [items, setItems] = useMock()

  function onDragStart({ active, over }) {
    const [droppable] = findDroppable(
      items,
      active.data.current.sortable.containerId
    )
    const item = droppable.items[active.data.current.sortable.index]

    if (item) {
      setActiveDragItem(item)
    }
  }

  function onDragOver({ active, over }) {
    const activeSortable = active.data.current?.sortable
    const overSortable = over.data.current?.sortable

    if (!activeSortable || !overSortable) return

    setItems((prevState) => {
      return produce(prevState, (draftState) => {
        const [droppableDestination, containerDestination] = findDroppable(
          draftState,
          overSortable.containerId
        )
        const [droppableSource, containerSource] = findDroppable(
          draftState,
          activeSortable.containerId
        )

        const isEqContainers = containerDestination === containerSource
        const isEqDroppables = droppableDestination === droppableSource

        if (isEqContainers && !isEqDroppables) return draftState

        const [sourceItems, destinationItems, removedSource] = arrayMove2d(
          [droppableSource.items, droppableDestination.items],
          activeSortable.index,
          overSortable.index
        )

        const isDropToAvailable =
          containerSource.type === ContainerTypes.Current && !isEqContainers
        const isDropToCurrent =
          containerSource.type === ContainerTypes.Available && !isEqContainers

        const isTrashDroppable =
          droppableDestination.type === CategoryTypes.Trash

        if (isDropToAvailable && !isTrashDroppable) {
          const trash = containerDestination.items.find(
            (category) => category.type === CategoryTypes.Trash
          )

          if (trash) {
            droppableSource.items = sourceItems

            trash.items.push(removedSource)
          }

          return draftState
        }

        if (isDropToCurrent && !isEqDroppables) {
          const droppableSourceItem =
            droppableSource.items[activeSortable.index]

          const category = containerDestination.items.find(
            (category) => category.type === droppableSourceItem?.type
          )

          if (category) {
            droppableSource.items = sourceItems

            category.items.push(removedSource)
          }

          return draftState
        }

        if (
          containerSource.type === ContainerTypes.Available &&
          droppableSource.type !== CategoryTypes.Trash
        ) {
          return draftState
        }

        droppableSource.items = sourceItems
        droppableDestination.items = destinationItems
      })
    })
  }

  function onDragEnd() {
    setActiveDragItem(null)
  }

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      collisionDetection={closestCorners}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: '30px',
          width: '800px',
          paddingBottom: '80px',
        }}
      >
        {items.map((container) => (
          <div key={container.id}>
            <h1>{container.title}</h1>
            <div style={{ height: '300px', overflowY: 'auto' }}>
              {container.items.map((category) => (
                <div
                  key={category.id}
                  style={{
                    display: category.items.length ? 'block' : 'none',
                  }}
                >
                  <h3>{category.title}</h3>
                  <Droppable items={category.items} id={category.id}>
                    <div>
                      {category.items.map((item) => (
                        <SortableItem
                          id={item.id}
                          content={item.content}
                          key={item.id}
                        />
                      ))}
                    </div>
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeDragItem ? <Box content={activeDragItem.content} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
