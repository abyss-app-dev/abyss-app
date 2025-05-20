import { randomId } from '../../utils/ids';
import { RichDocument } from './richDocument';
import type {
    Cell,
    CellCodeParams,
    CellDocumentParams,
    CellHeader2Params,
    CellHeader3Params,
    CellHeaderParams,
    CellTextParams,
    CellType,
    CellXMLElementParams,
    DocumentBuilderParams,
    DynamicCellTemplate,
    StaticCellTemplate,
} from './richDocument.types';

export class RichDocumentTemplate<IParams = Record<string, unknown>> {
    private cells: DynamicCellTemplate<Cell, IParams>[] = [];

    private addCell(cell: DynamicCellTemplate<Cell, IParams>) {
        this.cells.push(cell);
    }

    private extractCells(template: StaticCellTemplate<Cell['content']>): unknown[] {
        if (!template) {
            return [];
        }
        if (Array.isArray(template)) {
            return template;
        }
        return [template];
    }

    private addDocumentResult(type: CellType, result: DocumentBuilderParams<Cell['content'], IParams>) {
        if (typeof result === 'function') {
            this.addCell({
                type: 'dynamic',
                outType: type,
                compile: params => result(params),
            });
            return;
        }

        const cells = this.extractCells(result);
        for (const c of cells) {
            this.addCell({
                type: 'static',
                data: {
                    type: type as Cell['type'],
                    content: c as Cell['content'],
                } as Cell,
            });
        }
    }

    addText(params: CellTextParams<IParams>) {
        this.addDocumentResult('text', params);
        return this;
    }

    addHeader(params: CellHeaderParams<IParams>) {
        this.addDocumentResult('header', params);
        return this;
    }

    addHeader2(params: CellHeader2Params<IParams>) {
        this.addDocumentResult('header2', params);
        return this;
    }

    addHeader3(params: CellHeader3Params<IParams>) {
        this.addDocumentResult('header3', params);
        return this;
    }

    addXMLElement(params: CellXMLElementParams<IParams>) {
        this.addDocumentResult('xmlElement', params);
        return this;
    }

    addCode(params: CellCodeParams<IParams>) {
        this.addDocumentResult('code', params);
        return this;
    }

    addSubDocument(document: CellDocumentParams<IParams>) {
        this.addDocumentResult('document', document);
        return this;
    }

    compile(params: IParams) {
        const resultCells: Cell[] = [];

        for (const cell of this.cells) {
            if (cell.type === 'static') {
                resultCells.push({
                    ...cell.data,
                    id: randomId(),
                    editedAt: Date.now(),
                });
            }

            if (cell.type === 'dynamic') {
                const compiledCells = this.extractCells(cell.compile(params));
                const cells = compiledCells.map(c => ({
                    id: randomId(),
                    editedAt: Date.now(),
                    type: cell.outType,
                    content: c,
                })) as Cell[];
                resultCells.push(...cells);
            }
        }

        return new RichDocument(resultCells);
    }
}
