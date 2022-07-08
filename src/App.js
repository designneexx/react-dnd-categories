import logo from './logo.svg'
import './App.css'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { forwardRef } from 'react'
import produce from 'immer'
import { arrayMove2d, findDroppable } from './helpers'
import { CategoryTypes, ContainerTypes } from './Types'
import { useMock } from './useMock'
import DndKit from './DndKit'

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: 8 * 2,
  margin: `0 0 ${8}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
})

const DraggableItem = forwardRef(
  ({ content, draggableProps, dragHandleProps, isDragging }, ref) => {
    return (
      <div
        ref={ref}
        {...draggableProps}
        style={getItemStyle(isDragging, draggableProps.style)}
      >
        <div>
          <div {...dragHandleProps}>Перетащи за меня</div>
        </div>
        <div>{content}</div>
      </div>
    )
  }
)

function App() {
  const [items, setItems] = useMock()

  const onDragEnd = (result) => {
    const { destination, source } = result

    if (!destination || !source) return

    setItems((prevState) => {
      return produce(prevState, (draftState) => {
        const [droppableDestination, containerDestination] = findDroppable(
          draftState,
          destination.droppableId
        )
        const [droppableSource, containerSource] = findDroppable(
          draftState,
          source.droppableId
        )

        const isEqContainers = containerDestination === containerSource
        const isEqDroppables = droppableDestination === droppableSource

        if (isEqContainers && !isEqDroppables) return draftState

        const [sourceItems, destinationItems, removedSource] = arrayMove2d(
          [droppableSource.items, droppableDestination.items],
          source.index,
          destination.index
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
          const droppableSourceItem = droppableSource.items[source.index]

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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

      <DragDropContext onDragEnd={onDragEnd} onDragUpdate={console.log}>
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
                    <Droppable droppableId={category.id}>
                      {(providedCategory, providedSnapshot) => (
                        <div
                          ref={providedCategory.innerRef}
                          {...providedCategory.droppableProps}
                        >
                          {category.items.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(draggableProvided, draggableSnapshot) => (
                                <DraggableItem
                                  draggableProps={
                                    draggableProvided.draggableProps
                                  }
                                  ref={draggableProvided.innerRef}
                                  dragHandleProps={
                                    draggableProvided.dragHandleProps
                                  }
                                  content={item.content}
                                  isDragging={draggableSnapshot.isDragging}
                                />
                              )}
                            </Draggable>
                          ))}
                          {providedCategory.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

      <div style={{ padding: '60px 0' }}>
        <DndKit />
      </div>
    </div>
  )
}

export default App
