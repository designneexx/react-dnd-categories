export const longHash = () => Math.random().toString(32).slice(2).repeat(2)

export function arrayMove2d(
  [source, destination],
  sourceIndex,
  destinationIndex
) {
  const newSource = Array.from(source)
  const [removed] = newSource.splice(sourceIndex, 1)

  if (source === destination) {
    newSource.splice(destinationIndex, 0, removed)

    return [newSource, newSource]
  }

  const newDestination = Array.from(destination)

  newDestination.splice(destinationIndex, 0, removed)

  return [newSource, newDestination, removed]
}

export function findDroppable(list, id) {
  let droppable = null
  let container = null

  list.forEach((containerItem) => {
    containerItem.items.forEach((droppableItem) => {
      if (droppableItem.id === id) {
        droppable = droppableItem
        container = containerItem
      }
    })
  })

  return [droppable, container]
}
