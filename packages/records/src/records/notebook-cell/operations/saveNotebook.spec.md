# Save Notebook Tests
Tests are in ./saveNotebook.test.ts for source in ./saveNotebook.ts

The goal is to take a set of notebook cells and then perform database operations to update the database to match the new set of cells using methods in notebook-cell.ts

There should be static data saved in a .mocking.ts file that can be used to provide sample cell states for the tests and for the database.

Tests Cases are detailed below:

### Cell Notebook Save Operations
- when you have an empty original notebook
    - when you no new cells no operations are performed
    - when you have new cells
        - all new cells are created with correct orderIndex and parentCellId
- when you have an original notebook with cells
    - when you have no new cells all cells are deleted
    - when you have new cells
        - when the new cells start with a cell you have never seen before, all cells are updated to increment the orderIndex and a new cells is created with the correct orderIndex and parentCellId at the start
        - when the new cells start with a cell you have seen before
            - if the cell properties are the same, no operations are performed on that cell
            - if the cell properties are different, the cell is updated with the new properties
        - when the new cells dont have a cell you have seen before
            - the missing cell is deleted
        - when the new cells contain two cells with the same id the first cells is treated as the original cell and the second cell is treated as a new cell.
            - The first cell is updated if its properties are different than the original
            - the first cell is untouched if its properties are the same as the original
            - the second cell is created with the correct orderIndex and parentCellId compared to the rest of the cells
    - when there are many differences, all the above rules are applied resulting in possibly many updates
        - when we have deletions of many cells
        - when we have updates of many cells
        - when we have insertions of many cells
        - when we have many deletions, updates, and insertions
        - when we have many deletions, updates, and insertions of many cells
        - when we have many deletions, updates, and insertions of many cells