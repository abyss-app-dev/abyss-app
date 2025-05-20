import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { Cell, CellType } from './richDocument.types';
import { serializeCells } from './serialize/serialze';

export class RichDocument {
    public readonly cells: Cell[] = [];

    constructor(cells: Cell[] = []) {
        this.cells = cells;
    }

    //
    // Getters
    //

    public getCell(id: string): Cell | undefined {
        return this.cells.find(cell => cell.id === id);
    }

    public getCells(): Cell[] {
        return [...this.cells];
    }

    public getCellCount(): number {
        return this.cells.length;
    }

    public getCellIds(): string[] {
        return this.cells.map(cell => cell.id);
    }

    public getCellTypes(): CellType[] {
        return this.cells.map(cell => cell.type);
    }

    public async render(db: SQliteClient): Promise<string> {
        return serializeCells(this.cells, db);
    }

    //
    // Edit
    //

    public addCellAtStart(cell: Cell) {
        this.cells.unshift(cell);
    }

    public addCellAtEnd(cell: Cell) {
        this.cells.push(cell);
    }

    public addCellAfter(id: string, cell: Cell) {
        const index = this.cells.findIndex(c => c.id === id);
        if (index === -1) return;
        this.cells.splice(index + 1, 0, cell);
    }

    public addCellBefore(id: string, cell: Cell) {
        const index = this.cells.findIndex(c => c.id === id);
        if (index === -1) return;
        this.cells.splice(index, 0, cell);
    }

    public replaceCell(id: string, cell: Cell) {
        const index = this.cells.findIndex(c => c.id === id);
        if (index === -1) return;
        this.cells[index] = cell;
    }

    public deleteCell(id: string) {
        const index = this.cells.findIndex(c => c.id === id);
        if (index === -1) return;
        this.cells.splice(index, 1);
    }
}
